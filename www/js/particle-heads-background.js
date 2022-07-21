const canvas = document.querySelector(".particle-heads-background");
const ctx = canvas.getContext("2d");

canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

const MAX_POINT_SIZE = 25;
const MIN_POINT_SIZE = 10;
const MAX_DIST = Math.max(canvas.width, canvas.height) / 8;
const MIN_VELOCITY = 1;
const MAX_VELOCITY = 2;
const MAX_POINTS = 200;
const POINTS_COUNT = 80;
const COLOR = "#55a0f0";

let imgs = ["./images/sspina-transparent.png",
			"./images/dsamain-transparent.png",
			"./images/oronda-transparent.png",
			"./images/mframbou-transparent.png"]

let points = [];

class point
{
	constructor(x, y, size)
	{
		this.x = x;
		this.y = y;
		this.size = size;
		this.angle = Math.random() * Math.PI * 2;
		this.vel = Math.random() * (MAX_VELOCITY - MIN_VELOCITY) + MIN_VELOCITY;
		this.img = imgs[Math.floor(Math.random() * imgs.length)];
	}

	update()
	{
		this.x = Math.cos(this.angle) * this.vel + this.x;
		this.y = Math.sin(this.angle) * this.vel + this.y;

		if (this.x < 0 || this.x > canvas.width)
			this.angle = Math.PI - this.angle;

		if (this.y < 0 || this.y > canvas.height)
			this.angle = -this.angle;
	}

	drawPoint(color = "white")
	{
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, POINT_SIZE / 2, 0, Math.PI * 2);
		ctx.fill();
	}

	drawImg()
	{
		ctx.drawImage(this.img, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
	}
};

function dist(x1, y1, x2, y2)
{
	let a = Math.abs(x1 - x2);
	let b = Math.abs(y1 - y2);
	return Math.sqrt(a * a + b * b);
}

function draw_line(x1, y1, x2, y2, color = COLOR)
{
	let trans = (Math.max(0, 255 - Math.floor(dist(x1, y1, x2, y2) / MAX_DIST * 255))).toString(16);
	if (trans.length == 1) trans = '0' + trans;
	ctx.beginPath();
	ctx.strokeStyle = color + trans;
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function colorToHex(color)
{
	let hex = Math.floor(color).toString(16);
	while (hex.length < 6) hex = '0' + hex;
	return '#' + hex;
}

function loop()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (i = 0; i < points.length; ++i) {
		points[i].update();
	}
	for (i = 0; i < points.length; ++i) {
		for (j = i + 1; j < points.length; ++j) {
			if (dist(points[i].x, points[i].y, points[j].x, points[j].y) >= MAX_DIST)
				continue;
			draw_line(points[i].x, points[i].y, points[j].x, points[j].y);
		}

		if (mousePos != undefined)
		{
			if (dist(points[i].x, points[i].y, mousePos.x, mousePos.y) >= MAX_DIST)
				continue;
			draw_line(points[i].x, points[i].y, mousePos.x, mousePos.y);
		}
	}
	for (i = 0; i < points.length; i++) {
		points[i].drawImg();
	}

	requestAnimationFrame(loop);
}

function init_imgs()
{
	imgs = imgs.map(path => {
			let img = new Image()	;
			img.src = path;
			return img;
		});
}

function init_points(pointsCount)
{
	for (i = 0; i < pointsCount; i++)
	{
		let pointSize = Math.random() * (MAX_POINT_SIZE - MIN_POINT_SIZE) + MIN_POINT_SIZE;
		let x = Math.floor(Math.random() * canvas.width);
		let y = Math.floor(Math.random() * canvas.height);
		points.push(new point(x, y, pointSize));
	}
}

canvas.addEventListener("click", (e) => {
	if (points.length + 3 < MAX_POINTS)
	{
		for (i = 0; i < 3; i++)
		{
			let pointSize = Math.random() * (MAX_POINT_SIZE - MIN_POINT_SIZE) + MIN_POINT_SIZE;
			points.push(new point(e.clientX, e.clientY, pointSize));
		}
	}
});

canvas.addEventListener("mousemove", e => {
	mousePos = { x: e.clientX, y: e.clientY };
});

window.addEventListener("resize", () => {
	canvas.width = canvas.parentElement.clientWidth;
	canvas.height = canvas.parentElement.clientHeight;
});


let mousePos = undefined;

ctx.globalCompositionOperation = "source-over";

init_imgs();
init_points(POINTS_COUNT);

requestAnimationFrame(loop);