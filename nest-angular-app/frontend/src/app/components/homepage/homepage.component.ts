import { Component, OnInit } from '@angular/core';

const IMG_HEIGHT = 64;
const IMG_WIDTH = 64;
const MIN_SCALE = 0.4;
const MAX_SCALE = 1.0;
const MIN_VELOCITY = 1.5;
const MAX_VELOCITY = 2.2;
const POINTS_COUNT = 80;

class Point
{
  private readonly image: HTMLImageElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D | null;
  private readonly images: string[];
  private readonly height: number;
  private readonly width: number;
  private readonly size: number;
  private readonly opacity: number;
  private readonly velocity: number;
  private          x: number;
  private          y: number;


  constructor(canvas: HTMLCanvasElement, x: number, y: number, scale: number, images: string[]) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.images = images;
    this.image = new Image();
    this.image.src = images[Math.floor(Math.random() * images.length)];
    this.x = x;
    this.y = y;
    this.height = IMG_HEIGHT * scale;
    this.width = IMG_WIDTH * scale;
    this.size = scale;
    this.opacity = scale;
    this.velocity = Math.random() * (MAX_VELOCITY - MIN_VELOCITY) + MIN_VELOCITY;
  }

  update() {
    this.y += this.velocity;

    if (this.y > this.canvas.height + IMG_HEIGHT)
    {
      this.x = Math.random() * this.canvas.width;
      this.image.src = this.images[Math.floor(Math.random() * this.images.length)];
      this.y = -IMG_HEIGHT; // To make it appear gradually
    }
  }

  drawImg() {
    if (this.context)
    {
      this.context.globalAlpha = this.opacity;
      this.context.drawImage(this.image, this.x - this.width / 2, this.y - this.height - 2, this.width, this.height);
    }
  }
}

class FallingHeadsCanvas
{
  private _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D | null;
  private _points: Point[];

  constructor(canvas: HTMLCanvasElement, images: string[])
  {
    this._canvas = canvas;
    const ctx = canvas.getContext('2d');

    if (!ctx)
      throw new Error("Failed to get canvas 2D context");


    this._context = ctx;

    console.log(this._context);

    this.updateCanvasSize();

    window.addEventListener("resize", () => {
      this.updateCanvasSize();
    });

    this._points = [];

    for (let i = 0; i < POINTS_COUNT; i++) {
      let scale = Math.random() * (MAX_SCALE - MIN_SCALE) + MIN_SCALE;
      let x = Math.floor(Math.random() * this._canvas.width);
      let y = Math.floor(Math.random() * this._canvas.height);
      this._points.push(new Point(canvas, x, y, scale, images));
    }
  }

  updateCanvasSize(): void {
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
  }

  loop()
  {
    console.log(this._points);
    console.log(this._context);
    if (this._context)
    {
      this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

      this._points.forEach(p => {
        p.update();
        p.drawImg();
      });
    }

    requestAnimationFrame(this.loop);
  }
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  constructor() { }

  ngOnInit(): void
  { }

  ngAfterViewInit(): void
  {
    const images = [
      "assets/images/sspina-transparent.png",
      "assets/images/dsamain-transparent.png",
      "assets/images/oronda-transparent.png",
      "assets/images/mframbou-transparent.png"
    ]

    // <type> is for casting
    const canvas = <HTMLCanvasElement> document.querySelector(".falling-heads-background");

    if (!canvas)
        return;

    const fallingHeads = new FallingHeadsCanvas(canvas, images);
    fallingHeads.loop();
  }
}

/*


function loop()
{
	i++;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	points.forEach(p => {
		p.update();
		p.drawImg();
	});

	requestAnimationFrame(loop);
}

function init_points(pointsCount)
{
	for (i = 0; i < POINTS_COUNT; i++)
	{
		let scale = Math.random() * (MAX_SCALE - MIN_SCALE) + MIN_SCALE;
		let x = Math.floor(Math.random() * canvas.width);
		let y = Math.floor(Math.random() * canvas.height);
		points.push(new point(x, y, scale));
	}
}

window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});

init_images();
init_points();

requestAnimationFrame(loop);
 */
