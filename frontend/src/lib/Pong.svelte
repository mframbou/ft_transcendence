<script lang="ts">

	import { onDestroy, onMount } from 'svelte';
	import { pongSocketStore } from '$lib/stores';

	export let isPlayerOne = true;

    interface position
    {
        client_x: number;
		client_y: number;
        server_x: number;
        server_y: number;
    }

	interface IBall
	{
		position: position;
		radius: number;
		velocityX: number;
		velocityY: number;
		speed: number;
		color: string;
	}

	interface IPaddle
	{
		position: position;
		width: number;
		height: number;
		color: string;
	}

	interface IPLayer
	{
		paddle: IPaddle;
		score: number;
	}

	if ($pongSocketStore)
	{
		$pongSocketStore.on('onOpponentPaddleMove', (data) =>
		{
			//console.log("OPPONENT PADDLE MOVE:", data);
			player2.paddle.position.client_y = data.y - player2.paddle.height / 2;

			if (player2.paddle.position.client_y < 0)
				player2.paddle.position.client_y = 0;
			else if (player2.paddle.position.client_y > canvas.height - player2.paddle.height)
				player2.paddle.position.client_y = canvas.height - player2.paddle.height;
		});

		$pongSocketStore.on('OnBallReset', (data) =>
		{
			console.log('BALL RESET:', data);
			resetBall();
		});

		$pongSocketStore.on('OnScoreUpdate', (data) =>
		{
			if (!data || data.player1Score === undefined || data.player2Score === undefined)
				return;

			console.log('SCORE CHANGE:', data);

			if (isPlayerOne)
			{
				player1.score = data.player1Score;
				player2.score = data.player2Score;
			}
			else
			{
				player1.score = data.player2Score;
				player2.score = data.player1Score;
			}
			drawScore();
		});

		$pongSocketStore.on('onResetPaddles', (data) =>
		{
			player1.paddle.position.client_x = 0;
			player1.paddle.position.client_y = canvas.height / 2 - player1.paddle.height / 2;

			player2.paddle.position.client_x = canvas.width - player2.paddle.width;
			player2.paddle.position.client_y = canvas.height / 2 - player2.paddle.height / 2;
		});

		$pongSocketStore.on('OnBallUpdate', (data) =>
		{
			ball.position.client_y = data.y;

			if (isPlayerOne)
			{
				ball.position.client_x = data.x;
			}
			else
			{
				ball.position.client_x = canvas.width - data.x;
			}

			// ball.position.server_x = data.x;
			// ball.position.server_y = data.y;

		});
	}

	const paddle_width = 10;
	const paddle_height = 100;

	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D;

	let player1: IPLayer;
	let player2: IPLayer;
	let ball: IBall;
	//const ballLastPos: { x: number, y: number } = {};
	let net:any;
	//let lastUpdate = null;
	let animationFrameId: number;

	let inGame = false;

	onMount(async () =>
	{
		canvas.addEventListener('mousemove', movePaddle);
		context = canvas.getContext('2d') as CanvasRenderingContext2D;

		player1 = {
			paddle: {
				position: {
                    client_x: 0,
                    client_y: canvas.height / 2 - paddle_height / 2,
                    server_x: 0,
                    server_y: canvas.height / 2 - paddle_height / 2
                },
				width: paddle_width,
				height: paddle_height,
				color: 'blue',
			},
			score: 0
		};

		player2 = {
			paddle: {
                position: {
                    client_x: canvas.width - paddle_width,
                    client_y: canvas.height / 2 - paddle_height / 2,
                    server_x: canvas.width - paddle_width,
                    server_y: canvas.height / 2 - paddle_height / 2
                },
				width: paddle_width,
				height: paddle_height,
				color: 'red',
			},
			score: 0
		};

		net = {
			x: canvas.width / 2 - 2,
			y: 0,
			width: 4,
			height: 10,
			color: 'white',
		};

		ball = {
            position: {
                client_x: canvas.width / 2,
                client_y: canvas.height / 2,
                server_x: canvas.width / 2,
                server_y: canvas.height / 2
            },
			radius: 10,
			speed: 5,
			velocityX: 5,
			velocityY: 0,
			color: 'white',
		};

		animationFrameId = requestAnimationFrame(loop);
	});

	onDestroy(() => {
		canvas.removeEventListener('mousemove', movePaddle);
		cancelAnimationFrame(animationFrameId);
	})


	function drawPaddle(paddle: IPaddle)
	{
		context.fillStyle = paddle.color;
		context.fillRect(paddle.position.client_x, paddle.position.client_y, paddle.width, paddle.height);
	}

	function drawBall(ball: IBall)
	{
		context.beginPath();
		context.arc(ball.position.client_x, ball.position.client_y, ball.radius, 0, Math.PI * 2, true);
		context.closePath();
		context.fillStyle = ball.color;
		context.fill();
	}

	function drawRect(x: number, y: number, w: number, h: number, color: string)
	{
		context.fillStyle = color;
		context.fillRect(x, y, w, h);
	}

	function drawCircle(x: number, y: number, r: number, color: string)
	{
		context.fillStyle = color;
		context.beginPath();
		context.arc(x, y, r, Math.PI * 2, 0, false);
		context.closePath();
		context.fill();
	}

	function drawText(text: string, x: number, y: number, color: string)
	{
		context.fillStyle = color;
		context.font = '75px fantasy';
		context.fillText(text, x, y);
	}


	function clearCanvas()
	{
		drawRect(0, 0, canvas.width, canvas.height, 'black');
	}

	function drawNet()
	{
		for (let i = 0; i < canvas.height; i += 20)
			drawRect(net.x, net.y + i, net.width, net.height, net.color);
	}


	function drawScore()
	{
		drawText(player1.score.toString(), canvas.width / 4, canvas.height / 5, 'white');
		drawText(player2.score.toString(), 3 * canvas.width / 4, canvas.height / 5, 'white');
	}

	function resetBall()
	{
		ball.position.client_x = canvas.width / 2;
		ball.position.client_y = canvas.height / 2;
		ball.speed = 5;
		ball.velocityX = -ball.velocityX;
	}

	function movePaddle(event: MouseEvent)
	{

		let rect = canvas.getBoundingClientRect();

		// y = center of paddle
		$pongSocketStore.emit('onPaddleMove', {y: event.clientY - rect.top});

		player1.paddle.position.client_y = event.clientY - rect.top - player1.paddle.height / 2;

		if (player1.paddle.position.client_y < 0)
			player1.paddle.position.client_y = 0;
		else if (player1.paddle.position.client_y > canvas.height - player1.paddle.height)
			player1.paddle.position.client_y = canvas.height - player1.paddle.height;
	}

    function lerp(start:number, end:number, time:number) 
    {
        return start * (1 - time) + end * time;
    }

	function update()
	{
		// ball.position.client_x += ball.velocityX;
		// ball.position.client_y += ball.velocityY;
		//
		//
		// if (ball.position.client_y + ball.radius > canvas.height || ball.position.client_y - ball.radius < 0)
		// {
		// 	ball.velocityY = -ball.velocityY;
		// }
		//
		// let player = (ball.position.client_x < canvas.width / 2) ? player1 : player2;
		// if (checkCollision(ball, player.paddle))
		// {
		// 	let collisionPoint = ball.position.client_y - (player.paddle.position.client_y + player.paddle.height / 2);
		// 	collisionPoint = collisionPoint / (player.paddle.height / 2);
		//
		// 	let angleRad = (Math.PI / 4) * collisionPoint;
		// 	let direction = (ball. position.client_x < canvas.width / 2) ? 1 : -1;
		// 	ball.velocityX = direction * ball.speed * Math.cos(angleRad);
		// 	ball.velocityY = ball.speed * Math.sin(angleRad);
		// 	ball.speed += 0.2;
		// }
	}

	function pointDistToSegment(point: {x: number, y: number}, p1: {x: number, y: number}, p2: {x: number, y: number})
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
	function checkCollision(ball: IBall, paddle: IPaddle)
	{
		// const dist = pointDistToSegment({x: paddle.x, y: paddle.y}, ball, ballLastPos);

		const ballTop = ball.position.client_y - ball.radius;
		const ballBottom = ball.position.client_y + ball.radius;
		const ballLeft = ball.position.client_x- ball.radius;
		const ballRight = ball.position.client_x + ball.radius;

		const paddleTop = paddle.position.client_y;
		const paddleBottom = paddle.position.client_y + paddle.height;
		const paddleLeft = paddle.position.client_x;
		const paddleRight = paddle.position.client_x + paddle.width;

		return ballLeft < paddleRight && ballTop < paddleBottom && ballRight > paddleLeft && ballBottom > paddleTop;
	}

	function render()
	{
		clearCanvas();
		drawScore();
		drawNet();
		drawPaddle(player1.paddle);
		drawPaddle(player2.paddle);
		drawBall(ball);
	}

	function loop()
	{
		update();
		render();
		animationFrameId = requestAnimationFrame(loop);
	}

</script>

<div class="pong-wrapper">
	<canvas bind:this={canvas} width="600" height="400"/>
</div>

<style lang="scss">

	.pong-wrapper
	{

	}

</style>