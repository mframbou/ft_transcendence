
import {IGameRoom} from '../interfaces/interfaces';
import {Server} from 'socket.io';

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


export default class ServerSidePong
{
    private player1 : IPLayer;
    private player2 : IPLayer;
    private readonly room: IGameRoom
    private readonly server: Server
    private paddle_width = 10;
    private paddle_height = 100;
    private ball: IBall;
    private net;
    private lastUpdate = null;
    private animationFrameId: number;
    private inGame = false;
    private updateInterval = 30;
    private updateCounter = 0;

    private paused = false;
    
    private canvas = {
        width: 600,
        height: 400
    }
    
    constructor(_room: IGameRoom , _server : Server)
    {
        this.room = _room;
        this.server = _server;
        this.player1 = 
        {
            paddle: 
            {
                x: 0,
                y: this.canvas.height / 2 - this.paddle_height / 2,
                width: this.paddle_width,
                height: this.paddle_height,
                color: 'blue',
            },
			score: 0
		};
        
        
        this.player2 = 
        {
            paddle: 
            {
                x: this.canvas.width - this.paddle_width,
                y: this.canvas.height / 2 - this.paddle_height / 2,
                width: this.paddle_width,
                height: this.paddle_height,
                color: 'red',
            },
            score: 0
        };

        this.net = 
        {
            x: this.canvas.width / 2 - 2,
            y: 0,
            width: 4,
            height: 10,
            color: 'white',
        };

        this.ball = 
        {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 10,
            speed: 5,
            velocityX: 5,
            velocityY: 0,
            color: 'white',
        };

        setInterval(() => this.update(), 1000 / this.updateInterval);
    }


	resetBall()
	{
		this.ball.x = this.canvas.width / 2;
		this.ball.y = this.canvas.height / 2;
		this.ball.speed = 5;
		this.ball.velocityX = -this.ball.velocityX;
	}


    Broadcast(message :string,  data:any)
    {
        this.server.to([this.room.player1.clientId, this.room.player2.clientId]).emit(message, data)
    }
    SendBallUpdate(ball: IBall)
    {
        this.Broadcast("OnBallUpdate", ball);
    }

    SendBallReset()
    {
        this.Broadcast("OnBallReset", "");
    }

    SendScoreUpdate()
    {
        this.Broadcast("OnScoreUpdate", {player1: this.player1.score, player2: this.player2.score});
    }


	update()
	{
		if(this.paused)
            return;

      
		if (this.ball.x + this.ball.radius > this.canvas.width)
		{
            this.player1.score++;
            this.SendBallReset();
			this.resetBall(); // reset so that next frame we dont accidentally resend message
		}
		else if (this.ball.x - this.ball.radius < 0)
		{
            this.player2.score++;
            this.SendBallReset();
			this.resetBall();
		}

		this.ball.x += this.ball.velocityX;
		this.ball.y += this.ball.velocityY;


		if (this.ball.y + this.ball.radius > this.canvas.height || this.ball.y - this.ball.radius < 0)
		{
			this.ball.velocityY = -this.ball.velocityY;
		}

		let player = (this.ball.x < this.canvas.width / 2) ? this.player1 : this.player2;


		if (this.checkCollision(this.ball, player.paddle))
		{
			// let collisionPoint = this.ball.y - (player.paddle.y + player.paddle.height / 2);
			// collisionPoint = collisionPoint / (player.paddle.height / 2);

			// let angleRad = (Math.PI / 4) * collisionPoint;
			// let direction = (this.ball.x < this.canvas.width / 2) ? 1 : -1;
			// this.ball.velocityX = direction * this.ball.speed * Math.cos(angleRad);
			// this.ball.velocityY = this.ball.speed * Math.sin(angleRad);
			// this.ball.speed += 0.2;

		}

        console.log(this.ball.x, this.ball.y);
        this.SendBallUpdate(this.ball);
    }
	

	pointDistToSegment(point: {x: number, y: number}, p1: {x: number, y: number}, p2: {x: number, y: number})
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

		if (param < 0) {
			xx = p1.x;
			yy = p1.y;
		}
		else if (param > 1) {
			xx = p2.x;
			yy = p2.y;
		}
		else {
			xx = p1.x + param * C;
			yy = p1.y + param * D;
		}

		let dx = point.x - xx;
		let dy = point.y - yy;
		return Math.sqrt(dx * dx + dy * dy);
	}

	// https://stackoverflow.com/questions/43615547/collision-detection-for-2d-capsule-or-swept-sphere
	checkCollision(ball: { x: number, y: number, radius: number },  paddle: IPaddle)
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

		return ballLeft < paddleRight && ballTop < paddleBottom && ballRight > paddleLeft && ballBottom > paddleTop;
	}

    pause()
    {
        this.paused = true;
    }

    resume()
    {
        this.paused = false;
    }
};


