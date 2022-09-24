<script lang="ts">

	import { onMount } from 'svelte';
	import { pongSocketStore } from '$lib/stores';

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
	let lastUpdate: number;

	let inGame = false;

	function startGame(isPlayerOne: boolean)
	{
		inGame = true;

		console.log(`Is player one: ${isPlayerOne}`);

		// Only listen to movement of opposite player (not self user)
		let moveEventName = 'player1Move';
		if (isPlayerOne)
		{
			moveEventName = 'player2Move';
		}

		$pongSocketStore.on(moveEventName, (data) =>
		{
			// console.log("OPONNENT PADDLE MOVE:", data);
			player2.paddle.position.server_y = data.y;

			// if (player2.paddle.position.client_y < 0)
			// 	player2.paddle.position.client_y = 0;
			// else if (player2.paddle.position.client_y > canvas.height - player2.paddle.height)
			// 	player2.paddle.position.client_y = canvas.height - player2.paddle.height;
		});

		$pongSocketStore.on('ballReset', (data) =>
		{
			console.log('BALL RESET:', data);

			const denormalizedBall = {
				x: data.x * canvas.width,
				y: data.y * canvas.height,
				velocityX: data.velocityX * canvas.width,
				velocityY: data.velocityY * canvas.height,
				speed: data.speed * canvas.width,
			}

			ball.position.client_x = denormalizedBall.x;
			ball.position.client_y = denormalizedBall.y;
			ball.velocityX = denormalizedBall.velocityX * (isPlayerOne ? 1 : -1);
			ball.velocityY = denormalizedBall.velocityY;
			ball.speed = denormalizedBall.speed;
		});

		$pongSocketStore.on('scoreUpdate', (data) =>
		{
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
			console.log(`Reset paddle, pos: ${player1.paddle.position.client_y}, ${player2.paddle.position.client_y}`);
		});

		$pongSocketStore.on('ballUpdate', (data) =>
		{
			// console.log('BALL UPDATE:', data);

			const denormalizedBall = {
				x: data.x * canvas.width,
				y: data.y * canvas.height,
				velocityX: data.velocityX * canvas.width,
				velocityY: data.velocityY * canvas.height,
			}

			ball.position.server_x = denormalizedBall.x;
			ball.position.server_y = denormalizedBall.y;

			ball.position.client_x = denormalizedBall.x;
			ball.position.client_y = denormalizedBall.y;

			ball.velocityX = denormalizedBall.velocityX * (isPlayerOne ? 1 : -1);
			ball.velocityY = denormalizedBall.velocityY;

			if (!isPlayerOne)
			{
				ball.position.client_x = canvas.width - ball.position.client_x;
			}
		});

		lastUpdate = performance.now();
	}

	onMount(async () =>
	{
		context = canvas.getContext('2d') as CanvasRenderingContext2D;

		$pongSocketStore.on('onStartGame', (data) => {
			console.log("STARTING GAME:", data);
			startGame(data.isPlayerOne);
		});

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

		return () => {
			cancelAnimationFrame(animationFrameId);
		}
	});


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

	function handleMouse(event: MouseEvent)
	{

		let rect = canvas.getBoundingClientRect();

		// y = center of paddle
		$pongSocketStore.emit('onPaddleMove', {y: event.clientY - rect.top - paddle_height / 2});

		movePaddle(event.clientY - rect.top - paddle_height / 2);
	}

	function movePaddle(y: number)
	{
		player1.paddle.position.client_y = y;

		if (player1.paddle.position.client_y < 0)
			player1.paddle.position.client_y = 0;
		else if (player1.paddle.position.client_y > canvas.height - player1.paddle.height)
			player1.paddle.position.client_y = canvas.height - player1.paddle.height;
	}

	let pressedKeys: any = [];

	function handleKeyDown(event: KeyboardEvent)
	{
		console.log('start keyboard', event.key);
		pressedKeys.push(event.key);
	}

	function handleKeyUp(event: KeyboardEvent)
	{
		console.log('stop keyboard', event.key);
		pressedKeys = pressedKeys.filter((key: string) => key !== event.key);
	}

	function lerp(start: number, end: number, t: number)
	{// 60 * (0.99) + 100 * (0.01) =
		return start * (1 - t) + end * t;
	}

	function update()
	{
		let multiplier = 1;

		if (pressedKeys.includes('Shift'))
			multiplier = 2;

		if (pressedKeys.includes('Control'))
			multiplier = 0.5;

		if (pressedKeys.includes('ArrowUp'))
		{
			$pongSocketStore.emit('onPaddleMove', {y: player1.paddle.position.client_y - 10});
			movePaddle(player1.paddle.position.client_y - (2 * multiplier));
		}

		if (pressedKeys.includes('ArrowDown'))
		{
			$pongSocketStore.emit('onPaddleMove', {y: player1.paddle.position.client_y + 10});
			movePaddle(player1.paddle.position.client_y + (2 * multiplier));
		}


		const now = performance.now();
		const deltaTime = now - lastUpdate;
		lastUpdate = now;

		const updateMultiplier = deltaTime / 1000; // === 1 at 1 fps, 0.5 at 2 fps etc.

		ball.position.client_x += ball.velocityX * updateMultiplier;
		ball.position.client_y += ball.velocityY * updateMultiplier;

		player2.paddle.position.client_y = lerp(player2.paddle.position.client_y, player2.paddle.position.server_y, 0.1);

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

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<div class="pong-wrapper">
	<canvas class="pouet" on:mousemove={handleMouse} bind:this={canvas} width="600" height="400"/>
</div>

<style lang="scss">

	.pong-wrapper
	{

	}

</style>