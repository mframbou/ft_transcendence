<script lang="ts">

	import { onMount } from 'svelte';
	import { pongSocket } from '$lib/websocket-stores';

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

	// make paddle width and height dynamic, width = 10 when canvas width is 600, height = 100 when canvas height is 400
	// these are only useful in solo because at the beginning of the game the server sends the paddle dimensions (and to avoid paddle changing size when starting game because they are same value)
	const PADDLE_WIDTH_RATIO = 10 / 600;
	const PADDLE_HEIGHT_RATIO = 100 / 400;

	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D;

	let player1: IPLayer;
	let player2: IPLayer;
	let ball: IBall;
	let net:any;

	let collisionSinceLastBallUpdate: boolean;
	let isInGame = false;
	let animationFrameId: number;
	let lastUpdate: number = 0;
	let lastBallUpdate: number = 0;
	let lastPaddleMove: number = 0;

    const computerLevel = 50;
    let paddlerandom = Math.random() * computerLevel;

	export let spectateId: string = null;

	function startGame(isPlayerOne: boolean)
	{
		isInGame = true;

		// Only listen to movement of opposite player (not self user)
		const moveEventName = isPlayerOne ? 'player2Move' : 'player1Move';

		$pongSocket.on(moveEventName, (data) =>
		{
			player2.paddle.position.server_y = data.y * canvas.height;
		});

		$pongSocket.on('ballReset', (data) =>
		{
			collisionSinceLastBallUpdate = false;

			const denormalizedBall = {
				x: data.x * canvas.width,
				y: data.y * canvas.height,
				velocityX: data.velocityX * canvas.width,
				velocityY: data.velocityY * canvas.height,
				speed: data.speed * canvas.width,
			}

			ball.position.client_x = denormalizedBall.x;
			ball.position.client_y = denormalizedBall.y;
			ball.position.server_x = denormalizedBall.x;
			ball.position.server_y = denormalizedBall.y;
			ball.velocityX = denormalizedBall.velocityX * (isPlayerOne ? 1 : -1);
			ball.velocityY = denormalizedBall.velocityY;
			ball.speed = denormalizedBall.speed;

			lastBallUpdate = performance.now();
		});

		$pongSocket.on('scoreUpdate', (data) =>
		{
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


		$pongSocket.on('resetPaddles', (data) =>
		{
			const denormalizedPaddle1 = {
				x: data.paddle1.x * canvas.width,
				y: data.paddle1.y * canvas.height,
				height: data.paddle1.height * canvas.height,
				width: data.paddle1.width * canvas.width,
			};

			const denormalizedPaddle2 = {
				x: data.paddle2.x * canvas.width,
				y: data.paddle2.y * canvas.height,
				height: data.paddle2.height * canvas.height,
				width: data.paddle2.width * canvas.width,
			};

			player1.paddle.position.client_x = denormalizedPaddle1.x;
			player1.paddle.position.client_y = denormalizedPaddle1.y;
			player1.paddle.position.server_x = denormalizedPaddle1.x;
			player1.paddle.position.server_y = denormalizedPaddle1.y;
			player1.paddle.height = denormalizedPaddle1.height;
			player1.paddle.width = denormalizedPaddle1.width;

			player2.paddle.position.client_x = denormalizedPaddle2.x;
			player2.paddle.position.client_y = denormalizedPaddle2.y;
			player2.paddle.position.server_x = denormalizedPaddle2.x;
			player2.paddle.position.server_y = denormalizedPaddle2.y;
			player2.paddle.height = denormalizedPaddle2.height;
			player2.paddle.width = denormalizedPaddle2.width;
		});

		$pongSocket.on('ballUpdate', (data) =>
		{
			collisionSinceLastBallUpdate = false;

			const denormalizedBall = {
				x: data.x * canvas.width,
				y: data.y * canvas.height,
				velocityX: data.velocityX * canvas.width,
				velocityY: data.velocityY * canvas.height,
				radius: data.radius * canvas.width,
				speed: data.speed * canvas.width,
			}

			ball.radius = denormalizedBall.radius;
			ball.speed = denormalizedBall.speed;

			ball.position.server_x = denormalizedBall.x;
			ball.position.server_y = denormalizedBall.y;

			ball.velocityX = denormalizedBall.velocityX * (isPlayerOne ? 1 : -1);
			ball.velocityY = denormalizedBall.velocityY;

			if (!isPlayerOne)
			{
				ball.position.server_x = canvas.width - ball.position.server_x;
			}

			lastBallUpdate = performance.now();
		});

		lastUpdate = performance.now();
	}

	function startSpectate()
	{

		$pongSocket.once('ballUpdate', (data) => {
			const denormalizedBall = {
				x: data.x * canvas.width,
				y: data.y * canvas.height,
				velocityX: data.velocityX * canvas.width,
				velocityY: data.velocityY * canvas.height,
				radius: data.radius * canvas.width,
				speed: data.speed * canvas.width,
			}

			ball.radius = denormalizedBall.radius;
			ball.speed = denormalizedBall.speed;
			ball.position.server_x = denormalizedBall.x;
			ball.position.server_y = denormalizedBall.y;
			ball.velocityX = denormalizedBall.velocityX;
			ball.velocityY = denormalizedBall.velocityY;
			lastBallUpdate = performance.now();
		})

		$pongSocket.on('player1Move', (data) =>
		{
			player1.paddle.position.server_y = data.y * canvas.height;
		});

		$pongSocket.on('player2Move', (data) =>
		{
			player2.paddle.position.server_y = data.y * canvas.height;
		});

		$pongSocket.on('ballReset', (data) =>
		{
			collisionSinceLastBallUpdate = false;

			const denormalizedBall = {
				x: data.x * canvas.width,
				y: data.y * canvas.height,
				velocityX: data.velocityX * canvas.width,
				velocityY: data.velocityY * canvas.height,
				speed: data.speed * canvas.width,
			}

			ball.position.client_x = denormalizedBall.x;
			ball.position.client_y = denormalizedBall.y;
			ball.position.server_x = denormalizedBall.x;
			ball.position.server_y = denormalizedBall.y;
			ball.velocityX = denormalizedBall.velocityX;
			ball.velocityY = denormalizedBall.velocityY;
			ball.speed = denormalizedBall.speed;

			lastBallUpdate = performance.now();
		});

		$pongSocket.on('scoreUpdate', (data) =>
		{
			player1.score = data.player1Score;
			player2.score = data.player2Score;
			drawScore();
		});


		$pongSocket.on('resetPaddles', (data) =>
		{
			const denormalizedPaddle1 = {
				x: data.paddle1.x * canvas.width,
				y: data.paddle1.y * canvas.height,
				height: data.paddle1.height * canvas.height,
				width: data.paddle1.width * canvas.width,
			};

			const denormalizedPaddle2 = {
				x: data.paddle2.x * canvas.width,
				y: data.paddle2.y * canvas.height,
				height: data.paddle2.height * canvas.height,
				width: data.paddle2.width * canvas.width,
			};

			player1.paddle.position.client_x = denormalizedPaddle1.x;
			player1.paddle.position.client_y = denormalizedPaddle1.y;
			player1.paddle.position.server_x = denormalizedPaddle1.x;
			player1.paddle.position.server_y = denormalizedPaddle1.y;
			player1.paddle.height = denormalizedPaddle1.height;
			player1.paddle.width = denormalizedPaddle1.width;

			player2.paddle.position.client_x = denormalizedPaddle2.x;
			player2.paddle.position.client_y = denormalizedPaddle2.y;
			player2.paddle.position.server_x = denormalizedPaddle2.x;
			player2.paddle.position.server_y = denormalizedPaddle2.y;
			player2.paddle.height = denormalizedPaddle2.height;
			player2.paddle.width = denormalizedPaddle2.width;
		});

		$pongSocket.on('ballUpdate', (data) =>
		{
			collisionSinceLastBallUpdate = false;

			const denormalizedBall = {
				x: data.x * canvas.width,
				y: data.y * canvas.height,
				velocityX: data.velocityX * canvas.width,
				velocityY: data.velocityY * canvas.height,
				radius: data.radius * canvas.width,
				speed: data.speed * canvas.width,
			}

			ball.radius = denormalizedBall.radius;
			ball.speed = denormalizedBall.speed;

			ball.position.server_x = denormalizedBall.x;
			ball.position.server_y = denormalizedBall.y;

			ball.velocityX = denormalizedBall.velocityX;
			ball.velocityY = denormalizedBall.velocityY;

			lastBallUpdate = performance.now();
		});

		lastUpdate = performance.now();
	}

	onMount(async () =>
	{
		context = canvas.getContext('2d') as CanvasRenderingContext2D;

		if (spectateId !== null)
			startSpectate();
		else
		{
			$pongSocket.on('gameStart', (data) => {
				console.log("STARTING GAME:", data);
				startGame(data.isPlayerOne);
			});
		}

		player1 = {
			paddle: {
				position: {
						client_x: 0,
						client_y: canvas.height / 2 - (PADDLE_HEIGHT_RATIO * canvas.height) / 2,
						server_x: 0,
						server_y: canvas.height / 2 - (PADDLE_HEIGHT_RATIO * canvas.height) / 2
				},
				width: PADDLE_WIDTH_RATIO * canvas.width,
				height: PADDLE_HEIGHT_RATIO * canvas.height,
				color: 'blue',
			},
			score: 0
		};

		player2 = {
			paddle: {
				position: {
						client_x: canvas.width - (PADDLE_WIDTH_RATIO * canvas.width),
						client_y: canvas.height / 2 - (PADDLE_HEIGHT_RATIO * canvas.height) / 2,
						server_x: canvas.width - (PADDLE_WIDTH_RATIO * canvas.width),
						server_y: canvas.height / 2 - (PADDLE_HEIGHT_RATIO * canvas.height) / 2
				},
				width: PADDLE_WIDTH_RATIO * canvas.width,
				height: PADDLE_HEIGHT_RATIO * canvas.height,
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
			speed: 0,
			velocityX: 0,
			velocityY: 0,
			color: 'white',
		};

        if(!isInGame)
        {
            Math.random() < 0.5 ?     ball.velocityX = 500 : ball.velocityX = -500;
            resetBall();
        }

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
		drawCircle(ball.position.client_x, ball.position.client_y, ball.radius, ball.color);
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
		context.arc(x, y, r, 0, Math.PI * 2);
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


	function emitPaddleMove(y: number)
	{
		// only emit once every 10ms at most
		if (performance.now() - lastPaddleMove > 10)
		{
			// ratio
			$pongSocket.emit('paddleMove', {y: y / canvas.height});
			lastPaddleMove = performance.now();
		}
	}

    function LimitPaddleMovement(paddle: IPaddle)
    {
        if (paddle.position.client_y < 0)
            paddle.position.client_y = 0;
        else if (paddle.position.client_y + paddle.height > canvas.height)
            paddle.position.client_y = canvas.height - paddle.height;
    }    

	function movePaddle(y: number)
	{
		player1.paddle.position.client_y = y;

		LimitPaddleMovement(player1.paddle);

    }

	// Only handle inputs if not in spectator mode
	let pressedKeys: string[] = [];
	function handleKeyDown(event: KeyboardEvent)
	{
		if (spectateId !== null)
			return;

		pressedKeys.push(event.key);
	}

	function handleKeyUp(event: KeyboardEvent)
	{
		if (spectateId !== null)
			return;

		pressedKeys = pressedKeys.filter((key: string) => key !== event.key);
	}

	function lerp(start: number, end: number, t: number)
	{
		return start * (1 - t) + end * t;
	}

	function handleMouse(event: MouseEvent)
	{
		if (spectateId !== null)
			return;

		let rect = canvas.getBoundingClientRect();

		// y = center of paddle
		emitPaddleMove(event.clientY - rect.top - (player1.paddle.height / 2));
		movePaddle(event.clientY - rect.top - player1.paddle.height / 2);
	}

    function IsNotSpectactorMode()
    {
        return spectateId === null
    }

	function update()
	{
		const now = performance.now();
		const deltaTime = now - lastUpdate;
		lastUpdate = now;

		const updateMultiplier = deltaTime / 1000; // === 1 at 1 fps, 0.5 at 2 fps etc.

		//////////////
		// MOVEMENT //
		//////////////
		if (IsNotSpectactorMode())
		{
			let speedMultiplier = 1;
			if (pressedKeys.includes('Shift'))
				speedMultiplier = 2;

			if (pressedKeys.includes('Control'))
				speedMultiplier = 0.5;

			// means 3 times the paddle height every second (at normal speeed)
			const moveDistance = player1.paddle.height * 3 * speedMultiplier * updateMultiplier;

			if (pressedKeys.includes('ArrowUp'))
			{
				emitPaddleMove(player1.paddle.position.client_y - moveDistance);
				movePaddle(player1.paddle.position.client_y - moveDistance);
			}

			if (pressedKeys.includes('ArrowDown'))
			{
				emitPaddleMove(player1.paddle.position.client_y + moveDistance);
				movePaddle(player1.paddle.position.client_y + moveDistance);
			}
		}

		/////////////////
		// BALL UPDATE //
		/////////////////
		ball.position.client_x += ball.velocityX * updateMultiplier;
		ball.position.client_y += ball.velocityY * updateMultiplier;

		// lerp ball to server position if no collision (should already be almost equivalent client pos and server pos)
		if (isInGame && !collisionSinceLastBallUpdate)
		{
			const elapsedTimeSinceBallUpdate = now - lastBallUpdate;
			const ballUpdateMultiplier = elapsedTimeSinceBallUpdate / 1000;

			// predict server ball position using lastBallupdate knowing velocity is how much ball moves every second
			const ballPredictedPosition = {
				x: ball.position.server_x + ball.velocityX * ballUpdateMultiplier,
				y: ball.position.server_y + ball.velocityY * ballUpdateMultiplier,
			};

			// console.log(`ball pos: ${ball.position.client_x}, ${ball.position.client_y}, velocity ${ball.velocityY}, ${ball.velocityY} | ball predicted pos: ${ballPredictedPosition.x}, ${ballPredictedPosition.y} | ball server pos: ${ball.position.server_x}, ${ball.position.server_y}`);
			const lerpFactor = 0.1;
			// lerp ball position to predicted position
			ball.position.client_x = lerp(ball.position.client_x, ballPredictedPosition.x, lerpFactor);
			ball.position.client_y = lerp(ball.position.client_y, ballPredictedPosition.y, lerpFactor);
		}



		if (spectateId !== null)
		{
			player1.paddle.position.client_y = lerp(player1.paddle.position.client_y, player1.paddle.position.server_y, 0.2);
		}
        if(IsNotSpectactorMode() && !isInGame)
        {
           
           
            player2.paddle.position.client_y  = ball.position.client_y -  player2.paddle.height/2 + paddlerandom;

            //player2.paddle.position.client_y = ball.position.client_y - player2.paddle.height / 2; 
            LimitPaddleMovement(player2.paddle);
        }
        else
		    player2.paddle.position.client_y = lerp(player2.paddle.position.client_y, player2.paddle.position.server_y, 0.2);

		if ((ball.position.client_y + ball.radius > canvas.height && ball.velocityY > 0) || (ball.position.client_y - ball.radius < 0 && ball.velocityY < 0))
		{
			collisionSinceLastBallUpdate = true;

			ball.velocityY = -ball.velocityY;
		}
		const paddle = ball.velocityX < 0 ? player1.paddle : player2.paddle;

        if(!isInGame)
        {

            if (ball.position.client_x + ball.radius > canvas.width)
            {
                player1.score++;
                resetBall(); // reset ball before sending new ball otherwise it would only reset on the next update
                drawScore();
            }
            else if (ball.position.client_x - ball.radius < 0)
            {
                player2.score++;
                resetBall();
                drawScore();
            }
        }



		// when collision, dont lerp ball position with server position until a new ball update is received
		if (checkCollision(ball, paddle))
		{
			collisionSinceLastBallUpdate = true;

			const collisionPoint = (ball.position.client_y - (paddle.position.client_y + paddle.height / 2)) / (paddle.height / 2);
			const angleRad = (Math.PI / 4) * collisionPoint; // anglee is between -45 and 45 degrees
			ball.speed *= 1.05;
			const direction = ball.velocityX > 0 ? -1 : 1;
			ball.velocityX = ball.speed * Math.cos(angleRad) * direction;
			ball.velocityY = ball.speed * Math.sin(angleRad);

           paddlerandom =  Math.random() * computerLevel;

		}
	}

    function resetBall()
	{
		ball.position.client_x = canvas.width / 2;
		ball.position.client_y = canvas.height / 2;;
		ball.speed = 500;
		ball.velocityX = -ball.velocityX;
		// random angle between -30 and 30 degrees
		const angleRad = (Math.random() -0.5) * (Math.PI / 3);
		ball.velocityY = ball.speed * Math.sin(angleRad);
	}


	function checkCollision(ball: IBall, paddle: IPaddle)
	{
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