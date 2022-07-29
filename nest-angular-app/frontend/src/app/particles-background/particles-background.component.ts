import {Component, OnInit} from '@angular/core';

const imgs = ["assets/images/sspina-transparent.png",
	"assets/images/dsamain-transparent.png",
	"assets/images/oronda-transparent.png",
	"assets/images/mframbou-transparent.png"]
		.map(path =>
		{
			const img = new Image();
			img.src = path;
			return img;
		})

const canvas: HTMLCanvasElement | null = null;
const ctx: CanvasRenderingContext2D | null = null;

const MAX_POINT_SIZE = 25;
const MIN_POINT_SIZE = 10;
const MIN_VELOCITY = 0.75;
const MAX_VELOCITY = 1.5;
const MAX_POINTS = 200;
const POINTS_COUNT = 80;
const COLOR = "#55a0f0";

let mousePos: any = undefined;

class Point
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
		this.img = imgs[Math.floor(Math.random() * imgs.length)];
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

	drawPoint(ctx: CanvasRenderingContext2D, color: string = "white"): void
	{
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
		ctx.fill();
	}

	drawImg(ctx: CanvasRenderingContext2D): void
	{
		ctx.drawImage(this.img, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
	}
};

class ParticlesBackground
{
	private canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;
	private images: HTMLImageElement[];
	private points: Point[];
	private mousePos: any = null;
	private maxDist: number;
	private lastUpdate: number;

	constructor(canvas: HTMLCanvasElement, images: HTMLImageElement[])
	{
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
		this.images = images;
		this.points = [];

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		this.maxDist = Math.max(canvas.width, canvas.height) / 8;

		canvas.addEventListener("click", (e: MouseEvent) =>
		{
			if (this.points.length + 3 < MAX_POINTS)
			{
				for (let i = 0; i < 3; i++)
				{
					let pointSize = Math.random() * (MAX_POINT_SIZE - MIN_POINT_SIZE) + MIN_POINT_SIZE;
					this.points.push(new Point(e.clientX, e.clientY, pointSize));
				}
			}
		});

		canvas.addEventListener("mousemove", (e: MouseEvent) =>
		{
			mousePos = {x: e.clientX, y: e.clientY};
		});

		window.addEventListener("resize", () =>
		{
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		});

		this.init_points(POINTS_COUNT, canvas.width, canvas.height);
		this.lastUpdate = performance.now();
		requestAnimationFrame(() => this.loop());
	}

	dist(x1: number, y1: number, x2: number, y2: number): number
	{
		let d1 = Math.abs(x1 - x2);
		let d2 = Math.abs(y1 - y2);
		return Math.sqrt((d1 * d1) + (d2 * d2));
	}

	draw_line(x1: number, y1: number, x2: number, y2: number, color: string = COLOR): void
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

		let now = performance.now();
		let deltaTime = now - this.lastUpdate;
		this.lastUpdate = now

		for (let i = 0; i < this.points.length; ++i)
		{
			this.points[i].update(this.canvas.width, this.canvas.height, deltaTime);
		}
		for (let i = 0; i < this.points.length; ++i)
		{
			for (let j = i + 1; j < this.points.length; ++j)
			{
				if (this.dist(this.points[i].x, this.points[i].y, this.points[j].x, this.points[j].y) >= this.maxDist)
					continue;
				this.draw_line(this.points[i].x, this.points[i].y, this.points[j].x, this.points[j].y);
			}

			if (mousePos)
			{
				if (this.dist(this.points[i].x, this.points[i].y, mousePos.x, mousePos.y) >= this.maxDist)
					continue;
				this.draw_line(this.points[i].x, this.points[i].y, mousePos.x, mousePos.y);
			}
		}
		for (let i = 0; i < this.points.length; i++)
		{
			this.points[i].drawImg(this.ctx);
		}

		requestAnimationFrame(() => this.loop());
	}

	init_points(pointsCount: number, width: number, height: number): void
	{
		for (let i = 0; i < pointsCount; i++)
		{
			let pointSize = Math.random() * (MAX_POINT_SIZE - MIN_POINT_SIZE) + MIN_POINT_SIZE;
			let x = Math.floor(Math.random() * width);
			let y = Math.floor(Math.random() * height);
			this.points.push(new Point(x, y, pointSize));
		}
	}
};


const images = [
	"assets/images/sspina-transparent.png",
	"assets/images/dsamain-transparent.png",
	"assets/images/oronda-transparent.png",
	"assets/images/mframbou-transparent.png"
].map(path =>
{
	const img = new Image();
	img.src = path;
	return img;
})

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

		const particlesBackground = new ParticlesBackground(canvas, images);
	}

}