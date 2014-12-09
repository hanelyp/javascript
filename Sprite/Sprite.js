// jsdoc Sprite.1.js -d doc -c jsdoc.conf -u demos

/**
 * @file Sprite.2.js
 * @author Peter Hanely hanelyp@gmail.com
 * @copyright 2014
 * @license AGPL 3+
 */
/** 
 * A simple but highly adaptable sprite library for HTML5
 * @constructor
 * @param {Object} params - initial properties of the sprite
 * @prop {number}	x:		position of Sprite center, in px.
 * @prop {number}	y:
 * @prop {number}	spin:		clockwise rotation in degrees
 * @prop {number}	sx: 		scale of image, default 1.
 * @prop {number}	sy:
 * @prop {number}	sourceX:	location of sprite on source image, default top left corner
 * @prop {number}	sourceY:
 * @prop {number}	width:		size of image
 * @prop {number}	height:
 * @prop {number}	frames:		number of frames in sprite, arrayed horizontally on source
 * @prop {number}	directions:	number of directions represented on sprite, arrayed vertically on sprite
 	
 * @param {string} image - URL of a source image
 * @param {string} display - if of a display element to hold sprite, or the display element itself
 
 * @prop {url} image
 * @prop {string} display
 * @example
 * // gamedisplay is id of a div on the page
 * testsprite = new Sprite({x:100, y:100, width:64, height:64, sourceX:320-32, sourceY:240-32}, spritesheet, 'gamedisplay');
 *
 * container = document.createElement("div");
 * sprite = new Sprite({width:64, height:64, x:32, y: 96, sourceY: 256}, Img, container);
 
*/
function Sprite(params, image, display)
{
	this.image = image;
	this.display = display;

	this.index = Sprite.prototype.index++;
	this.sprite = null;

	if (display)
	{
		var parent = document.getElementById(display);
		//console.log(parent);
		if (parent == null)	{ parent = display;	}
		//console.log (display, parent);
		this.sprite = document.createElement("div");
		this.sprite.style.position = 'absolute';
		this.sprite.id = 'Sprite_'+this.index;
		this.id = this.sprite.id;
		this.sprite.style.transformOrigin = '50% 50%';
		parent.appendChild(this.sprite);
	}

	this.width = 1*params.width;
	this.height = 1*params.height;
	this.sourceX = 1*params.sourceX || 0;
	this.sourceY = 1*params.sourceY || 0;
	// sprites with framesets and rendered for directions (as used by Xtux)
	this.frames = 1*params.frames || 0;
	this.directions = 1*params.directions || 0;
	this.frame = 0;
	this.direction = 0;
	this.sprite.style.width = this.width+'px';
	this.sprite.style.height = this.height+'px';
	this.sprite.style.overflow = 'hidden';

	this.setImage(image);
	this.translateTo(1*params.x || 0, 1*params.y || 0);
	this.spinTo(1*params.spin || 0);
	this.scaleTo(1*params.sx || 1, 1*params.sy || 1);
}

Sprite.prototype = {
	index : 0,	// index of next sprite to generate

	/**
	* reposition sprite
	@public
	@arg {number} x -
	@arg {number} y -
	@arg {number} spin -
	@arg {number} sx -
	@arg {number} sy -
	*/
	animateTo : function(x,y,spin, sx, sy, time)
	{
		this.x = x || this.x;
		this.y = y || this.y;
		this.spin = spin || this.spin;
		this.sx = sx || this.sx;
		this.sy = sy || this.sy;
		
		this.doTranslate();
		this.doSpin();
	},

	/** 
	* set rotation
	@public
	@arg {number} spin - new rotation in degrees
	*/
	spinTo : function(spin)
	{
		this.spin = spin || this.spin;
		this.doSpin();
	},

	/**
	* move sprite center to x,y
	@arg {number}	x
	@arg {number}	y
	*/
	translateTo : function(x,y)
	{
		this.x = x;// || this.x;
		this.y = y;// || this.y;
		//console.log(x,y);
		
		this.doTranslate();
	},

	/**
	* resize sprite
	@arg {number}	sx
	@arg {number}	sy
	*/
	scaleTo : function(sx, sy)
	{
		this.sx = sx || this.sx;
		this.sy = sy || this.sy;
		
		this.doSpin();
	},

	/**
	* spin by increment
	@arg {number} spin - degrees to spin by
	*/
	spinInc : function(spin)
	{
		spin = spin || 1;
		this.spin = spin + this.spin;
		this.doSpin();
	},

	/**
	* move sprite relative to current position
	@arg {number}	x
	@arg {number}	y
	*/
	translate : function(x,y)
	{
		this.x = x + this.x;
		this.y = y + this.y;
		
		this.doAnimate();
	},

	/**
	* resize sprite relative to current
	@arg {number}	sx
	@arg {number}	sy
	*/
	scale : function(sx, sy)
	{
		this.sx = sx * this.sx;
		this.sy = sy * this.sy;
		
		this.doSpin();
	},

	/**
	* advance to next animation frame
	*/
	nextFrame : function()
	{
		this.frame = ((this.frame+1) % this.frames);
		//if (!noupdate)	{
		this.doAnimate();
	},

	/**
	* display face closest to specified direction
	@arg {number} dir - direction to face in degrees, zero is first direction on spritesheet
	*/
	face : function(dir)
	{
		this.direction = Math.floor((dir/360)*this.directions + 0.5)%this.directions;
		//console.log(dir, this.direction);
		//if (!noupdate)	{	
		this.doAnimate();
	},

	/**
	* change image sprite sheet
	* this is slow, not a preferred animation method
	@arg {url} img
	*/
	setImage : function(img)
	{
		this.image = img;
		this.sprite.style.background = 'url('+this.image+') '+
						(-(this.sourceX+this.frame*this.width))+'px '+
						(-(this.sourceY+this.direction*this.height))+'px';
	},

	doTranslate : function()
	{
		if (!this.sprite)	{ return;	}
		this.sprite.style.zIndex = Math.floor(10*this.y);
		this.sprite.style.left = (this.x-this.width/2)+'px';//(this.x+this.frame*this.width)+'px';
		this.sprite.style.top = (this.y-this.height/2)+'px'; //(this.y+this.direction*this.height)+'px';
	},

	doAnimate : function()
	{
		this.sprite.style.backgroundPosition = 
						(-(this.sourceX+this.frame*this.width))+'px '+
						(-(this.sourceY+this.direction*this.height))+'px';
	},

	doSpin : function()
	{
		if (!this.sprite)	{ return;	}
		if (this.spin)
		{	
			this.sprite.style.transform = //'translate('+(-this.width/2)+','+(-this.height/2)+') ' +
						'rotate('+this.spin+'deg) '+
						'scale('+this.sx+','+this.sy+') ';
		}
		else
		{	this.sprite.style.transform = "";	}
	},

	/**
	* set ontouchstart/onmousedown handler for sprite display element
	@arg (touchHandler) func
	*/
	setOntouch : function(func)
	{
		this.sprite.onmousedown = func;
		this.sprite.ontouchstart = func;
	}
};

