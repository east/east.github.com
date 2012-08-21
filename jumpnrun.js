function JumpnRun(cvs)
{
	var me = this;
	this.cvs = cvs;
	this.ctx = cvs.getContext('2d');

	this.gravityVel = [0.0, 0.25];
	this.maxFallSpeed = 20.0;
	
	this.tileSize = 32;
	this.mapSize = [Math.round(cvs.width/this.tileSize), Math.round(cvs.height/this.tileSize)];
	this.map = new Array();

	this.entitys = new Array();

	//mouse position
	this.mousePos = [0.0, 0.0];
	this.mouseClicked = [false, false]; //left and right mouse button

	//mouse event listener
	cvs.addEventListener("mousemove", function(e) {
		me.mousePos[0] = e.offsetX;
		me.mousePos[1] = e.offsetY;
	});

	cvs.addEventListener("mousedown", function(e) {
		me.mouseClicked[0] = true;	
	});

	cvs.addEventListener("mouseup", function(e) {
		me.mouseClicked[0] = false;	
	});

	//tile types
	this.TILE_SOLID = 1;
	this.TILE_AIR = 0;

	for(y = 0; y < this.mapSize[1]; y++)
	{
		this.map[y] = new Array();

		for(x = 0; x < this.mapSize[0]; x++)
		{	
			var tile = this.TILE_AIR;

			if(y == this.mapSize[1]-1)
				tile = this.TILE_SOLID;

			/*if(Math.random() > 0.5)
				tile = this.TILE_SOLID;
			else
				tile = this.TILE_AIR;*/

			this.map[y][x] = tile;
		}
	}

	/*//testing
	this.player = new this.entity(this, "player");
	//append player entity
	this.entitys.push(this.player);*/

	this.entitys.push(new this.entity(this, "builder"));

	this.GameLoop();
}

JumpnRun.prototype.GameLoop = function()
{
	//clear screen
	this.ctx.fillStyle = "#000000";
	this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

	//tick entitys
	for(i = 0; i < this.entitys.length; i++)
		this.entitys[i].tick();
	
	this.drawMap();

	//render entitys
	for(i = 0; i < this.entitys.length; i++)
		this.entitys[i].render();

	var me = this;
	setTimeout(function() { me.GameLoop.apply(me); }, 1000/50);
}

JumpnRun.prototype.drawBox = function(pos, size, type)
{
	this.ctx.strokeStyle = "#0000FF";

	this.ctx.beginPath();
	this.ctx.moveTo(pos[0], pos[1]);
	this.ctx.lineTo(pos[0]+size[0], pos[1]);
	this.ctx.lineTo(pos[0]+size[0], pos[1]+size[1]);
	this.ctx.lineTo(pos[0], pos[1]+size[1]);
	this.ctx.lineTo(pos[0], pos[1]);
	this.ctx.lineTo(pos[0]+size[0], pos[1]+size[1]);

	this.ctx.stroke();
}

JumpnRun.prototype.drawMap = function()
{
	for(y = 0; y < this.mapSize[1]; y++)
	{
		for(x = 0; x < this.mapSize[0]; x++)
		{
			if(this.map[y][x] == this.TILE_SOLID)
				this.drawBox([x*this.tileSize, y*this.tileSize], [this.tileSize, this.tileSize]);	
		}
	}

}

JumpnRun.prototype.inRect = function(rpos, rect_pos, rect_size)
{
	if(	rpos[0] > rect_pos[0] && rpos[0] < rect_pos[0]+rect_size[0] &&
		rpos[1] > rect_pos[1] && rpos[1] < rect_pos[1]+rect_size[1])
			return true;
	
	return false;
}

JumpnRun.prototype.boxCollide = function(rpos1, rsize1, rpos2, rsize2)
{
	//check wether two rectangles collide
	
	for(i = 0; i < 2; i++)
	{
		var cur_pos;
		var cur_size;
		var rect_pos;
		var rect_size;
		
		if(i == 0)
		{
			cur_pos = rpos1;
			cur_size = rsize1;
			rect_pos = rpos2;
			rect_size = rsize2;
		}
		else
		{
			cur_pos = rpos2;
			cur_size = rsize2;
			rect_pos = rpos1;
			rect_size = rsize1;	
		}

		if(this.inRect(cur_pos, rect_pos, rect_size))
			return true;
		
		cur_pos[0] += rsize1[0];
		if(this.inRect(cur_pos, rect_pos, rect_size))
			return true;
	
		cur_pos[1] += rsize1[1];
		if(this.inRect(cur_pos, rect_pos, rect_size))
			return true;
	
		cur_pos[0] -= rsize1[0];
		if(this.inRect(cur_pos, rect_pos, rect_size))
			return true;
	}

	return false;
}

JumpnRun.prototype.normalize = function(vec)
{
	var len = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
	return [vec[0]/len, vec[1]/len];
}

JumpnRun.prototype.vecLen = function(vec)
{
	return Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
}

JumpnRun.prototype.getTileAt = function(pos)
{
	var cur = pos;

	cur[0] = Math.round(pos[0]/this.tileSize);
	cur[1] = Math.round(pos[1]/this.tileSize);

	return cur;
}

//class entity
JumpnRun.prototype.entity = function(jnr, type)
{
	this.TYPE_PLAYER=0;
	this.TYPE_BUILDER=1;

	if(type == "player")
		this.type = this.TYPE_PLAYER;
	else if(type == "builder")
		this.type = this.TYPE_BUILDER;
	this.jnr = jnr;

	//entity position and velocity
	this.pos = [0.0, 0.0];
	this.vel = [0.0, 0.0];

	if(this.type == this.TYPE_PLAYER)
	{
		this.collBox = [16, 48];
		this.collBoxPos = [-8, -24];
	}
	else if(this.type == this.TYPE_BUILDER)
	{
		
	}

}

JumpnRun.prototype.entity.prototype.render = function()
{
	if(this.type == this.TYPE_PLAYER)
	{
		//draw bounding box
		this.jnr.drawBox([this.pos[0]+this.collBoxPos[0], this.pos[1]+this.collBoxPos[1]], [this.collBox[0], this.collBox[1]]);
	}
	else if(this.type == this.TYPE_BUILDER)
	{
		var fix = this.jnr.tileSize / 2.0;
		var tilePos = this.jnr.getTileAt([this.jnr.mousePos[0]-fix, this.jnr.mousePos[1]-fix]);
		tilePos[0] *= this.jnr.tileSize;
		tilePos[1] *= this.jnr.tileSize;
		this.jnr.drawBox(tilePos, [32, 32]);
	}
}

JumpnRun.prototype.entity.prototype.tick = function()
{
	if(this.type == this.TYPE_PLAYER)
	{
		this.vel[0] += this.jnr.gravityVel[0];
		this.vel[1] += this.jnr.gravityVel[1];	
	
		//prevent endless speed
		if(this.jnr.vecLen(this.vel) > this.jnr.maxFallSpeed)
		{
			var norm = this.jnr.normalize(this.vel);
			this.vel = [norm[0]*this.jnr.maxFallSpeed, norm[1]*this.jnr.maxFallSpeed];	
		}
	
		this.pos[0] += this.vel[0];
		this.pos[1] += this.vel[1];
	}
	else if(this.type == this.TYPE_BUILDER)
	{
		var fix = this.jnr.tileSize / 2.0;
		var tilePos = this.jnr.getTileAt([this.jnr.mousePos[0]-fix, this.jnr.mousePos[1]-fix]);

		if(this.jnr.mouseClicked[0])
		{
			//add a block
			this.jnr.map[tilePos[1]][tilePos[0]] = this.jnr.TILE_SOLID;
		}
	}
}
