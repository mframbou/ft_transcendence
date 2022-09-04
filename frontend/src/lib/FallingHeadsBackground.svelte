<script lang="ts">
	import { onMount } from 'svelte';

	// Should use this https://www.reddit.com/r/sveltejs/comments/x2me4k/what_does_variable_mean/ when im not lazy
	export let properties = {};

	properties = {
		imgHeight: properties.imgHeight ?? 64,
		imgWidth: properties.imgWidth ?? 64,
		minScale: properties.minScale ?? 0.4,
		maxScale: properties.maxScale ?? 1.0,
		minVelocity: properties.minVelocity ?? 1.5,
		maxVelocity: properties.maxVelocity ?? 2.2,
		imageCount: properties.imageCount ?? 80,
		images: properties.images ?? [
			'/images/dsamain-transparent.png',
			'/images/oronda-transparent.png',
			'/images/sspina-transparent.png',
			'/images/mframbou-transparent.png'],
	};

	class Point
	{
		public x: number;
		public y: number;

		private vy: number;
		private opacity: number;
		private opacity: number;
		private height: number;
		private width: number;
		private img: HTMLImageElement;

		constructor(x: number, y: number, images: HTMLImageElement[])
		{
			this.x = x;
			this.y = y;

			const scale = properties.minScale + Math.random() * (properties.maxScale - properties.minScale);
			this.height = properties.imgHeight * scale;
			this.width = properties.imgWidth * scale;
			this.opacity = scale;
			this.vy = Math.random() * (properties.maxVelocity - properties.minVelocity) + properties.minVelocity;
			this.img = images[Math.floor(Math.random() * images.length)];
		}

		update(canvasWidth: number, canvasHeight: number, elapsedTime: number)
		{
			let velocity = (this.vy * elapsedTime) / 10;
			this.y += velocity;

			if (this.y < -this.height || this.y > canvasHeight + this.height)
			{
				this.x = Math.random() * canvasWidth;
				if (this.vy < 0) // Going upwards
					this.y = canvasHeight + this.height;
				else // going downwards
					this.y = -this.height;
			}
		}

		draw(ctx: CanvasRenderingContext2D)
		{
			ctx.globalAlpha = this.opacity;
			ctx.drawImage(this.img, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
		}
	}

	function updateCanvasSize(canvas: HTMLCanvasElement)
	{
		canvas.width = canvas.parentElement?.clientWidth ?? window.innerWidth;
		canvas.height = canvas.parentElement?.clientHeight ?? window.innerHeight;
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
		{
			point.update(canvas.width, canvas.height, deltaTime);
			point.draw(context);
		}

		requestAnimationFrame(() => loop(canvas, context));
	}

	function render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D)
	{
		lastUpdate = performance.now();
		requestAnimationFrame(() => loop(canvas, context));
	}

	const points: Point[] = [];
	let lastUpdate: number = performance.now();
	let canvas: HTMLCanvasElement;

	onMount(() =>
	{
		const windowResizeListener = () => updateCanvasSize(canvas);

		const context: CanvasRenderingContext2D = canvas.getContext('2d');

		const images: HTMLImageElement[] = properties.images.map(path =>
		{
			const image = new Image();
			image.src = path;
			return image;
		});

		updateCanvasSize(canvas);

		for (let i = 0; i < properties.imageCount; i++)
		{
			const x = Math.random() * canvas.width;
			const y = Math.random() * canvas.height;
			points.push(new Point(x, y, images));
		}


		window.addEventListener('resize', windowResizeListener);

		render(canvas, context);

		return () =>
		{
			window.removeEventListener('resize', windowResizeListener);
		};
	});

</script>

<div class="wrapper">
	<canvas bind:this={canvas} class="particles-background"></canvas>
</div>

<style lang="scss">
	.wrapper
	{
		position: absolute;
		z-index: var(--z-index, auto);
		top: 0;
		left: 0;
		overflow: hidden;
		width: 100%;
		height: 100%;
		pointer-events: var(--pointer-events, auto);
	}

	canvas
	{
		background-color: var(--background-color, #ffffff);
	}

</style>