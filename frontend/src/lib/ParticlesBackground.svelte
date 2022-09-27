<script lang="ts">
	import { onMount } from 'svelte';

	export let properties = {};

	properties = {
		maxPointSize: properties.maxPointSize ?? 25,
		minPointSize: properties.minPointSize ?? 10,
		minVelocity: properties.minVelocity ?? 0.75,
		maxVelocity: properties.maxVelocity ?? 1.5,
		initialCount: properties.initialCount ?? 80,
		lineColor: properties.lineColor ?? '#ffffff',
		addOnClick: properties.addOnClick ?? true,
		images: properties.images ?? [
			'/images/dsamain-transparent.png',
			'/images/oronda-transparent.png',
			'/images/sspina-transparent.png',
			'/images/mframbou-transparent.png'],
		maxDistRatio: properties.maxDistRatio ?? 1 / 8,
		maxPoints: properties.maxPoints ?? 300
	};

	const mousePos = {x: -1, y: -1};

	class Point
	{
		public x: number;
		public y: number;

		private vy: number;
		private vx: number;
		private angle: number;
		private size: number;
		private velocity: number;
		private img: HTMLImageElement;

		constructor(x: number, y: number, images: HTMLImageElement[])
		{
			this.x = x;
			this.y = y;

			this.size = Math.random() * (properties.maxPointSize - properties.minPointSize) + properties.minPointSize;
			this.angle = Math.random() * Math.PI * 2;
			this.velocity = Math.random() * (properties.maxVelocity - properties.minVelocity) + properties.minVelocity;
			this.vx = Math.cos(this.angle) * this.velocity;
			this.vy = Math.sin(this.angle) * this.velocity;
			this.img = images[Math.floor(Math.random() * images.length)];
		}


		update(canvasWidth: number, canvasHeight: number, elapsedTime: number)
		{
			let velocity = (this.velocity * elapsedTime) / 10;

			this.x += this.vx * velocity;
			this.y += this.vy * velocity;

			if (this.x < 0 || this.x > canvasWidth)
			{
				this.angle = Math.PI - this.angle;
				this.vx = Math.cos(this.angle) * this.velocity;
				this.vy = Math.sin(this.angle) * this.velocity;
			}

			if (this.y < 0 || this.y > canvasHeight)
			{
				this.angle = -this.angle;
				this.vy = -this.vy;
			}
		}

		draw(ctx: CanvasRenderingContext2D)
		{
			ctx.drawImage(this.img, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
		}
	}

	function dist({x: x1, y: y1}, {x: x2, y: y2})
	{
		return Math.hypot(x1 - x2, y1 - y2);
	}

	function drawLine(context: CanvasRenderingContext2D, {x: x1, y: y1}, {x: x2, y: y2})
	{
		let trans = (Math.max(0, 255 - Math.floor(dist({x: x1, y: y1}, {x: x2, y: y2}) / maxDist * 255))).toString(16);
		if (trans.length == 1) trans = '0' + trans;
		context.beginPath();
		context.strokeStyle = properties.lineColor + trans;
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.stroke();
	}

	let windowInnerWidth: number = 0;
	let windowInnerHeight: number = 0;
	function updateCanvasSize(canvas: HTMLCanvasElement)
	{
		canvas.width = canvas.parentElement?.clientWidth ?? windowInnerWidth;
		canvas.height = canvas.parentElement?.clientHeight ?? windowInnerHeight;
		maxDist = properties.maxDistRatio * Math.max(canvas.width, canvas.height);
	}

	function loop(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D)
	{
		context.clearRect(0, 0, canvas.width, canvas.height);

		const now = performance.now();
		let deltaTime = now - lastUpdate;
		// eg. if user leaves page to avoid having very high velocity wheb coming back (or very very very bad PC)
		if (deltaTime > 200)
			deltaTime = 0;
		lastUpdate = now;

		for (let point of points)
			point.update(canvas.width, canvas.height, deltaTime);

		for (let i = 0; i < points.length; i++)
		{
			for (let j = i + 1; j < points.length; j++)
			{
				if (dist(points[i], points[j]) < maxDist)
					drawLine(context, points[i], points[j]);
			}

			if (mousePos.x != -1)
			{
				if (dist(points[i], mousePos) < maxDist)
					drawLine(context, points[i], mousePos);
			}
		}

		for (let point of points)
			point.draw(context);

		requestAnimationFrame(() => loop(canvas, context));
	}

	function render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D)
	{
		lastUpdate = performance.now();
		requestAnimationFrame(() => loop(canvas, context));
	}

	const points: Point[] = [];
	let lastUpdate: number = performance.now();
	let maxDist: number = 0;
	let canvas: HTMLCanvasElement;


	const images: HTMLImageElement[] = properties.images.map(path =>
	{
		const image = new Image();
		image.src = path;
		return image;
	});

	function canvasClickListener(e: MouseEvent)
	{
		const rect = canvas.getBoundingClientRect();
		mousePos.x = e.clientX - rect.left;
		mousePos.y = e.clientY - rect.top;

		if (points.length + 3 < properties.maxPoints)
		{
			const count = Math.floor(Math.random() * 3) + 1;
			for (let i = 0; i < count; i++)
				points.push(new Point(mousePos.x, mousePos.y, images));
		}
	};

	function canvasMouseMoveListener(e: MouseEvent)
	{
		const rect = canvas.getBoundingClientRect();
		mousePos.x = e.clientX - rect.left;
		mousePos.y = e.clientY - rect.top;
	};

	function windowResizeListener()
	{
		updateCanvasSize(canvas);
	};

	onMount(() =>
	{
		const context: CanvasRenderingContext2D = canvas.getContext('2d');

		updateCanvasSize(canvas);

		for (let i = 0; i < properties.initialCount; i++)
		{
			const x = Math.random() * canvas.width;
			const y = Math.random() * canvas.height;
			points.push(new Point(x, y, images));
		}

		render(canvas, context);
	});

</script>

<svelte:window on:resize={windowResizeListener} bind:innerWidth={windowInnerWidth} bind:innerHeight={windowInnerHeight} />

<div class="wrapper">
	<canvas on:click={canvasClickListener} on:mousemove={canvasMouseMoveListener} bind:this={canvas} class="particles-background"></canvas>
</div>

<style lang="scss">
	.wrapper
	{
		z-index: var(--z-index, auto);
		overflow: hidden; // To allow shrinking the canvas
		width: 100%;
		height: 100%;
		pointer-events: var(--pointer-events, auto);
	}

	canvas
	{
		background-color: var(--background-color, transparent);
	}
</style>