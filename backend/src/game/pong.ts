import { IGameMovePayload, IGamePlayer, IGameRoom } from '../interfaces/interfaces';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { Inject } from '@nestjs/common';
import { retry } from 'rxjs';

interface IBall
{
	x: number;
	y: number;
	radius: number;
	velocityX: number;
	velocityY: number;
	speed: number;
	color: string;
}

interface IPaddle
{
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
}

interface IPLayer
{
	paddle: IPaddle;
	score: number;
}

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const UPDATES_PER_SECOND = 144;

// Basis for width / height, but in the end only the ratio matters
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

// we consider the ball squared, then do this: https://www.gamedev.net/articles/programming/general-and-gameplay-programming/swept-aabb-collision-detection-and-response-r3084/
// with deflection
// 0.5 = collision in the middle of the frame, 0 = collision at the start, 1 = no collision
function getBallNextPosCollision(ball: IBall, paddle1: IPaddle, paddle2: IPaddle, deltaTimeMultiplier: number): { normalX: number, normalY: number, time: number }
{
	const targetPaddle = ball.velocityX > 0 ? paddle2 : paddle1;

	// make ball and targetBall x in the top left corner
	const ballPos = {x: ball.x - ball.radius, y: ball.y - ball.radius}

	let xInvEntry: number;
	let yInvEntry: number;
	let xInvExit: number;
	let yInvExit: number;

	if (ball.velocityX > 0)
	{
		xInvEntry = targetPaddle.x - (ballPos.x + ball.radius * 2);
		xInvExit = (targetPaddle.x + targetPaddle.width) - ballPos.x;
	}
	else
	{
		xInvEntry = (targetPaddle.x + targetPaddle.width) - ballPos.x;
		xInvExit = targetPaddle.x - (ballPos.x + ball.radius * 2);
	}

	if (ball.velocityY > 0)
	{
		yInvEntry = targetPaddle.y - (ballPos.y + ball.radius * 2);
		yInvExit = (targetPaddle.y + targetPaddle.height) - ballPos.y;
	}
	else
	{
		yInvEntry = (targetPaddle.y + targetPaddle.height) - ballPos.y;
		yInvExit = targetPaddle.y - (ballPos.y + ball.radius * 2);
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

		// check if ball is in front of paddle on y
		if (ballPos.y + ball.radius * 2 < targetPaddle.y || ballPos.y > targetPaddle.y + targetPaddle.height)
			xEntry = Infinity;
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
		// normalx = 0;
		// normaly = 0;
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
	const collision = getBallNextPosCollision(ball, paddle1, paddle2, deltaTimeMultiplier);
	const collisionTime = collision.time;

	ball.x += ball.velocityX * collisionTime * deltaTimeMultiplier;
	ball.y += ball.velocityY * collisionTime * deltaTimeMultiplier;

	const remainingTime = 1 - collisionTime;

	// deflect ball
	if (collisionTime !== 1)
	{
		const paddle = ball.velocityX > 0 ? paddle2 : paddle1;
		// collisionPoint is between -1 and 1
		const collisionPoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
		const angleRad = (Math.PI / 4) * collisionPoint; // anglee is between -45 and 45 degrees
		ball.speed += 20;
		const direction = ball.velocityX > 0 ? -1 : 1;
		ball.velocityX = ball.speed * Math.cos(angleRad) * direction;
		ball.velocityY = ball.speed * Math.sin(angleRad);

		if (collision.normalX !== 0)
		{
			// ball.velocityX *= -1; // velocity already inversed above
			ball.x += ball.velocityX * remainingTime * deltaTimeMultiplier;
		}

		// will probably never happen
		if (collision.normalY !== 0)
		{
			ball.velocityY *= -1;
			ball.y += ball.velocityY * remainingTime * deltaTimeMultiplier;
		}
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

	private paused: boolean = true;
	private lastUpdate: number = 0;
	private net;
	private intervalId;


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
				color: 'blue',
			},
			score: 0
		};


		this.player2 = {
			paddle: {
				x: CANVAS_WIDTH - PADDLE_WIDTH,
				y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
				width: PADDLE_WIDTH,
				height: PADDLE_HEIGHT,
				color: 'red',
			},
			score: 0
		};

		this.net = {
			x: CANVAS_WIDTH / 2 - 2,
			y: 0,
			width: 4,
			height: 10,
			color: 'white',
		};

		this.ball = {
			x: CANVAS_WIDTH / 2,
			y: CANVAS_HEIGHT / 2,
			radius: 10,
			speed: 500, // speed = units per second
			velocityX: 500,
			velocityY: 50,
			color: 'white',
		};
	}

	resetBall()
	{
		this.ball.x = CANVAS_WIDTH / 2;
		this.ball.y = CANVAS_HEIGHT / 2;;
		this.ball.speed = 500;
		this.ball.velocityX = -this.ball.velocityX;
		// random angle between -30 and 30 degrees
		const angleRad = (Math.random() -0.5) * (Math.PI / 3);
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
		this.broadcastEvent('ballUpdate', ball);
	}

	sendBallReset(ballReset: IBall)
	{
		this.broadcastEvent('ballReset', ballReset);
	}

	sendScoreUpdate()
	{
		this.broadcastEvent('scoreUpdate', { player1Score: this.player1.score, player2Score: this.player2.score });
	}

	// send move to everyone except the player who made the move
	sendPaddleMove(movedPlayer: IPLayer)
	{
		if (movedPlayer === this.player1)
		{
			this.broadcastEvent('player1Move', {y: this.player1.paddle.y });
		}
		else if (movedPlayer === this.player2)
		{
			this.broadcastEvent('player2Move', {y: this.player2.paddle.y });
		}

		// this.broadcastToRoom('OnPaddleMove', movedPlayer.paddle.y, movedPlayer);
	}

	update()
	{
		if (this.paused)
			return;

		const deltaTime = (performance.now() - this.lastUpdate);
		this.lastUpdate = performance.now();

		// updateMultiplier = 1 at 1fps, 0.5 at 2fps and so on
		const updateMultiplier = deltaTime / 1000;
		computeBallUpdate(this.ball, this.player1.paddle, this.player2.paddle, updateMultiplier);


		// Check if ball is not already going right way to avoid issue where ball is stuck on the side alterning between +velY and -velY
		if ((this.ball.y + this.ball.radius > CANVAS_HEIGHT && this.ball.velocityY > 0) || (this.ball.y - this.ball.radius < 0 && this.ball.velocityY < 0))
		{
			this.ball.velocityY = -this.ball.velocityY;
		}

		if (this.ball.x + this.ball.radius > CANVAS_WIDTH)
		{
			console.log('Player 1 scored', this.ball.y, this.player1.paddle.y);
			this.player1.score++;
			this.sendScoreUpdate();
			this.resetBall(); // reset ball before sending new ball otherwise it would only reset on the next update
			this.sendBallReset(this.ball);
		}
		else if (this.ball.x - this.ball.radius < 0)
		{
			console.log('Player 2 scored', this.ball.y, this.player2.paddle.y);
			this.player2.score++;
			this.sendScoreUpdate();
			this.resetBall();
			this.sendBallReset(this.ball);
		}

		this.sendBallUpdate(this.ball);
		this.sendPaddleMove(this.player1);
		this.sendPaddleMove(this.player2);
	}

	pause()
	{
		this.paused = true;
		clearInterval(this.intervalId);
	}

	resume()
	{
		this.lastUpdate = performance.now();
		this.paused = false;
		this.intervalId = setInterval(this.update.bind(this), 1000 / UPDATES_PER_SECOND);
	}

	start()
	{
		this.lastUpdate = performance.now();
		this.paused = false;
		// to pass this to the setInterval function
		this.intervalId = setInterval(this.update.bind(this), 1000 / UPDATES_PER_SECOND);
	}

	private movePaddle(player: IPLayer, y: number)
	{
		player.paddle.y = y;
		if (player.paddle.y < 0)
			player.paddle.y = 0;
		else if (player.paddle.y > CANVAS_HEIGHT - player.paddle.height)
			player.paddle.y = CANVAS_HEIGHT - player.paddle.height;
	}

	handlePlayerPaddleMove(player: IPLayer, payload: IGameMovePayload)
	{
		this.movePaddle(player, payload.y);
	}
};


