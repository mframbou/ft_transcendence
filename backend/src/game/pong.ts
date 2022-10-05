import { IGamePlayer, IGameRoom } from '../interfaces/interfaces';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { WsPaddleMoveDto } from '../interfaces/dtos';

interface IBall
{
	x: number;
	y: number;
	width: number,
	height: number,
	velocityX: number;
	velocityY: number;
	speed: number;
}

interface IPaddle
{
	x: number;
	y: number;
	width: number;
	height: number;
}

interface IPLayer
{
	paddle: IPaddle;
	score: number;
}


const BALL_UPDATES_PER_SECOND = 15;
const PADDLE_UPDATES_PER_SECOND = 30;

// Basis for width / height, but in the end only the ratio matters
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;

const BALL_RADIUS = 10;
const BALL_SPEED = 500; // units per second
// Time in ms between scoring and re-launching the ball
const BALL_RESET_PAUSE_TIME = 500;

const MAX_SCORE = 11;

// we consider the ball squared, then do this: https://www.gamedev.net/articles/programming/general-and-gameplay-programming/swept-aabb-collision-detection-and-response-r3084/
// with deflection
// 0.5 = collision in the middle of the frame, 0 = collision at the start, 1 = no collision
function getCollision(ball: IBall, collider: {x: number, y: number, width: number, height: number}, deltaTimeMultiplier: number): { normalX: number, normalY: number, time: number }
{
	// make ball and targetBall x in the top left corner
	const ballPos = {x: ball.x - ball.width / 2, y: ball.y - ball.height / 2};

	let xInvEntry: number;
	let yInvEntry: number;
	let xInvExit: number;
	let yInvExit: number;

	if (ball.velocityX > 0)
	{
		xInvEntry = collider.x - (ballPos.x + ball.width);
		xInvExit = (collider.x + collider.width) - ballPos.x;
	}
	else
	{
		xInvEntry = (collider.x + collider.width) - ballPos.x;
		xInvExit = collider.x - (ballPos.x + ball.width);
	}

	if (ball.velocityY > 0)
	{
		yInvEntry = collider.y - (ballPos.y + ball.height);
		yInvExit = (collider.y + collider.height) - ballPos.y;
	}
	else
	{
		yInvEntry = (collider.y + collider.height) - ballPos.y;
		yInvExit = collider.y - (ballPos.y + ball.height);
	}

	let xEntry: number;
	let yEntry: number;
	let xExit: number;
	let yExit: number;

	if (ball.velocityX === 0)
	{
		xEntry = -Infinity;
		xExit = Infinity;
	}
	else
	{
		xEntry = xInvEntry / (ball.velocityX * deltaTimeMultiplier);
		xExit = xInvExit / (ball.velocityX * deltaTimeMultiplier);
	}

	if (ball.velocityY === 0)
	{
		yEntry = -Infinity;
		yExit = Infinity;
	}
	else
	{
		yEntry = yInvEntry / (ball.velocityY * deltaTimeMultiplier);
		yExit = yInvExit / (ball.velocityY * deltaTimeMultiplier);
	}

	const entryTime = Math.max(xEntry, yEntry);
	const exitTime = Math.min(xExit, yExit);

	// no collision
	if (entryTime > exitTime || (xEntry < 0 && yEntry < 0) || xEntry > 1 || yEntry > 1)
	{
		return { normalX: 0, normalY: 0, time: 1 };
	}

	// collision
	let normalX: number = 0;
	let normalY: number = 0;

	if (xEntry > yEntry)
	{
		if (xInvEntry < 0)
			normalX = 1;
		else
			normalX = -1;
	}
	else
	{
		if (yInvEntry < 0)
			normalY = 1;
		else
			normalY = -1;
	}

	return { normalX, normalY, time: entryTime };
}

function computeBallUpdate(ball: IBall, paddle1: IPaddle, paddle2: IPaddle, deltaTimeMultiplier: number)
{
	const paddle = ball.velocityX < 0 ? paddle1 : paddle2;
	let collision = getCollision(ball, paddle, deltaTimeMultiplier);

	// https://stackoverflow.com/questions/38765194/conditionally-initializing-a-constant-in-javascript
	const collisionYObject = (() => {
		if (ball.y + ball.height / 2 + ball.velocityY * deltaTimeMultiplier * collision.time >= CANVAS_HEIGHT)
		{
			return { x: 0, y: CANVAS_HEIGHT, width: CANVAS_WIDTH, height: 1 };
		}
		else
		{
			return { x: 0, y: -1, width: CANVAS_WIDTH, height: 1 };
		}
	})();
	let collisionY = getCollision(ball, collisionYObject, deltaTimeMultiplier);

	// Just in case multiple collisions happen on same frame (either very low frame rate server-side or very unlucky)
	// collision (y or x)
	if (collision.time !== 1 || collisionY.time !== 1)
	{
		while (collision.time < 1 || collisionY.time < 1)
		{
			const minTime = Math.min(collision.time, collisionY.time);
			const remainingTime = 1 - minTime;

			ball.x += ball.velocityX * deltaTimeMultiplier * minTime;
			ball.y += ball.velocityY * deltaTimeMultiplier * minTime;

			if (collision.time < collisionY.time)
			{
				if (collision.normalX !== 0)
				{
					// collisionPoint is between -1 and 1
					const collisionPoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
					const angleRad = (Math.PI / 4) * collisionPoint; // anglee is between -45 and 45 degrees
					ball.speed *= 1.05;
					const direction = ball.velocityX > 0 ? -1 : 1;
					ball.velocityX = ball.speed * Math.cos(angleRad) * direction;
					ball.velocityY = ball.speed * Math.sin(angleRad);

					// ball.velocityX *= -1; // velocity already inversed above
					ball.x += ball.velocityX * remainingTime * deltaTimeMultiplier;
				}

				// will probably never happen (I was wrong, it happens sometimes)
				// when colliding on Y (bottom / top of paddle), just reverse Y velocity, but so it will still score, just avoid ball going into the paddlee
				if (collision.normalY !== 0)
				{
					ball.velocityY *= -1;
					ball.y += ball.velocityY * remainingTime * deltaTimeMultiplier;
				}
			}
			else if (ball.velocityY !== 0) // to avoid infinite loop (which i think is in the case of hiddenBall)
			{
				ball.velocityY = -ball.velocityY;
				ball.y += ball.velocityY * remainingTime * deltaTimeMultiplier;
			}

			deltaTimeMultiplier *= remainingTime;
			collision = getCollision(ball, paddle, deltaTimeMultiplier);
			collisionY = getCollision(ball, collisionYObject, deltaTimeMultiplier);
		}
	}
	else
	{
		// no collision
		ball.x += ball.velocityX * deltaTimeMultiplier;
		ball.y += ball.velocityY * deltaTimeMultiplier;
	}
}

export default class ServerSidePong
{
	public readonly player1: IPLayer;
	public readonly player2: IPLayer;
	private readonly ball: IBall;
	private readonly gameService: GameService;

	private readonly room: IGameRoom;
	private readonly server: Server;
	private ballScored: boolean = false;

	private paused: boolean = true;
	private lastUpdate: number = 0;
	private net;
	private ballIntervalId;
	private paddleIntervalId;

	constructor(room: IGameRoom, server: Server, gameService: GameService)
	{
		this.room = room;
		this.server = server;
		this.gameService = gameService;

		this.player1 = {
			paddle: {
				x: 0,
				y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
				width: PADDLE_WIDTH,
				height: PADDLE_HEIGHT,
			},
			score: 0
		};


		this.player2 = {
			paddle: {
				x: CANVAS_WIDTH - PADDLE_WIDTH,
				y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
				width: PADDLE_WIDTH,
				height: PADDLE_HEIGHT,
			},
			score: 0
		};

		this.net = {
			x: CANVAS_WIDTH / 2 - 2,
			y: 0,
			width: 4,
			height: 10,
		};

		this.ball = this.createHiddenBall();
	}

	// add delay so that after score ball is not going off directly
	resetBall()
	{
		this.ball.x = CANVAS_WIDTH / 2;
		this.ball.y = CANVAS_HEIGHT / 2;
		this.ball.speed = BALL_SPEED;
		const direction = this.ball.velocityX > 0 ? -1 : 1;
		this.ball.velocityX = direction * (this.ball.speed * 0.7); // launch ball at 70% speed after reset (will be normal speeed after first hit)
		this.ball.velocityX = -this.ball.velocityX;
		// random angle between -30 and 30 degrees
		const angleRad = (Math.random() - 0.5) * (Math.PI / 3);
		this.ball.velocityY = this.ball.speed * Math.sin(angleRad);
	}


	private broadcastEvent(eventName: string, message: any, sendToSpectators: boolean = true, exclude?: IPLayer)
	{
		let playerToExclude: IGamePlayer = undefined;
		if (typeof(exclude) !== 'undefined')
		{
			playerToExclude = exclude === this.player1 ? this.room.player1 : this.room.player2;
		}

		this.gameService.broadcastEvent(this.room, eventName, message, this.server, sendToSpectators, playerToExclude);
	}

	sendBallUpdate(ball: IBall)
	{
		const normalizedBall = {
			x: ball.x / CANVAS_WIDTH,
			y: ball.y / CANVAS_HEIGHT,
			velocityX: ball.velocityX / CANVAS_WIDTH,
			velocityY: ball.velocityY / CANVAS_HEIGHT,
			width: ball.width / CANVAS_WIDTH,
			height: ball.height / CANVAS_HEIGHT,
			speed: ball.speed / CANVAS_WIDTH,
		};

		this.broadcastEvent('ballUpdate', normalizedBall);
	}

	sendBallReset(ballReset: IBall)
	{
		const normalizedBall = {
			x: ballReset.x / CANVAS_WIDTH,
			y: ballReset.y / CANVAS_HEIGHT,
			velocityX: ballReset.velocityX / CANVAS_WIDTH,
			velocityY: ballReset.velocityY / CANVAS_HEIGHT,
			width: ballReset.width / CANVAS_WIDTH,
			height: ballReset.height / CANVAS_HEIGHT,
			speed: ballReset.speed / CANVAS_WIDTH,
		};

		this.broadcastEvent('ballReset', normalizedBall);
	}

	sendScoreUpdate()
	{
		this.broadcastEvent('scoreUpdate', { player1Score: this.player1.score, player2Score: this.player2.score });
	}

	// send move to everyone except the player who made the move
	sendPaddleMove(movedPlayer: IPLayer)
	{
		// console.log(`Moved player pos: ${movedPlayer.paddle.y}`)
		let eventName = movedPlayer === this.player1 ? 'player1Move' : 'player2Move';
		this.broadcastEvent(eventName, {
			y: movedPlayer.paddle.y / CANVAS_HEIGHT,
			height: movedPlayer.paddle.height / CANVAS_HEIGHT
		});

		// this.broadcastToRoom('OnPaddleMove', movedPlayer.paddle.y, movedPlayer);
	}

	handlePlayerScore(player: IPLayer)
	{
		if (!this.ballScored)
		{
			this.ballScored = true;

			player.score++;
			this.sendScoreUpdate();

			if (player.score >= MAX_SCORE)
			{
				this.gameService.endGame(this.room, this.server);
				return;
			}

			setTimeout(() => {
				this.resetBall(); // reset ball before sending new ball otherwise it would only reset on the next update
				this.sendBallReset(this.ball);
				this.ballScored = false;
			}, BALL_RESET_PAUSE_TIME);
		}
	}

	forfeit(player: IPLayer)
	{
		let forfeitedPlayer = player === this.player1 ? this.room.player1 : this.room.player2;
		if (!forfeitedPlayer)
			forfeitedPlayer = undefined;

		this.gameService.endGame(this.room, this.server, forfeitedPlayer);
	}

	update()
	{
		if (this.paused)
			return;

		const now = performance.now();
		const deltaTime = now - this.lastUpdate;
		this.lastUpdate = now;

		// updateMultiplier = 1 at 1fps, 0.5 at 2fps and so on
		const updateMultiplier = deltaTime / 1000;
		computeBallUpdate(this.ball, this.player1.paddle, this.player2.paddle, updateMultiplier);

		// check if bal is fully out of bounds (to avoid bug when hitting on Y and ball is partly outside
		if (this.ball.x - this.ball.width / 2 > CANVAS_WIDTH)
			this.handlePlayerScore(this.player1);
		else if (this.ball.x + this.ball.width / 2 < 0)
			this.handlePlayerScore(this.player2);

		this.sendBallUpdate(this.ball);
	}

	sendPaddlePositions()
	{
		this.sendPaddleMove(this.player1);
		this.sendPaddleMove(this.player2);
	}

	pause()
	{
		this.paused = true;
		clearInterval(this.ballIntervalId);
		clearInterval(this.paddleIntervalId);
	}

	resume()
	{
		this.lastUpdate = performance.now();
		this.paused = false;
		this.ballIntervalId = setInterval(this.update.bind(this), 1000 / BALL_UPDATES_PER_SECOND);
		this.paddleIntervalId = setInterval(this.sendPaddlePositions.bind(this), 1000 / PADDLE_UPDATES_PER_SECOND);
	}

	stop()
	{
		this.pause();
		clearInterval(this.ballIntervalId);
		clearInterval(this.paddleIntervalId);
	}

	createHiddenBall(): IBall
	{
		const ball: IBall = {
			x: -BALL_RADIUS * 2,
			y: -BALL_RADIUS * 2,
			width: BALL_RADIUS * 2,
			height: BALL_RADIUS * 2,
			velocityX: Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED,
			velocityY: 0,
			speed: BALL_SPEED,
		};

		return ball;
	}

	start()
	{
		this.lastUpdate = performance.now();
		this.paused = false;
		// to pass this to the setInterval function

		this.broadcastEvent('gameStart', { isPlayerOne: true }, false, this.player2);
		this.broadcastEvent('gameStart', { isPlayerOne: false }, false, this.player1);
		this.sendScoreUpdate(); // to reset score just in case

		this.resetPaddles();
		this.sendPaddleReset(this.player1.paddle, this.player2.paddle);

		// ball = hiddenBall, just so that client doesnt display what it thinks is the ball
		// just a dummy ball outside the canvas
		this.sendBallReset(this.ball);
		this.paddleIntervalId = setInterval(this.sendPaddlePositions.bind(this), 1000 / PADDLE_UPDATES_PER_SECOND);

		console.log(`Starting game in ${BALL_RESET_PAUSE_TIME}ms`);
		setTimeout(() =>
		{
			this.lastUpdate = performance.now();
			console.log(`Sending ball after ${BALL_RESET_PAUSE_TIME}ms`);
			this.resetBall();
			this.sendBallReset(this.ball);

			this.ballIntervalId = setInterval(this.update.bind(this), 1000 / BALL_UPDATES_PER_SECOND);
		}, BALL_RESET_PAUSE_TIME);
	}

	private movePaddle(player: IPLayer, y: number)
	{
		player.paddle.y = y;
		if (player.paddle.y < 0)
			player.paddle.y = 0;
		else if (player.paddle.y > CANVAS_HEIGHT - player.paddle.height)
			player.paddle.y = CANVAS_HEIGHT - player.paddle.height;
	}

	handlePlayerPaddleMove(player: IPLayer, payload: WsPaddleMoveDto)
	{
		this.movePaddle(player, payload.y * CANVAS_HEIGHT);
	}

	private resetPaddles()
	{
		this.player1.paddle.y = CANVAS_HEIGHT / 2 - this.player1.paddle.height / 2;
		this.player2.paddle.y = CANVAS_HEIGHT / 2 - this.player2.paddle.height / 2;
	}

	private sendPaddleReset(paddle: IPaddle, paddle2: IPaddle)
	{
		const normalizedPaddle = {
			x: paddle.x / CANVAS_WIDTH,
			y: paddle.y / CANVAS_HEIGHT,
			height: paddle.height / CANVAS_HEIGHT,
			width: paddle.width / CANVAS_WIDTH,
		};

		const normalizedPaddle2 = {
			x: paddle2.x / CANVAS_WIDTH,
			y: paddle2.y / CANVAS_HEIGHT,
			height: paddle.height / CANVAS_HEIGHT,
			width: paddle.width / CANVAS_WIDTH,
		};

		this.broadcastEvent('resetPaddles', { paddle1: normalizedPaddle, paddle2: normalizedPaddle2 });
	}

	enableBingChilling(player: IPLayer)
	{
		player.paddle.height = CANVAS_HEIGHT;
		this.movePaddle(player, 0);
		this.sendPaddleMove(player);
	}

	disableBingChilling(player: IPLayer)
	{
		player.paddle.height = PADDLE_HEIGHT;
		this.movePaddle(player, CANVAS_HEIGHT / 2 - player.paddle.height / 2);
		this.sendPaddleMove(player);
	}

	enableNotChilling(player: IPLayer)
	{
		const centeredPos = player.paddle.y + player.paddle.height / 2;
		player.paddle.height = PADDLE_HEIGHT / 3;
		this.movePaddle(player, centeredPos - player.paddle.height / 2);
		this.sendPaddleMove(player);
	}

	disableNotChilling(player: IPLayer)
	{
		const centerPos = player.paddle.y + player.paddle.height / 2;
		player.paddle.height = PADDLE_HEIGHT;
		// recenter paddle based on current pos
		this.movePaddle(player, centerPos - player.paddle.height / 2);
		this.sendPaddleMove(player);
	}
};