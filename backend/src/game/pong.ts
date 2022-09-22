import { IGameMovePayload, IGameRoom } from '../interfaces/interfaces';
import { Server } from 'socket.io';

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
const UPDATES_PER_SECOND = 60;

// Basis for width / height, but in the end only the ratio matters
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

export default class ServerSidePong
{
	public readonly player1: IPLayer;
	public readonly player2: IPLayer;
	private readonly ball: IBall;

	private readonly room: IGameRoom;
	private readonly server: Server;

	private paused: boolean = true;
	private lastUpdate: number = 0;
	private net;
	private intervalId;

	constructor(room: IGameRoom, server: Server)
	{
		this.room = room;
		this.server = server;
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
			speed: 5,
			velocityX: 5,
			velocityY: 0,
			color: 'white',
		};
	}

	resetBall()
	{
		this.ball.x = CANVAS_WIDTH / 2;
		this.ball.y = CANVAS_HEIGHT / 2;
		this.ball.speed = 5;
		this.ball.velocityX = -this.ball.velocityX;
	}

	broadcastToRoom(message: string, data: any, exclude?: IPLayer)
	{
		this.server.to([this.room.player1.clientId, this.room.player2.clientId]).emit(message, data);
	}

	sendBallUpdate(ball: IBall)
	{
		this.broadcastToRoom('OnBallUpdate', ball);
	}

	sendBallReset()
	{
		this.broadcastToRoom('OnBallReset', '');
	}

	sendScoreUpdate()
	{
		this.broadcastToRoom('OnScoreUpdate', {player1: this.player1.score, player2: this.player2.score});
	}

	// send move to everyone except the player who made the move
	sendPaddleMove(movedPlayer: IPLayer)
	{
		this.broadcastToRoom('OnPaddleMove', movedPlayer.paddle.y, movedPlayer);
	}


	update()
	{
		if (this.paused)
			return;

		const deltaTime = (performance.now() - this.lastUpdate);
		this.lastUpdate = performance.now();

		// updateMultiplier === 1 at 1000 / UPDATES_PER_SECOND (30 fps) to make calculations easier, === 2 at 15 fps etc.
		const updateMultiplier = deltaTime / (1000 / UPDATES_PER_SECOND);

		this.ball.x += this.ball.velocityX * updateMultiplier;
		this.ball.y += this.ball.velocityY * updateMultiplier;

		// Check if ball is not already going right way to avoid issue where ball is stuck on the side alterning between +velY and -velY
		if ((this.ball.y + this.ball.radius > CANVAS_HEIGHT && this.ball.velocityY > 0) || (this.ball.y - this.ball.radius < 0 && this.ball.velocityY < 0))
		{
			this.ball.velocityY = -this.ball.velocityY;
		}

		let player = (this.ball.x < CANVAS_WIDTH / 2) ? this.player1 : this.player2;

		if (this.checkCollision(this.ball, player.paddle))
		{
			let collisionPoint = this.ball.y - (player.paddle.y + player.paddle.height / 2);
			console.log(`Collision point: ${collisionPoint}`);
			collisionPoint = collisionPoint / (player.paddle.height / 2);
			console.log(`Collision point normalized: ${collisionPoint}`);

			let angleRad = (Math.PI / 4) * collisionPoint;
			let direction = (this.ball.x < CANVAS_WIDTH / 2) ? 1 : -1;
			this.ball.speed += 0.2;
			this.ball.velocityX = this.ball.speed * direction * Math.cos(angleRad);
			this.ball.velocityY = this.ball.speed * Math.sin(angleRad);
		}
		else if (this.ball.x + this.ball.radius > CANVAS_WIDTH)
		{
			console.log('Player 1 scored', this.ball.y, this.player1.paddle.y);
			this.player1.score++;
			this.sendBallReset();
			this.resetBall();
		}
		else if (this.ball.x - this.ball.radius < 0)
		{
			console.log('Player 2 scored', this.ball.y, this.player2.paddle.y);
			this.player2.score++;
			this.sendBallReset();
			this.resetBall();
		}

		this.sendBallUpdate(this.ball);
	}


	pointDistToSegment(point: { x: number, y: number }, p1: { x: number, y: number }, p2: { x: number, y: number })
	{
		let A = point.x - p1.x;
		let B = point.y - p1.y;
		let C = p2.x - p1.x;
		let D = p2.y - p1.y;

		let dot = A * C + B * D;
		let len_sq = C * C + D * D;
		let param = -1;
		if (len_sq != 0) //in case of 0 length line
			param = dot / len_sq;

		let xx, yy;

		if (param < 0)
		{
			xx = p1.x;
			yy = p1.y;
		}
		else if (param > 1)
		{
			xx = p2.x;
			yy = p2.y;
		}
		else
		{
			xx = p1.x + param * C;
			yy = p1.y + param * D;
		}

		let dx = point.x - xx;
		let dy = point.y - yy;
		return Math.sqrt(dx * dx + dy * dy);
	}

	// https://stackoverflow.com/questions/43615547/collision-detection-for-2d-capsule-or-swept-sphere
	checkCollision(ball: { x: number, y: number, radius: number }, paddle: IPaddle)
	{
		// const dist = pointDistToSegment({x: paddle.x, y: paddle.y}, ball, ballLastPos);

		const ballTop = ball.y - ball.radius;
		const ballBottom = ball.y + ball.radius;
		const ballLeft = ball.x - ball.radius;
		const ballRight = ball.x + ball.radius;

		const paddleTop = paddle.y;
		const paddleBottom = paddle.y + paddle.height;
		const paddleLeft = paddle.x;
		const paddleRight = paddle.x + paddle.width;

		console.log(`ball coord: (${ballLeft}, ${ballTop}) (${ballRight}, ${ballBottom}), paddle coord: (${paddleLeft}, ${paddleTop}) (${paddleRight}, ${paddleBottom})`);

		if (ballRight < paddleLeft || ballLeft > paddleRight || ballBottom < paddleTop || ballTop > paddleBottom)
		{
			return false;
		}

		return true;
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


		this.sendPaddleMove(player);
	}

	handlePlayerPaddleMove(player: IPLayer, payload: IGameMovePayload)
	{
		this.movePaddle(player, payload.y - PADDLE_HEIGHT / 2);
	}
};


