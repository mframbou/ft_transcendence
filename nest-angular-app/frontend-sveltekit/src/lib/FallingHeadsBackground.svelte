<script lang="ts">

	import {browser} from '$app/env';
	import {onMount} from "svelte";

	export let properties = {
		imgHeight: 64,
		imgWidth: 64,
		minScale: 0.4,
		maxScale: 1.0,
		minVelocity: 1.5,
		maxVelocity: 2.2,
		imageCount: 80,
		images: [
			"src/lib/assets/images/dsamain-transparent.png",
			"src/lib/assets/images/oronda-transparent.png",
			"src/lib/assets/images/sspina-transparent.png",
			"src/lib/assets/images/mframbou-transparent.png"],
	}

	class Point
	{
		public x: number;
		public y: number;

		private vy: number;
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
	};

	function updateCanvasSize(canvas: HTMLCanvasElement)
	{
		canvas.width = canvas.parentElement.clientWidth ?? window.innerWidth;
		canvas.height = canvas.parentElement.clientHeight ?? window.innerHeight;
	}

	function loop(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D)
	{
		context.clearRect(0, 0, canvas.width, canvas.height);

		const now = performance.now();
		const deltaTime = now - lastUpdate;
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
		if (browser)
		{
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


			window.addEventListener("resize", () =>
			{
				updateCanvasSize(canvas);
			});

			// To avoid very high velocity when coming back to the page
			document.addEventListener("visibilitychange", () =>
			{
				if (document.visibilityState === "visible")
					lastUpdate = performance.now();
			});

			render(canvas, context);
		}
	});

</script>

<div class="wrapper">
	<canvas bind:this={canvas} class="particles-background"></canvas>
</div>

<style lang="scss">
	.wrapper
	{
		position: absolute;
		top: 0;
		left: 0;
		overflow: hidden;
		z-index: var(--z-index, auto);
		width: 100%;
		height: 100%;
		pointer-events: var(--pointer-events, auto);
	}

	canvas
	{
		background-color: var(--background-color, #ffffff);
	}

</style>