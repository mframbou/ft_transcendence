var imagesArray = [
	"sspina-transparent.png",
	"dsamain-transparent.png",
	"oronda-transparent.png",
	"mframbou-transparent.png"
].map(e => {
	const image = new Image();
	image.src = e;
	return image;
});

var heartsOutside = [];

var HeartsBackground = {
	heartHeight: 64,
	heartWidth: 64,
	hearts: [],
	maxHearts: 60,
	minScale: 0.4,
	update: '',

	draw: function()
	{
		this.ctx.clearRect(0, 0, this.w, this.h);
		for (var i = 0; i < this.hearts.length; i++)
		{
			var num = Math.floor(Math.random() * 4);			
			if(heartsOutside[i] !== "")
				num = heartsOutside[i];

			var heart = this.hearts[i];
			heartsOutside[i] = num;
			heart.image = imagesArray[num];
			// heart.image = new Image();
			// heart.image.style.height = heart.height;
			
			// heart.image.src = imagesArray[num];
			this.ctx.globalAlpha = heart.opacity;
			this.ctx.drawImage (heart.image, heart.x, heart.y, heart.width, heart.height);
		}
		this.move();
		requestAnimationFrame(this.draw.bind(this));
	},

	move: function()
	{
		for(var b = 0; b < this.hearts.length; b++) {
		var heart = this.hearts[b];
		heart.y += heart.ys;
		if(heart.y > this.h) {
			heart.x = Math.random() * this.w;
			heart.y = -1 * this.heartHeight;
			heartsOutside[b] = ""
		}
		}
	},
	setCanvasSize: function()
	{
		this.canvas.width = this.canvas.parentElement.clientWidth;
		this.canvas.height = this.canvas.parentElement.clientHeight;
		this.w = this.canvas.width;
		this.h = this.canvas.height;
	},

	initialize: function()
	{
		this.canvas = document.querySelector('#canvas');

		if(!this.canvas.getContext)
		return;

		this.setCanvasSize();
		this.ctx = this.canvas.getContext('2d');

		this.hearts = [];
		heartsOutside = ["", "", "", "", "", "", "", "", "", "", 
						 "", "", "", "", "", "", "", "", "", "", 
						 "", "", "", "", "", "", "", "", "", "", 
						 "", "", "", "", "", "", "", "", "", "", 
						 "", "", "", "", "", "", "", "", "", "", 
						 "", "", "", "", "", "", "", "", "", "",
						 "", "", "", "", "", "", "", "", "", ""];

		for(var a = 0; a < this.maxHearts; a++)
		{
			var scale = (Math.random() * (1 - this.minScale)) + this.minScale;
			this.hearts.push({
				x: Math.random() * this.w,
				y: Math.random() * this.h,
				ys: Math.random() + 2,
				
				height: scale * this.heartHeight,
				width: scale * this.heartWidth,
				opacity: scale,
				image: imagesArray[Math.floor(Math.random()*imagesArray.length)]
			});
		}

		requestAnimationFrame(this.draw.bind(this));
	}
};

function sleep(ms) {
	return new Promise(res => setTimeout(res, ms));
}
window.addEventListener("resize", async () => {
	// await sleep(2000);
	HeartsBackground.setCanvasSize();
});

HeartsBackground.initialize();
