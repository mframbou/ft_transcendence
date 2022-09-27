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

	enum GameMode
	{
		SINGLEPLAYER,
		MULTIPLAYER,
		SPECTATOR,
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
	let net: any;

	let collisionSinceLastBallUpdate: boolean;
	let animationFrameId: number;
	let lastGameUpdate: number = 0;
	let lastBallUpdate: number = 0;
	let lastPaddleMove: number = 0;

	let computerPaddleRandomOffset: number = 50;
	let gameMode: GameMode = GameMode.SINGLEPLAYER;

	export let spectateId: string = null;

	$: if (spectateId)
	{
		gameMode = GameMode.SPECTATOR;
	}


	//////////////////////////
	// Data denormalization //
	//////////////////////////
	function denormalizeBall(serverData: any)
	{
		return {
			x: serverData.x * canvas.width,
			y: serverData.y * canvas.height,
			velocityX: serverData.velocityX * canvas.width,
			velocityY: serverData.velocityY * canvas.height,
			speed: serverData.speed * canvas.width,
			radius: serverData.radius * canvas.width,
		}
	}

	function denormalizePaddles(serverData: any)
	{
		const denormalizedPaddle1 = {
			x: serverData.paddle1.x * canvas.width,
			y: serverData.paddle1.y * canvas.height,
			height: serverData.paddle1.height * canvas.height,
			width: serverData.paddle1.width * canvas.width,
		};

		const denormalizedPaddle2 = {
			x: serverData.paddle2.x * canvas.width,
			y: serverData.paddle2.y * canvas.height,
			height: serverData.paddle2.height * canvas.height,
			width: serverData.paddle2.width * canvas.width,
		};

		return { paddle1: denormalizedPaddle1, paddle2: denormalizedPaddle2 };
	}

	function denormalizePaddleYPos(serverData: any)
	{
		return {
			y: serverData.y * canvas.height,
		}
	}

	//////////////////////////////
	// Websocket event handlers //
	//////////////////////////////
	function handleBallUpdate(serverData: any, isSpectating: boolean, isPlayerOne?: boolean)
	{
		const denormalizedBall = denormalizeBall(serverData);

		ball.position.server_x = denormalizedBall.x;
		ball.position.server_y = denormalizedBall.y;
		ball.velocityX = denormalizedBall.velocityX;
		ball.velocityY = denormalizedBall.velocityY;
		ball.speed = denormalizedBall.speed;
		ball.radius = denormalizedBall.radius;

		if (!isSpectating && !isPlayerOne)
		{
			ball.velocityX *= -1;
			ball.position.server_x = canvas.width - ball.position.server_x;
		}

		lastBallUpdate = performance.now();
	}

	function handleBallReset(serverData: any, isSpectating: boolean, isPlayerOne?: boolean)
	{
		const denormalizedBall = denormalizeBall(serverData);

		ball.position.server_x = denormalizedBall.x;
		ball.position.server_y = denormalizedBall.y;
		ball.position.client_x = denormalizedBall.x;
		ball.position.client_y = denormalizedBall.y;
		ball.velocityX = denormalizedBall.velocityX;
		ball.velocityY = denormalizedBall.velocityY;
		ball.speed = denormalizedBall.speed;
		ball.radius = denormalizedBall.radius;

		if (!isSpectating && !isPlayerOne)
		{
			ball.velocityX *= -1;
			ball.position.server_x = canvas.width - ball.position.server_x;
			ball.position.client_x = canvas.width - ball.position.client_x;
		}

		lastBallUpdate = performance.now();
	}

	function handlePaddleReset(serverData: any)
	{
		const { paddle1, paddle2 } = denormalizePaddles(serverData);

		player1.paddle.position.server_x = paddle1.x;
		player1.paddle.position.server_y = paddle1.y;
		player1.paddle.position.client_x = paddle1.x;
		player1.paddle.position.client_y = paddle1.y;
		player1.paddle.width = paddle1.width;
		player1.paddle.height = paddle1.height;

		player2.paddle.position.server_x = paddle2.x;
		player2.paddle.position.server_y = paddle2.y;
		player2.paddle.position.client_x = paddle2.x;
		player2.paddle.position.client_y = paddle2.y;
		player2.paddle.width = paddle2.width;
		player2.paddle.height = paddle2.height;

		lastPaddleMove = performance.now();
	}

	function handlePaddleMove(serverData: any, player: IPLayer)
	{
		const denormalizedPaddle = denormalizePaddleYPos(serverData);

		player.paddle.position.server_y = denormalizedPaddle.y;

		lastPaddleMove = performance.now();
	}

	function handleScoreUpdate(serverData: any, isSpectating: boolean, isPlayerOne?: boolean)
	{
		if (isSpectating)
		{
			player1.score = serverData.player1Score;
			player2.score = serverData.player2Score;
		}
		else
		{
			if (isPlayerOne)
			{
				player1.score = serverData.player1Score;
				player2.score = serverData.player2Score;
			}
			else
			{
				player1.score = serverData.player2Score;
				player2.score = serverData.player1Score;
			}
		}
	}


	/////////////////////////
	// Game initialization //
	/////////////////////////
	function startOnlineGame(isPlayerOne: boolean)
	{
		gameMode = GameMode.MULTIPLAYER;

		// Only listen to movement of opposite player (not self user)
		const moveEventName = isPlayerOne ? 'player2Move' : 'player1Move';

		$pongSocket.on(moveEventName, (data) =>
		{
			handlePaddleMove(data, player2); // always player2 in multiplayer
		});

		$pongSocket.on('ballReset', (data) =>
		{
			collisionSinceLastBallUpdate = false;
			handleBallReset(data, false, isPlayerOne);
		});

		$pongSocket.on('scoreUpdate', (data) =>
		{
			handleScoreUpdate(data, false, isPlayerOne);
		});

		$pongSocket.on('resetPaddles', (data) =>
		{
			handlePaddleReset(data);
		});

		$pongSocket.on('ballUpdate', (data) =>
		{
			collisionSinceLastBallUpdate = false;
			handleBallUpdate(data, false, isPlayerOne);
		});

		lastGameUpdate = performance.now();
	}

	function startSpectatingGame()
	{
		$pongSocket.once('ballUpdate', (data) => {
			collisionSinceLastBallUpdate = false;
			handleBallUpdate(data, true);
		});

		$pongSocket.on('player1Move', (data) =>
		{
			handlePaddleMove(data, player1);
		});

		$pongSocket.on('player2Move', (data) =>
		{
			handlePaddleMove(data, player2);
		});

		$pongSocket.on('ballReset', (data) =>
		{
			collisionSinceLastBallUpdate = false;
			handleBallReset(data, true);
		});

		$pongSocket.on('scoreUpdate', (data) =>
		{
			handleScoreUpdate(data, true);
		});

		$pongSocket.on('resetPaddles', (data) =>
		{
			handlePaddleReset(data);
		});

		$pongSocket.on('ballUpdate', (data) =>
		{
			collisionSinceLastBallUpdate = false;
			handleBallUpdate(data, true);
		});

		lastGameUpdate = performance.now();
	}

	function listenForGameStart()
	{
		$pongSocket.on('gameStart', (data) =>
		{
			console.log(`Starting game, data: ${data}`);
			startOnlineGame(data.isPlayerOne);
		});
	}

	function initGameObjects(player1Color: string, player2Color: string, netColor: string, ballColor: string)
	{
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
				color: player1Color,
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
				color: player2Color,
			},
			score: 0
		};

		net = {
			x: canvas.width / 2 - 2,
			y: 0,
			width: 4,
			dashHeight: 20,
			dashGap: 10,
			color: netColor,
		};

		ball = {
			position: {
				client_x: canvas.width / 2,
				client_y: canvas.height / 2,
				server_x: canvas.width / 2,
				server_y: canvas.height / 2
			},
			radius: 10,
			// speed = 500 when canvas.width = 600, 1000 when width is 1200 etc.
			speed: 500 * (canvas.width / 600),
			velocityX: 0,
			velocityY: 0,
			color: ballColor,
		};

		computerPaddleRandomOffset = generateRandomPaddleOffset();
	}

	function launchSingleplayerBall()
	{
		const direction = Math.random() < 0.5 ? 1 : -1;
		ball.velocityX = ball.speed * direction;
		resetBall()
	}

	onMount(async () =>
	{
		context = <CanvasRenderingContext2D> canvas.getContext('2d', { alpha: false });

		initGameObjects('blue', 'red', 'white', 'white');

		if (gameMode === GameMode.SPECTATOR)
			startSpectatingGame();
		else
			listenForGameStart();

		if(gameMode === GameMode.SINGLEPLAYER)
			launchSingleplayerBall();

		animationFrameId = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(animationFrameId);
		}
	});

	///////////////
	// Rendering //
	///////////////
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

	function drawPaddle(paddle: IPaddle)
	{
		context.fillStyle = paddle.color;
		context.fillRect(paddle.position.client_x, paddle.position.client_y, paddle.width, paddle.height);
	}

	function drawBall(ball: IBall)
	{
		drawCircle(ball.position.client_x, ball.position.client_y, ball.radius, ball.color);
	}

	function clearCanvas(color: string = 'black')
	{
		drawRect(0, 0, canvas.width, canvas.height, color);
	}

	function drawNet()
	{
		context.lineWidth = net.width;
		context.strokeStyle = net.color;
		context.beginPath();
		context.setLineDash([net.dashHeight, net.dashGap]);
		// context.lineDashOffset = net.dashHeight / 2;
		context.moveTo(net.x + net.width / 2, net.y);
		context.lineTo(net.x, canvas.height);
		context.stroke();
		context.setLineDash([]);
	}

	function drawScore(color: string = 'white')
	{
		drawText(player1.score.toString(), canvas.width / 4, canvas.height / 5, color);
		drawText(player2.score.toString(), 3 * canvas.width / 4, canvas.height / 5, color);
	}

	///////////
	// Utils //
	///////////
	function lerp(start: number, end: number, t: number)
	{
		return start * (1 - t) + end * t;
	}

	function generateRandomPaddleOffset()
	{
		// since offset is more than half of paddle height, sometimes computer will not be able to reach the ball (because computer wants to center its target pos to paddle)
		return Math.random() * (player2.paddle.height / 1.75);
	}

	/////////////////////
	// Game Management //
	/////////////////////
	function emitPaddleMove(y: number)
	{
		// only emit once every 10ms at most
		if (performance.now() - lastPaddleMove > 10)
		{
			const yRatio = y / canvas.height;
			$pongSocket.emit('paddleMove', { y: yRatio });
			lastPaddleMove = performance.now();
		}
	}

	function limitPaddleMovement(paddle: IPaddle)
	{
		if (paddle.position.client_y < 0)
				paddle.position.client_y = 0;
		else if (paddle.position.client_y + paddle.height > canvas.height)
				paddle.position.client_y = canvas.height - paddle.height;
	}

	function movePaddle(paddle: IPaddle, y: number)
	{
		paddle.position.client_y = y;
		limitPaddleMovement(paddle);
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

	function handleMouse(event: MouseEvent)
	{
		if (spectateId !== null)
			return;

		let rect = canvas.getBoundingClientRect();

		// y is offset by half the paddle height (so when mouse is on top y = -50) so that paddle is centered
		const y = event.clientY - rect.top - player1.paddle.height / 2;
		emitPaddleMove(y);
		movePaddle(player1.paddle, y);
	}

	function resetBall()
	{
		ball.position.client_x = canvas.width / 2;
		ball.position.client_y = canvas.height / 2;;
		ball.speed = 500 * (canvas.width / 600);
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

	function update()
	{
		////////////////
		// Delta time //
		////////////////
		const now = performance.now();
		const deltaTime = now - lastGameUpdate;
		lastGameUpdate = now;
		const updateMultiplier = deltaTime / 1000; // === 1 at 1 fps, 0.5 at 2 fps etc.

		//////////////
		// MOVEMENT //
		//////////////
		if (gameMode === GameMode.MULTIPLAYER)
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
				movePaddle(player1.paddle, player1.paddle.position.client_y - moveDistance);
				emitPaddleMove(player1.paddle.position.client_y);
			}

			if (pressedKeys.includes('ArrowDown'))
			{
				movePaddle(player1.paddle, player1.paddle.position.client_y + moveDistance);
				emitPaddleMove(player1.paddle.position.client_y);
			}
		}

		/////////////////
		// BALL UPDATE //
		/////////////////
		ball.position.client_x += ball.velocityX * updateMultiplier;
		ball.position.client_y += ball.velocityY * updateMultiplier;

		if (gameMode !== GameMode.SINGLEPLAYER && !collisionSinceLastBallUpdate)
		{
			// lerp ball to server position if no collision (should already be almost equivalent client pos and server pos)
			const elapsedTimeSinceBallUpdate = now - lastBallUpdate;
			const ballUpdateMultiplier = elapsedTimeSinceBallUpdate / 1000;

			// predict server ball position using lastBallupdate knowing velocity is how much ball moves every second
			const ballPredictedPosition = {
				x: ball.position.server_x + ball.velocityX * ballUpdateMultiplier,
				y: ball.position.server_y + ball.velocityY * ballUpdateMultiplier,
			};

			const lerpFactor = 0.1;
			ball.position.client_x = lerp(ball.position.client_x, ballPredictedPosition.x, lerpFactor);
			ball.position.client_y = lerp(ball.position.client_y, ballPredictedPosition.y, lerpFactor);
		}

		if (gameMode === GameMode.SPECTATOR)
			player1.paddle.position.client_y = lerp(player1.paddle.position.client_y, player1.paddle.position.server_y, 0.2);

		if (gameMode === GameMode.SINGLEPLAYER)
		{
			// Computer player2
			const targetPosition = ball.position.client_y - player2.paddle.height / 2 + computerPaddleRandomOffset;
			const computerPosition = lerp(player2.paddle.position.client_y, targetPosition, 0.1);
			movePaddle(player2.paddle, computerPosition);
		}
		else
		{
			// real player 2
			player2.paddle.position.client_y = lerp(player2.paddle.position.client_y, player2.paddle.position.server_y, 0.2);
		}

		// floor and ceiling collision
		if ((ball.position.client_y + ball.radius > canvas.height && ball.velocityY > 0) || (ball.position.client_y - ball.radius < 0 && ball.velocityY < 0))
		{
			collisionSinceLastBallUpdate = true;
			ball.velocityY = -ball.velocityY;
		}

		// ball out of bounds in singeplayer
		if (gameMode === GameMode.SINGLEPLAYER)
		{
			if (ball.position.client_x + ball.radius > canvas.width)
			{
				player1.score++;
				resetBall(); // reset ball before sending new ball otherwise it would only reset on the next update
			}
			else if (ball.position.client_x - ball.radius < 0)
			{
				player2.score++;
				resetBall();
			}
		}

		const paddle = ball.velocityX < 0 ? player1.paddle : player2.paddle;
		if (checkCollision(ball, paddle))
		{
			// when collision, dont lerp ball position with server position until a new ball update is received
			collisionSinceLastBallUpdate = true;

			const collisionPoint = (ball.position.client_y - (paddle.position.client_y + paddle.height / 2)) / (paddle.height / 2);
			const angleRad = (Math.PI / 4) * collisionPoint; // anglee is between -45 and 45 degrees
			ball.speed *= 1.05;
			const direction = ball.velocityX > 0 ? -1 : 1;
			ball.velocityX = ball.speed * Math.cos(angleRad) * direction;
			ball.velocityY = ball.speed * Math.sin(angleRad);

			if (gameMode === GameMode.SINGLEPLAYER)
				computerPaddleRandomOffset = generateRandomPaddleOffset();
		}
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