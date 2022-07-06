var imagesArray = ["sspina-transparent.png", "dsamain-transparent.png", "oronda-transparent.png", "mframbou-transparent.png"];

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
		this.setCanvasSize();
		this.ctx.clearRect(0, 0, this.w, this.h);
		for (var i = 0; i < this.hearts.length; i++)
		{
			var num = Math.floor(Math.random() * 4);

			if(heartsOutside[i] !== "")
				num = heartsOutside[i];

			var heart = this.hearts[i];
			heartsOutside[i] = num;
			heart.image = new Image();
			heart.image.style.height = heart.height;
			
			heart.image.src = imagesArray[num];
			this.ctx.globalAlpha = heart.opacity;
			this.ctx.drawImage (heart.image, heart.x, heart.y, heart.width, heart.height);
		}
		this.move();
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
		this.canvas.width = $('#canvas').parent().width();
		this.canvas.height = $('#canvas').parent().height();
		this.w = this.canvas.width;
		this.h = this.canvas.height;
	},

	initialize: function()
	{
		this.canvas = $('#canvas')[0];

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
				ys: Math.random() + 1,
				
				height: scale * this.heartHeight,
				width: scale * this.heartWidth,
				opacity: scale,
				image: imagesArray[Math.floor(Math.random()*imagesArray.length)]
			});
		}

		this.update = setInterval($.proxy(this.draw, this), 25);
	}
};

$(document).ready(function() {
	HeartsBackground.initialize();
});


$(window).resize(function() {
	if (HeartsBackground.update != '')
		clearInterval(HeartsBackground.update);
	HeartsBackground.initialize();
});