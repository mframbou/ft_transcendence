import { Component, OnInit } from '@angular/core';


class FallingHeadsCanvas
{

  constructor(canvas: HTMLCanvasElement, images: string[])
  {
    if (!canvas || !images || images.length === 0)
      return ;

    
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
    // <type> is for casting
    const canvas = <HTMLCanvasElement> document.querySelector(".falling-heads-background");


  }
}

/*
let images = [
	"images/sspina-transparent.png",
	"images/dsamain-transparent.png",
	"images/oronda-transparent.png",
	"images/mframbou-transparent.png"
]

const IMG_HEIGHT = 64;
const IMG_WIDTH = 64;
const MIN_SCALE = 0.4;
const MAX_SCALE = 1.0;
const MIN_VELOCITY = 1.5;
const MAX_VELOCITY = 2.2;
const POINTS_COUNT = 80;

const canvas = document.querySelector(".falling-heads-background");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const points = [];

function init_images()
{
	images = images.map(e => {
		const image = new Image();
		image.src = e;
		return image;
	});
}

class point
{
	constructor(x, y, scale)
	{
		this.img = images[Math.floor(Math.random() * images.length)];
		this.x = x;
		this.y = y;
		this.height = IMG_HEIGHT * scale;
		this.width = IMG_WIDTH * scale;
		this.size = scale;
		this.opacity = scale;
		this.originalOpacity = this.opacity;
		this.velocity = Math.random() * (MAX_VELOCITY - MIN_VELOCITY) + MIN_VELOCITY;
	}

	update()
	{
		this.y += this.velocity;

		if (this.y > canvas.height + IMG_HEIGHT)
		{
			this.x = Math.random() * canvas.width;
			this.img = images[Math.floor(Math.random() * images.length)];
			this.y = -IMG_HEIGHT; // To make it appear gradually
		}
	}

	drawImg()
	{
		ctx.globalAlpha = this.opacity;
		ctx.drawImage(this.img, this.x - this.width / 2, this.y - this.height - 2, this.width, this.height);
	}
}

function dist(x1, y1, x2, y2)
{
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

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
