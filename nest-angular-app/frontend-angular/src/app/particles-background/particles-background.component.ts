import {Component, OnInit} from '@angular/core';

const images = [
	"assets/images/sspina-transparent.png",
	"assets/images/dsamain-transparent.png",
	"assets/images/oronda-transparent.png",
	"assets/images/mframbou-transparent.png"
].map(path => loadImage(path));

function loadImage(path: string): HTMLImageElement
{
	const img = new Image();
	img.src = path;
	return img;
}

const MAX_POINT_SIZE = 25;
const MIN_POINT_SIZE = 10;
const MIN_VELOCITY = 0.75;
const MAX_VELOCITY = 1.5;
const MAX_POINTS = 200;
const POINTS_COUNT = 80;
const COLOR = "#55a0f0";

let mousePos: any = undefined;

class ImagePoint
{
	public x: number;
	public y: number;
	private vy: number;
	private vx: number;
	private angle: number;
	private readonly size: number;
	private readonly vel: number;
	private readonly img: HTMLImageElement;

	constructor(x: number, y: number, size: number)
	{
		this.x = x;
		this.y = y;

		this.size = size;
		this.angle = Math.random() * Math.PI * 2;
		this.vel = Math.random() * (MAX_VELOCITY - MIN_VELOCITY) + MIN_VELOCITY;
		this.img = images[Math.floor(Math.random() * images.length)];
		this.vx = Math.cos(this.angle) * this.vel;
		this.vy = Math.sin(this.angle) * this.vel;
	}

	update(width: number, height: number, elapsedTime: number): void
	{
		let velocity = (this.vel * elapsedTime) / 10;

		this.x = this.x + (this.vx * velocity);
		this.y = this.y + (this.vy * velocity);

		if (this.x < 0 || this.x > width)
		{
			// console.log(width + ', ' + height);
			this.angle = Math.PI - this.angle;
			this.vx = Math.cos(this.angle) * this.vel;
			this.vy = Math.sin(this.angle) * this.vel;
		}

		if (this.y < 0 || this.y > height)
		{
			this.angle = -this.angle;
			this.vy = -this.vy;
		}
	}

	drawPoint(ctx: CanvasRenderingContext2D): void
	{
		ctx.drawImage(this.img, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
	}
};

class ParticlesBackground
{
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private points: ImagePoint[];
	private lastUpdate: number;
	private maxDist: number;

	constructor(canvas: HTMLCanvasElement)
	{
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this.points = [];
		this.setCanvasSize();
		this.initPoints(POINTS_COUNT, canvas.width, canvas.height);
		this.maxDist = Math.max(canvas.width, canvas.height) / 8;
		this.lastUpdate = performance.now();

		canvas.addEventListener("click", (e: MouseEvent) =>
		{
			mousePos = this.getMousePosOnCanvas(e.clientX, e.clientY);
			if (this.points.length + 3 < MAX_POINTS)
			{
				const count = Math.floor(Math.random() * 3) + 1;
				for (let i = 0; i < count; i++)
				{
					let pointSize = Math.random() * (MAX_POINT_SIZE - MIN_POINT_SIZE) + MIN_POINT_SIZE;
					this.points.push(new ImagePoint(mousePos.x, mousePos.y, pointSize));
				}
			}
		});

		canvas.addEventListener("mousemove", (e: MouseEvent) => mousePos = this.getMousePosOnCanvas(e.clientX, e.clientY));
		window.addEventListener("resize", () => this.setCanvasSize());
		// To avoid very high velocity when coming back to the page
		document.addEventListener("visibilitychange", e =>
		{
			if (document.visibilityState === "visible")
				this.lastUpdate = performance.now();
		});
	}

	getMousePosOnCanvas(windowX: number, windowY: number): { x: number, y: number }
	{
		const rect = this.canvas.getBoundingClientRect();
		const x = windowX - rect.left;
		const y = windowY - rect.top;
		return {x, y};
	}

	setCanvasSize(): void
	{
		this.canvas.width = this.canvas.parentElement?.clientWidth ?? window.innerWidth;
		this.canvas.height = this.canvas.parentElement?.clientHeight ?? window.innerHeight;
	}

	render(): void
	{
		this.lastUpdate = performance.now();
		requestAnimationFrame(this.loop.bind(this));
	}

	dist(x1: number, y1: number, x2: number, y2: number): number
	{
		const d1 = Math.abs(x1 - x2);
		const d2 = Math.abs(y1 - y2);

		return Math.sqrt((d1 * d1) + (d2 * d2));
	}

	drawLine(x1: number, y1: number, x2: number, y2: number, color: string = COLOR): void
	{
		let trans = (Math.max(0, 255 - Math.floor(this.dist(x1, y1, x2, y2) / this.maxDist * 255))).toString(16);
		if (trans.length == 1) trans = '0' + trans;
		this.ctx.beginPath();
		this.ctx.strokeStyle = color + trans;
		this.ctx.moveTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.stroke();
	}

	loop(): void
	{
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		const now = performance.now();
		const deltaTime = now - this.lastUpdate;
		this.lastUpdate = now

		// Update pos of all points
		for (let point of this.points)
			point.update(this.canvas.width, this.canvas.height, deltaTime);

		// Draw lines between points
		for (let i = 0; i < this.points.length; i++)
		{
			for (let j = i + 1; j < this.points.length; j++)
			{
				if (this.dist(this.points[i].x, this.points[i].y, this.points[j].x, this.points[j].y) >= this.maxDist)
					continue;
				this.drawLine(this.points[i].x, this.points[i].y, this.points[j].x, this.points[j].y);
			}

			if (mousePos)
			{
				if (this.dist(this.points[i].x, this.points[i].y, mousePos.x, mousePos.y) >= this.maxDist)
					continue;
				this.drawLine(this.points[i].x, this.points[i].y, mousePos.x, mousePos.y);
			}
		}

		for (let point of this.points)
			point.drawPoint(this.ctx);

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
		// loop will have this set to this (could be anything but we want this)
		requestAnimationFrame(this.loop.bind(this));
	}

	initPoints(pointsCount: number, width: number, height: number): void
	{
		for (let i = 0; i < pointsCount; i++)
		{
			const pointSize = Math.random() * (MAX_POINT_SIZE - MIN_POINT_SIZE) + MIN_POINT_SIZE;
			const x = Math.floor(Math.random() * width);
			const y = Math.floor(Math.random() * height);
			this.points.push(new ImagePoint(x, y, pointSize));
		}
	}
};

@Component({
	selector: 'app-particles-background',
	templateUrl: './particles-background.component.html',
	styleUrls: ['./particles-background.component.scss']
})
export class ParticlesBackgroundComponent implements OnInit
{

	constructor() { }

	ngOnInit(): void
	{ }

	ngAfterViewInit(): void
	{
		const canvas: HTMLCanvasElement | null = document.querySelector(".particle-heads-background");

		if (!canvas)
			return;

		const particlesBackground = new ParticlesBackground(canvas);
		particlesBackground.render();
	}
}