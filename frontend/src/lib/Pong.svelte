<script lang="ts">

	import { onMount } from 'svelte';
	import { pongSocket, pongSocketConnected } from '$lib/websocket-stores';
	import { user } from '$lib/stores';
	import { createEventDispatcher } from 'svelte';

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

	const END_GAME_SCREEN_DURATION = 5000;

	let canvas: HTMLCanvasElement;
	let pongWrapper: HTMLDivElement;
	let context: CanvasRenderingContext2D;

	let player1: IPLayer;
	let player2: IPLayer;
	let ball: IBall;
	let net: INet;

	let collisionSinceLastBallUpdate: boolean;
	let animationFrameId: number = null;
	let lastGameUpdate: number = 0;
	let lastBallUpdate: number = 0;
	let lastPaddleMove: number = 0;

	let computerPaddleRandomOffset: number = 50;
	let gameMode: GameMode = GameMode.SINGLEPLAYER;

	export let spectateId: string = null;
	export let ballAspect: 'square' | 'circle' = 'circle';
	export let currentMode: 'SINGLEPLAYER' | 'MULTIPLAYER' | 'SPECTATOR' = 'SINGLEPLAYER'; // to pass data to parent, prevents parent from modifying it and breaking everything by copying gameMode (+ string instead of enum)
	export let width: number = 600;
	export let height: number = 400;
	export let preserveRatio: boolean = true;

	const dispatch = createEventDispatcher();

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
		// console.log('playere paddlee move', serverData);
		player.paddle.position.server_y = serverData.y;
		player.paddle.height = serverData.height;

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

		$pongSocket.on('gameEnd', (data) => {
			handleOnlineGameEnd(data, false, isPlayerOne);
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

		$pongSocket.on('gameEnd', (data) => {
			handleOnlineGameEnd(data, true);
		});

		lastGameUpdate = performance.now();
	}

	function handleOnlineGameEnd(serverData: any, isSpectating: boolean, isPlayerOne?: boolean)
	{
		console.log('Game ended', JSON.stringify(serverData));
		stopListeningToUpdateEvents();
		if (isSpectating)
		{
			dispatch('game-end', {
				player1Score: serverData.player1Score,
				player2Score: serverData.player2Score,
			});
		}
		else
		{

			player1.score = 111;
			player2.score = 222;
			const myScore = isPlayerOne ? serverData.player1Score : serverData.player2Score;
			const opponentScore = isPlayerOne ? serverData.player2Score : serverData.player1Score;
			const win = myScore > opponentScore;

			dispatch('game-end', {
				player1Score: myScore,
				player2Score: opponentScore,
			});

			let imageUrl;
			if (win)
				imageUrl = '/images/gain_social_credit.jpeg';
			else
				imageUrl = '/images/lose_social_credit.jpeg';

			const image = new Image();
			image.src = imageUrl;
			image.onload = () => {
				pause();
				console.log('show image');
				context.drawImage(image, 0, 0, canvas.width, canvas.height);
			}

			setTimeout(() => {
				gameMode = GameMode.SINGLEPLAYER;

			}, END_GAME_SCREEN_DURATION);
		}
	}

	function stopListeningToUpdateEvents()
	{
		$pongSocket.off('player1Move');
		$pongSocket.off('player2Move');
		$pongSocket.off('ballReset');
		$pongSocket.off('scoreUpdate');
		$pongSocket.off('resetPaddles');
		$pongSocket.off('ballUpdate');
		$pongSocket.off('gameEnd');
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

	function pause()
	{
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}

	function resume()
	{
		animationFrameId = requestAnimationFrame(loop);
	}

	// https://www.reddit.com/r/sveltejs/comments/rn3vp0/is_there_any_difference_between_ondestroy_and_the/
	// if onMount is async, it's return value is not called
	const PLAYER1_COLOR = '#4255FE';
	const PLAYER2_COLOR = '#fe5842';
	const NET_COLOR = '#eee';
	const SCORE_COLOR = '#eee';
	const BALL_COLOR = 'white';

	onMount(() =>
	{
		context = <CanvasRenderingContext2D> canvas.getContext('2d', { alpha: false });
		handleResize();

		animationFrameId = requestAnimationFrame(loop);

		return () => {
			pause();
		}
	});

	function isRunning()
	{
		return animationFrameId !== null;
	}

	// avoid using any other variable in reactive statement
	$: if (gameMode === GameMode.SINGLEPLAYER)
	{
		console.log('singleplayer mode');
		initGameObjects(PLAYER1_COLOR, PLAYER2_COLOR, NET_COLOR, BALL_COLOR);
		listenForGameStart();
		launchSingleplayerBall();

		if (!isRunning())
			resume();
	}
	else if (gameMode === GameMode.MULTIPLAYER)
	{
		console.log('multiplayer mode');
		initGameObjects(PLAYER1_COLOR, PLAYER2_COLOR, NET_COLOR, BALL_COLOR);

		if (!isRunning())
			resume();
	}
	else if (gameMode === GameMode.SPECTATOR)
	{
		console.log('spectator mode');
		initGameObjects(PLAYER1_COLOR, PLAYER2_COLOR, NET_COLOR, BALL_COLOR);
		startSpectatingGame();

		if (!isRunning())
			resume();
	}

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
		context.textAlign = 'center';
		context.font = `${(50/400) * canvas.width}px NexaBlack`;
		context.fillText(text, x, y, canvas.width / 3);
		context.textAlign = 'start';
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

	function drawScore(color: string = SCORE_COLOR)
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
		return (Math.random() - 0.5) * (player2.paddle.height / 1);
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
		if (gameMode === GameMode.SPECTATOR || pressedKeys.includes(event.key))
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
					if (collision.normalX !== 0)
					{
						// collisionPoint is between -1 and 1
						const collisionPoint = (ball.position.client_y - (paddle.position.client_y + paddle.height / 2)) / (paddle.height / 2);
						const angleRad = (Math.PI / 4) * collisionPoint; // anglee is between -45 and 45 degrees
						ball.speed *= 1.05;
						const direction = ball.velocityX > 0 ? -1 : 1;
						ball.velocityX = ball.speed * Math.cos(angleRad) * direction;
						ball.velocityY = ball.speed * Math.sin(angleRad);

						// ball.velocityX *= -1; // velocity already inversed above
						ball.position.client_x += ball.velocityX * remainingTime * deltaTimeMultiplier;
					}

					// will probably never happen (I was wrong, it happens sometimes)
					// when colliding on Y (bottom / top of paddle), just reverse Y velocity, but so it will still score, just avoid ball going into the paddlee
					if (collision.normalY !== 0)
					{
						ball.velocityY *= -1;
						ball.position.client_y += ball.velocityY * remainingTime * deltaTimeMultiplier;
					}
				}
				else
				{
					ball.velocityY = -ball.velocityY;
					ball.position.client_y += ball.velocityY * remainingTime * deltaTimeMultiplier;
				}

				deltaTimeMultiplier *= remainingTime;
				collision = getCollision(ball, paddleObject, deltaTimeMultiplier);
				collisionY = getCollision(ball, collisionYObject, deltaTimeMultiplier);
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

	let specialMode: 'bingChilling' | 'notChilling' = null;
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
				speedMultiplier *= 2;

			if (pressedKeys.includes('Control') || pressedKeys.includes('Alt')) // since we cant use control on macos with arrow
				speedMultiplier /= 2;

			// means 5 times the paddle height every second (at normal speeed)
			const moveDistance = player1.paddle.height * 5 * speedMultiplier * updateMultiplier;

			if (pressedKeys.includes('ArrowUp') || pressedKeys.includes('w') || pressedKeys.includes('W'))
			{
				movePaddle(player1.paddle, player1.paddle.position.client_y - moveDistance);
				if (gameMode === GameMode.MULTIPLAYER)
					emitPaddleMove(player1.paddle.position.client_y);
			}

			if (pressedKeys.includes('ArrowDown') || pressedKeys.includes('s') || pressedKeys.includes('S'))
			{
				movePaddle(player1.paddle, player1.paddle.position.client_y + moveDistance);
				if (gameMode === GameMode.MULTIPLAYER)
					emitPaddleMove(player1.paddle.position.client_y);
			}

			const bgLogins = ['oronda', 'sspina', 'dsamain', 'mframbou'];
			const yesSirLogins = ['tac', 'palmi', 'yoshi', 'mel'];

			if ((pressedKeys.includes('i') || pressedKeys.includes('I')) && $user && specialMode === null)
			{
				// enable special mode
				if (bgLogins.includes($user.login))
				{
					specialMode = 'bingChilling';
					player1.paddle.height = 1;
					limitPaddleMovement(player1.paddle);
					if (gameMode === GameMode.MULTIPLAYER)
						$pongSocket.emit('enableSpecialMode', { mode: 'bingChilling' });
				}
				else if (yesSirLogins.includes($user.login))
				{
					specialMode = 'notChilling';
					const centeredPos = player1.paddle.position.client_y + player1.paddle.height / 2;
					player1.paddle.height = (PADDLE_BASE_HEIGHT / CANVAS_BASE_HEIGHT) / 3;
					movePaddle(player1.paddle, centeredPos - player1.paddle.height / 2);
					limitPaddleMovement(player1.paddle);
					if (gameMode === GameMode.MULTIPLAYER)
						$pongSocket.emit('enableSpecialMode', { mode: 'notChilling' });
				}
			}
			else if (!pressedKeys.includes('i') && !pressedKeys.includes('I') && specialMode !== null)
			{
				// disable special mode
				const centeredPos = player1.paddle.position.client_y + player1.paddle.height / 2;
				player1.paddle.height = PADDLE_BASE_HEIGHT / CANVAS_BASE_HEIGHT;
				movePaddle(player1.paddle, centeredPos - player1.paddle.height / 2);
				limitPaddleMovement(player1.paddle);
				if (gameMode === GameMode.MULTIPLAYER)
					$pongSocket.emit('disableSpecialMode', { mode: specialMode });
				specialMode = null;
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
			// 2 lerps: 1 for position to target random offset position (which is slow), another just for position to ball (which is fast)
			const targetPosition = ball.position.client_y - player2.paddle.height / 2 + computerPaddleRandomOffset;

			// nightmare mode
			// movePaddle(player2.paddle, ball.position.client_y - player2.paddle.height / 2);

			// normal mode
			let computerPosition = targetPosition;
			if (Math.abs(targetPosition - player2.paddle.position.client_y) > player2.paddle.height * 0.1)
			{
				const distToTarget = Math.abs(targetPosition - player2.paddle.position.client_y) / player2.paddle.height; // 1 = 100% of paddle height
				computerPosition = lerp(player2.paddle.position.client_y, targetPosition, distToTarget * 0.2); // if far from target, move faster
				movePaddle(player2.paddle, computerPosition);
			}
			else
			{
				movePaddle(player2.paddle, computerPosition);
			}

		}
		else
		{
			// real player 2
			// player2.paddle.position.client_y = player2.paddle.position.server_y;
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

			// Change only when computer hits the ball
			if (gameMode === GameMode.SINGLEPLAYER && ball.velocityX < 0)
				computerPaddleRandomOffset = generateRandomPaddleOffset();
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
			// check if bal is fully out of bounds (to avoid bug when hitting on Y and ball is partly outside
			if (ball.position.client_x - ball.width / 2 > 1)
				handlePlayerScore(player1);
			else if (ball.position.client_x + ball.width / 2 < 0)
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
		if (canvas) // to avoid null when changing page
		{
			// handleResize(); // do it every time for cases when element is being resized without window resize (eg. home page player infos showing up)
			render();
		}
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

	function setWidthAndHeight()
	{
		width = canvas.width;
		height = canvas.height;
	}

	$: if ((preserveRatio !== null)  && canvas && pongWrapper) // use preserveRatio just to trigger the $: block
	{
		handleResize();
	}

	function handleResize()
	{
		// order matters
		if (preserveRatio)
		{
			resizeWrapperToKeepAspect();
		}
		else
		{
			pongWrapper.style.width = '100%';
			pongWrapper.style.height = '100%';
		}
		resizeCanvasToFitParent();
		setWidthAndHeight();
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