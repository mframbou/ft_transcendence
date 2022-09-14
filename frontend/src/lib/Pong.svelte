<script lang="ts">

	import { onMount } from 'svelte';
	import { pongSocketStore } from '$lib/stores';

	export let isPlayerOne = true;

	$pongSocketStore.on('onOpponentPaddleMove', (data) =>
	{
		// console.log("OPPONENT PADDLE MOVE:", data);
		com.y = data.y;
	});

	$pongSocketStore.on('onBallReset', (data) =>
	{
		console.log('BALL RESET:', data);
		ball.velocityY = data.velocityY;
		ball.velocityX = data.velocityX;

		if (!isPlayerOne)
		{
			ball.velocityX *= -1;
		}

		resetBall();
	});

	$pongSocketStore.on('onScoreChange', (data) =>
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
		player1.paddle.x = 0;
		player1.paddle.y = canvas_height / 2 - player1.paddle.height / 2;

		player2.paddle.x = canvas_width - player2.paddle.width;
		player2.paddle.y = canvas_height / 2 - player2.paddle.height / 2;
	});

	let canvasElement: HTMLCanvasElement;
	let context: CanvasRenderingContext2D;

	onMount(async () =>
	{
		canvasElement.addEventListener('mousemove', movePaddle);

		if (canvasElement.getContext('2d') != null)
			context = canvasElement.getContext('2d') as CanvasRenderingContext2D;
		else
			console.log('context is null');

		// pongSocket.on('', (data) => {
		//     console.log('pongSocket received pong', data);
		// });

		// pongSocket.on('onStartGameReceive', (data) => {
		//     console.log('pongSocket received pong', data);
		// });

		// pongSocket.on('onStartGameReceive', (data) => {
		//     console.log('pongSocket received pong', data);
		// });
		requestAnimationFrame(loop);
	});

	const computerLevel = 50;

	const canvas_width = 600;
	const canvas_height = 400;
	const paddle_width = 10;
	const paddle_height = 100;
	const paddle_color = 'black';


	const framePerSecond = 50;

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

	const player1: IPLayer = {
		paddle: {
			x: 0,
			y: canvas_height / 2 - paddle_height / 2,
			width: paddle_width,
			height: paddle_height,
			color: 'blue',
		},
		score: 0
	};

	const player2: IPLayer = {
		paddle: {
			x: canvas_width - paddle_width,
			y: canvas_height / 2 - paddle_height / 2,
			width: paddle_width,
			height: paddle_height,
			color: 'red',
		},
		score: 0
	};

	const user =
			{
				x: 0,
				y: (canvas_height / 2) - (paddle_height / 2),
				width: paddle_width,
				height: paddle_height,
				color: 'blue',
				score: 0
			};
	const com =
			{
				x: canvas_width - paddle_width,
				y: (canvas_height / 2) - (paddle_height / 2),
				width: paddle_width,
				height: paddle_height,
				color: 'red',
				score: 0,
				random: 0
			};

	const net =
			{
				x: canvas_width / 2 - 2,
				y: 0,
				width: 4,
				height: 10,
				color: 'white',
			};


	const ball: IBall = {
		x: canvas_width / 2,
		y: canvas_height / 2,
		radius: 10,
		speed: 5,
		velocityX: 5,
		velocityY: 0,
		color: 'white',
	};

	function drawPaddle(paddle: IPaddle)
	{
		context.fillStyle = paddle.color;
		context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
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


	function reset_canvas()
	{
		drawRect(0, 0, 600, 400, 'black');
	}

	function drawNet()
	{
		for (let i = 0; i < canvas_height; i += 20)
			drawRect(net.x, net.y + i, net.width, net.height, net.color);
	}

	function drawBall()
	{
		drawCircle(ball.x, ball.y, ball.radius, ball.color);
	}

	function drawScore()
	{
		drawText(player1.score.toString(), canvas_width / 4, canvas_height / 5, 'white');
		drawText(player2.score.toString(), 3 * canvas_width / 4, canvas_height / 5, 'white');
	}

	function resetBall()
	{
		ball.x = canvas_width / 2;
		ball.y = canvas_height / 2;
		ball.speed = 5;
		ball.velocityX = -ball.velocityX;
		com.random = 0;
	}

	function movePaddle(event: MouseEvent)
	{

		let rect = canvasElement.getBoundingClientRect();

		$pongSocketStore.emit('onPaddleMove', {y: event.clientY - rect.top});

		player1.paddle.y = event.clientY - rect.top - player1.paddle.height / 2;

		if (player1.paddle.y < 0)
			player1.paddle.y = 0;
		else if (player1.paddle.y > canvas_height - player1.paddle.height)
			player1.paddle.y = canvas_height - player1.paddle.height;
	}

	function Update()
	{
		// com.y = ball.y -  com.height/2 + com.random;

		if (com.y + paddle_height > canvas_height)
			com.y = canvas_height - paddle_height;
		if (com.y < 0)
			com.y = 0;

		if (ball.x + ball.radius > canvas_width)
		{
			// user.score++;
			$pongSocketStore.emit('onPlayerScored', {score: player1.score});
			resetBall(); // reset so that next frame we dont accidentally resend message
		}
		else if (ball.x - ball.radius < 0)
		{
			// com.score++;

			// opponent will emit itself so no need
			// $pongSocketStore.emit('onOpponentScored', {score: com.score});

			resetBall();
		}

		ball.x += ball.velocityX;
		ball.y += ball.velocityY;

		if (ball.y + ball.radius > canvas_height || ball.y - ball.radius < 0)
		{
			ball.velocityY = -ball.velocityY;
		}


		let player = (ball.x < canvas_width / 2) ? player1 : player2;
		if (collision(ball, player.paddle))
		{
			let collisionPoint = ball.y - (player.paddle.y + player.paddle.height / 2);
			collisionPoint = collisionPoint / (player.paddle.height / 2);

			let angleRad = (Math.PI / 4) * collisionPoint;
			let direction = (ball.x < canvas_width / 2) ? 1 : -1;
			ball.velocityX = direction * ball.speed * Math.cos(angleRad);
			ball.velocityY = ball.speed * Math.sin(angleRad);
			ball.speed += 0.2;
		}
	}

	function collision(ball: IBall, paddle: IPaddle)
	{
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

	function render()
	{
		reset_canvas();
		drawScore();
		drawNet();
		drawPaddle(player1.paddle);
		drawPaddle(player2.paddle);
		drawBall();
	}

	function loop()
	{
		Update();
		render();
		requestAnimationFrame(loop);
	}

</script>

<canvas bind:this={canvasElement} width="600" height="400"/>