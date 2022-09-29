<script lang="ts">

	import { onMount } from 'svelte';
	import { pongSocket, pongSocketConnected } from '$lib/websocket-stores';

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
		width: number;
		height: number;
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

	interface INet
	{
		x: number;
		y: number;
		width: number;
		dashHeight: number;
		dashGap: number;
		color: string;
	}

	enum GameMode
	{
		SINGLEPLAYER,
		MULTIPLAYER,
		SPECTATOR,
	}

	// when canvas is 600x400
	const PADDLE_BASE_WIDTH = 10;
	const PADDLE_BASE_HEIGHT = 100;

	const CANVAS_BASE_WIDTH =	600;
	const CANVAS_BASE_HEIGHT = 400;

	const BALL_BASE_WIDTH = 20;
	const BALL_BASE_HEIGHT = 20;

	const SOLO_BALL_RESET_PAUSE_TIME = 500; // Time to wait between score and ball launch (0 is really not fun to play)

	let canvas: HTMLCanvasElement;
	let pongWrapper: HTMLDivElement;
	let context: CanvasRenderingContext2D;

	let player1: IPLayer;
	let player2: IPLayer;
	let ball: IBall;
	let net: INet;

	let collisionSinceLastBallUpdate: boolean;
	let animationFrameId: number;
	let lastGameUpdate: number = 0;
	let lastBallUpdate: number = 0;
	let lastPaddleMove: number = 0;

	let computerPaddleRandomOffset: number = 50;
	let gameMode: GameMode = GameMode.SINGLEPLAYER;

	export let spectateId: string = null;
	export let ballAspect: 'square' | 'circle' = 'circle';
	export let currentMode: 'SINGLEPLAYER' | 'MULTIPLAYER' | 'SPECTATOR' = 'SINGLEPLAYER'; // to pass data to parent, prevents parent from modifying it and breaking everything by copying gameMode (+ string instead of enum)

	$: {
		switch(gameMode)
		{
			case GameMode.SINGLEPLAYER:
				currentMode = 'SINGLEPLAYER';
				break;
			case GameMode.MULTIPLAYER:
				currentMode = 'MULTIPLAYER';
				break;
			case GameMode.SPECTATOR:
				currentMode = 'SPECTATOR';
				break;
		}
	}

	$: if (spectateId)
	{
		gameMode = GameMode.SPECTATOR;
	}


	//////////////////////////
	// Data denormalization //
	//////////////////////////
	function denormalizeBall(ball: IBall): IBall
	{
		return {
			velocityX: ball.velocityX * canvas.width,
			velocityY: ball.velocityY * canvas.height,
			position: {
				client_x: ball.position.client_x * canvas.width,
				client_y: ball.position.client_y * canvas.height,
				server_x: ball.position.server_x * canvas.width,
				server_y: ball.position.server_y * canvas.height,
			},
			width: ball.width * canvas.width,
			height: ball.height * canvas.height,
			speed: ball.speed * canvas.width,
			color: ball.color,
		};
	}

	function denormalizePaddle(paddle: IPaddle): IPaddle
	{
		return {
			position: {
				client_x: paddle.position.client_x * canvas.width,
				client_y: paddle.position.client_y * canvas.height,
				server_x: paddle.position.server_x * canvas.width,
				server_y: paddle.position.server_y * canvas.height,
			},
			width: paddle.width * canvas.width,
			height: paddle.height * canvas.height,
			color: paddle.color,
		};
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
		ball.position.server_x = serverData.x;
		ball.position.server_y = serverData.y;
		ball.velocityX = serverData.velocityX;
		ball.velocityY = serverData.velocityY;
		ball.speed = serverData.speed;
		ball.width = serverData.width;
		ball.height = serverData.height;

		if (!isSpectating && !isPlayerOne)
		{
			ball.velocityX *= -1;
			ball.position.server_x = (canvas.width - (ball.position.server_x * canvas.width)) / canvas.width;
		}

		lastBallUpdate = performance.now();
	}

	function handleBallReset(serverData: any, isSpectating: boolean, isPlayerOne?: boolean)
	{
		ball.position.server_x = serverData.x;
		ball.position.server_y = serverData.y;
		ball.position.client_x = serverData.x;
		ball.position.client_y = serverData.y;
		ball.velocityX = serverData.velocityX;
		ball.velocityY = serverData.velocityY;
		ball.speed = serverData.speed;
		ball.width = serverData.width;
		ball.height = serverData.height;

		if (!isSpectating && !isPlayerOne)
		{
			ball.velocityX *= -1;
			// reverse normalized position (because it's normalized for the server) (so we need to denormalize and renormalize)
			ball.position.server_x = (canvas.width - (ball.position.server_x * canvas.width)) / canvas.width;
		}

		lastBallUpdate = performance.now();
	}

	function handlePaddleReset(serverData: any)
	{
		player1.paddle.position.server_x = serverData.paddle1.x;
		player1.paddle.position.server_y = serverData.paddle1.y;
		player1.paddle.position.client_x = serverData.paddle1.x;
		player1.paddle.position.client_y = serverData.paddle1.y;
		player1.paddle.width = serverData.paddle1.width;
		player1.paddle.height = serverData.paddle1.height;

		player2.paddle.position.server_x = serverData.paddle2.x;
		player2.paddle.position.server_y = serverData.paddle2.y;
		player2.paddle.position.client_x = serverData.paddle2.x;
		player2.paddle.position.client_y = serverData.paddle2.y;
		player2.paddle.width = serverData.paddle2.width;
		player2.paddle.height = serverData.paddle2.height;

		lastPaddleMove = performance.now();
	}

	function handlePaddleMove(serverData: any, player: IPLayer)
	{
		player.paddle.position.server_y = serverData.y;

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
			console.log(`Starting game, data: ${JSON.stringify(data)}, player1? ${data.isPlayerOne}`);
			startOnlineGame(data.isPlayerOne);
		});
	}

	function initGameObjects(player1Color: string, player2Color: string, netColor: string, ballColor: string)
	{
		player1 = {
			paddle: {
				position: {
					client_x: 0,
					client_y: 0.5 - (PADDLE_BASE_HEIGHT / CANVAS_BASE_HEIGHT) / 2, // 0 = top of canvasm 1 = bottom, everything is normalized
					server_x: 0,
					server_y: 0.5 - (PADDLE_BASE_HEIGHT / CANVAS_BASE_HEIGHT) / 2,
				},
				width: PADDLE_BASE_WIDTH / CANVAS_BASE_WIDTH,
				height: PADDLE_BASE_HEIGHT / CANVAS_BASE_HEIGHT,
				color: player1Color,
			},
			score: 0
		};

		player2 = {
			paddle: {
				position: {
					client_x: 1 - (PADDLE_BASE_WIDTH / CANVAS_BASE_WIDTH),
					client_y: 0.5 - (PADDLE_BASE_HEIGHT / CANVAS_BASE_HEIGHT) / 2,
					server_x: 1 - (PADDLE_BASE_WIDTH / CANVAS_BASE_WIDTH),
					server_y: 0.5 - (PADDLE_BASE_HEIGHT / CANVAS_BASE_HEIGHT) / 2,
				},
				width: PADDLE_BASE_WIDTH / CANVAS_BASE_WIDTH,
				height: PADDLE_BASE_HEIGHT / CANVAS_BASE_HEIGHT,
				color: player2Color,
			},
			score: 0
		};

		net = {
			x: 0.5 - (4 / CANVAS_BASE_WIDTH) / 2,
			y: 0,
			width: 4 / CANVAS_BASE_WIDTH,
			dashHeight: 20 / CANVAS_BASE_HEIGHT,
			dashGap: 10 / CANVAS_BASE_HEIGHT,
			color: netColor,
		};

		ball = {
			position: {
				client_x: 0.5,
				client_y: 0.5,
				server_x: 0.5,
				server_y: 0.5,
			},
			width: BALL_BASE_WIDTH / CANVAS_BASE_WIDTH,
			height: BALL_BASE_HEIGHT / CANVAS_BASE_HEIGHT,
			// speed = 500 when canvas.width = 600, 1000 when width is 1200 etc.
			speed: 500 / CANVAS_BASE_WIDTH,
			velocityX: 0,
			velocityY: 0,
			color: ballColor,
		};

		computerPaddleRandomOffset = generateRandomPaddleOffset();
	}

	function launchSingleplayerBall()
	{
		const direction = Math.random() < 0.5 ? 1 : -1;
		ball.velocityX = direction * ball.speed;
		resetBall();
	}

	// https://www.reddit.com/r/sveltejs/comments/rn3vp0/is_there_any_difference_between_ondestroy_and_the/
	// if onMount is async, it's return value is not called
	onMount(() =>
	{
		context = <CanvasRenderingContext2D> canvas.getContext('2d', { alpha: false });
		handleResize();

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

	function drawEllipse(x: number, y: number, width: number, height: number, color: string)
	{
		context.fillStyle = color;
		context.beginPath();
		context.ellipse(x, y, width / 2, height / 2, 0, 0, 2 * Math.PI);
		context.closePath();
		context.fill();
	}

	function drawText(text: string, x: number, y: number, color: string)
	{
		context.fillStyle = color;
		context.font = `${(50/400) * canvas.width}px fantasy`;
		context.fillText(text, x, y);
	}

	function drawPaddle(paddle: IPaddle)
	{
		const denormalizedPaddle = {
			x: paddle.position.client_x * canvas.width,
			y: paddle.position.client_y * canvas.height,
			width: paddle.width * canvas.width,
			height: paddle.height * canvas.height,
		};

		context.fillStyle = paddle.color;
		context.fillRect(denormalizedPaddle.x, denormalizedPaddle.y, denormalizedPaddle.width, denormalizedPaddle.height);
	}

	function drawBall(ball: IBall)
	{
		const denormalizedBall = {
			x: ball.position.client_x * canvas.width,
			y: ball.position.client_y * canvas.height,
			width: ball.width * canvas.width,
			height: ball.height * canvas.height,
		};

		// ball x/y is the center of the ball
		if (ballAspect === 'circle')
			drawEllipse(denormalizedBall.x, denormalizedBall.y, denormalizedBall.width, denormalizedBall.height, ball.color);
		else
			drawRect(denormalizedBall.x - denormalizedBall.width / 2, denormalizedBall.y - denormalizedBall.height / 2, denormalizedBall.width, denormalizedBall.height, ball.color);
	}

	function clearCanvas(color: string = 'black')
	{
		drawRect(0, 0, canvas.width, canvas.height, color);
	}

	function drawNet()
	{
		const denormalizedNet = {
			x: net.x * canvas.width,
			y: net.y * canvas.height,
			width: net.width * canvas.width,
			dashHeight: net.dashHeight * canvas.height,
			dashGap: net.dashGap * canvas.height,
		};

		context.lineWidth = denormalizedNet.width;
		context.strokeStyle = net.color;
		context.beginPath();
		context.setLineDash([denormalizedNet.dashHeight, denormalizedNet.dashGap]);
		context.moveTo(denormalizedNet.x, denormalizedNet.y);
		context.lineTo(denormalizedNet.x, canvas.height);
		context.stroke();
		context.setLineDash([]);
		context.lineWidth = 1;
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
		return (Math.random() - 0.5) * (player2.paddle.height / 0.95);
	}

	/////////////////////
	// Game Management //
	/////////////////////
	function emitPaddleMove(y: number)
	{
		// only emit once every 10ms at most
		if (performance.now() - lastPaddleMove > 10)
		{
			// const yRatio = y / canvas.height;
			if ($pongSocketConnected)
			{
				$pongSocket.emit('paddleMove', { y: y });
			}
			lastPaddleMove = performance.now();
		}
	}

	function limitPaddleMovement(paddle: IPaddle)
	{
		if (paddle.position.client_y < 0)
				paddle.position.client_y = 0;
		else if (paddle.position.client_y + paddle.height > 1)
				paddle.position.client_y = 1 - paddle.height;
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
		if (gameMode === GameMode.SPECTATOR)
			return;

		pressedKeys.push(event.key);
	}

	function handleKeyUp(event: KeyboardEvent)
	{
		if (gameMode === GameMode.SPECTATOR)
			return;

		pressedKeys = pressedKeys.filter((key: string) => key !== event.key);
	}

	function handleMouse(event: MouseEvent)
	{
		if (gameMode === GameMode.SPECTATOR)
			return;

		const rect = canvas.getBoundingClientRect();

		// y is offset by half the paddle height (so when mouse is on top y = -50) so that paddle is centered
		const y = (event.clientY - rect.top - (player1.paddle.height * canvas.height) / 2) / canvas.height;
		movePaddle(player1.paddle, y);
		if (gameMode === GameMode.MULTIPLAYER)
			emitPaddleMove(player1.paddle.position.client_y);
	}

	function handleDrag(event: TouchEvent)
	{
		if (gameMode === GameMode.SPECTATOR)
			return;

		const rect = canvas.getBoundingClientRect();

		const y = (event.touches[0].clientY - rect.top - (player1.paddle.height * canvas.height) / 2) / canvas.height;
		movePaddle(player1.paddle, y);
		if (gameMode === GameMode.MULTIPLAYER)
			emitPaddleMove(player1.paddle.position.client_y);
	}

	function resetBall()
	{
		// https://www.npmjs.com/package/set-interval-async
		ball.position.client_x = 0.5;
		ball.position.client_y = 0.5;
		ball.speed = 500 / CANVAS_BASE_WIDTH;
		const direction = ball.velocityX > 0 ? -1 : 1;
		ball.velocityX = direction * (ball.speed * 0.7); // launch ball at 70% speed after reset (will be normal speeed after first hit)
		// random angle between -30 and 30 degrees
		const angleRad = (Math.random() -0.5) * (Math.PI / 3);
		ball.velocityY = ball.speed * Math.sin(angleRad);
		if (gameMode === GameMode.SINGLEPLAYER)
			computerPaddleRandomOffset = generateRandomPaddleOffset();
	}


	////////////////
	// Collisions //
	////////////////
	// we consider the ball squared, then do this: https://www.gamedev.net/articles/programming/general-and-gameplay-programming/swept-aabb-collision-detection-and-response-r3084/
	// with deflection
	// 0.5 = collision in the middle of the frame, 0 = collision at the start, 1 = no collision
	function getCollision(ball: IBall, collider: {x: number, y: number, width: number, height: number}, deltaTimeMultiplier: number): { normalX: number, normalY: number, time: number }
	{
		// make ball and targetBall x in the top left corner
		const ballPos = {x: ball.position.client_x - ball.width / 2, y: ball.position.client_y - ball.height / 2};

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

	function computeBallUpdate(ball: IBall, paddle1: IPaddle, paddle2: IPaddle, deltaTimeMultiplier: number): boolean
	{
		const paddle = ball.velocityX < 0 ? paddle1 : paddle2;
		const paddleObject = { x: paddle.position.client_x, y: paddle.position.client_y, width: paddle.width, height: paddle.height };
		let collision = getCollision(ball, paddleObject, deltaTimeMultiplier);

		// https://stackoverflow.com/questions/38765194/conditionally-initializing-a-constant-in-javascript
		const collisionYObject = (() => {
			if (ball.position.client_y + ball.height / 2 + ball.velocityY * deltaTimeMultiplier * collision.time >= 1)
			{
				return { x: 0, y: 1, width: 1, height: 1 };
			}
			else
			{
				return { x: 0, y: -1, width: 1, height: 1 };
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

				ball.position.client_x += ball.velocityX * deltaTimeMultiplier * minTime;
				ball.position.client_y += ball.velocityY * deltaTimeMultiplier * minTime;

				if (collision.time < collisionY.time)
				{
					// collisionPoint is between -1 and 1
					const collisionPoint = (ball.position.client_y - (paddle.position.client_y + paddle.height / 2)) / (paddle.height / 2);
					const angleRad = (Math.PI / 4) * collisionPoint; // anglee is between -45 and 45 degrees
					ball.speed *= 1.05;
					const direction = ball.velocityX > 0 ? -1 : 1;
					ball.velocityX = ball.speed * Math.cos(angleRad) * direction;
					ball.velocityY = ball.speed * Math.sin(angleRad);

					if (collision.normalX !== 0)
					{
						// ball.velocityX *= -1; // velocity already inversed above
						ball.position.client_x += ball.velocityX * remainingTime * deltaTimeMultiplier;
					}

					// will probably never happen (I was wrong, it happens sometimes)
					if (collision.normalY !== 0)
					{
						// ball.velocityY *= -1; // Don't revert either, since new angle is alreaedy calculated, if we hit on y and reverse (which rarely happeens), if ball hits on bottom, it gets redirected to top and inverse
						ball.position.client_y += ball.velocityY * remainingTime * deltaTimeMultiplier;
					}
				}
				else
				{
					ball.velocityY = -ball.velocityY;
					ball.position.client_y += ball.velocityY * remainingTime * deltaTimeMultiplier;
				}

				collision = getCollision(ball, paddleObject, deltaTimeMultiplier);
				collisionY = getCollision(ball, collisionYObject, deltaTimeMultiplier);
				deltaTimeMultiplier *= remainingTime;
			}
			return true;
		}
		else
		{
			// no collision
			ball.position.client_x += ball.velocityX * deltaTimeMultiplier;
			ball.position.client_y += ball.velocityY * deltaTimeMultiplier;
			return false;
		}
	}

	let ballScored: boolean = false;
	function handlePlayerScore(player: IPLayer)
	{
		// When scoring, wait for a bit before re-launching the ball
		if (!ballScored)
		{
			ballScored = true;

			player.score++;

			setTimeout(() => {
				resetBall();
				ballScored = false;
			}, SOLO_BALL_RESET_PAUSE_TIME);
		}
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
		if (gameMode === GameMode.MULTIPLAYER || gameMode === GameMode.SINGLEPLAYER)
		{
			let speedMultiplier = 1;
			if (pressedKeys.includes('Shift'))
				speedMultiplier = 2;

			if (pressedKeys.includes('Control'))
				speedMultiplier = 0.5;

			// means 5 times the paddle height every second (at normal speeed)
			const moveDistance = player1.paddle.height * 5 * speedMultiplier * updateMultiplier;

			if (pressedKeys.includes('ArrowUp'))
			{
				movePaddle(player1.paddle, player1.paddle.position.client_y - moveDistance);
				if (gameMode === GameMode.MULTIPLAYER)
					emitPaddleMove(player1.paddle.position.client_y);
			}

			if (pressedKeys.includes('ArrowDown'))
			{
				movePaddle(player1.paddle, player1.paddle.position.client_y + moveDistance);
				if (gameMode === GameMode.MULTIPLAYER)
					emitPaddleMove(player1.paddle.position.client_y);
			}
		}

		///////////////////
		// Paddle update //
		///////////////////
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
			player2.paddle.position.client_y = player2.paddle.position.server_y;
			player2.paddle.position.client_y = lerp(player2.paddle.position.client_y, player2.paddle.position.server_y, 0.2);
		}

		/////////////////
		// BALL UPDATE //
		/////////////////
		// ball.position.client_x += ball.velocityX * updateMultiplier;
		// ball.position.client_y += ball.velocityY * updateMultiplier;
		const collision = computeBallUpdate(ball, player1.paddle, player2.paddle, updateMultiplier)
		if (collision)
		{
			collisionSinceLastBallUpdate = true;

			// We can change the random only on score, so that paddle doesnt move weirdly on collision
			// if (gameMode === GameMode.SINGLEPLAYER)
			// 	computerPaddleRandomOffset = generateRandomPaddleOffset();
		}

		// either user has a very bad computer (< 5 fps) or left the page and come back
		if (gameMode !== GameMode.SINGLEPLAYER && deltaTime > 200)
		{
			// Set ball pos to server pos to avoid having very high velocity (eg. deltaTime = 5000) and then lerping to server pos, which would still be very far away
			ball.position.client_x = ball.position.server_x;
			ball.position.client_y = ball.position.server_y;
		}
		else if (gameMode !== GameMode.SINGLEPLAYER && !collisionSinceLastBallUpdate)
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

		// ball out of bounds in singeplayer
		if (gameMode === GameMode.SINGLEPLAYER)
		{
			if (ball.position.client_x + ball.width / 2 > 1)
				handlePlayerScore(player1);
			else if (ball.position.client_x - ball.width / 2 < 0)
				handlePlayerScore(player2);
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

	////////////////
	// Dimensions //
	////////////////
	let windowInnerWidth: number;
	let windowInnerHeight: number;
	function resizeCanvasToFitParent()
	{
		canvas.width = canvas.parentElement?.clientWidth ?? windowInnerWidth;
		canvas.height = canvas.parentElement?.clientHeight ?? windowInnerHeight;
	}

	function resizeWrapperToKeepAspect()
	{
		const aspectRatio = 400 / 600;
		// The goal is to make the canvas take up the whole width or height of it's parent, while keeping the aspect ratio and not overflowing
		// We can't use css to do that, so we need to do it in js
		const parentWidth = pongWrapper.parentElement?.clientWidth ?? windowInnerWidth;
		const parentHeight = pongWrapper.parentElement?.clientHeight ?? windowInnerHeight;

		const widthIfFullWidth = parentWidth;
		const heightIfFullWidth = parentWidth * aspectRatio;
		// const widthIfFullHeight = parentHeight / aspectRatio;
		// const heightIfFullHeight = parentHeight;

		if (heightIfFullWidth <= parentHeight)
		{
			pongWrapper.style.width = '100%';
			pongWrapper.style.height = 'auto';
		}
		else
		{
			pongWrapper.style.width = 'auto';
			pongWrapper.style.height = '100%';
		}
	}

	function handleResize()
	{
		// order matters
		resizeWrapperToKeepAspect();
		resizeCanvasToFitParent();
	}

</script>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} bind:innerWidth={windowInnerWidth} bind:innerHeight={windowInnerHeight} on:resize={handleResize} />

<div class="pong-wrapper" bind:this={pongWrapper}>
	<canvas class="pouet" on:mousemove={handleMouse} on:touchmove={handleDrag} bind:this={canvas} width="600" height="400"/>
</div>

<style lang="scss">
	// https://stackoverflow.com/questions/65864203/how-to-make-div-element-auto-resize-maintaining-aspect-ratio
	.pong-wrapper
	{
		// height / width is set in js depending on which is bigger (see https://stackoverflow.com/a/69400269)
		aspect-ratio: 600 / 400;
		overflow: hidden;
	}

	canvas
	{
		width: 100%;
		height: 100%;
	}

</style>