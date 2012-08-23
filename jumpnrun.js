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

	//eventhandler
	this.events = new Array();
	
	//keyboard
	this.keys = new Array(256);
	for(var i = 0; i < 256; i++)
		this.keys[i] = false; //disable all keys

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

	window.addEventListener("keydown", function(e) {
		this.keys[e.keyCode] = true;
	});

	window.addEventListener("keyup", function(e) {
		this.keys[e.keyCode] = false;
	});

	window.addEventListener("keypress", function(e) {
		me.onEvent("keypress", e);
	});

	//tile types
	this.TILE_SOLID = 1;
	this.TILE_AIR = 0;

	for(var y = 0; y < this.mapSize[1]; y++)
	{
		this.map[y] = new Array();

		for(var x = 0; x < this.mapSize[0]; x++)
		{	
			var tile = this.TILE_AIR;

			/*if(Math.random() > 0.5)
				tile = this.TILE_SOLID;
			else
				tile = this.TILE_AIR;*/

			this.map[y][x] = tile;
		}
	}

	//testing
	this.player = new this.entity(this, "player");
	//append player entity
	this.entitys.push(this.player);

	this.entitys.push(new this.entity(this, "builder"));
	//this.entitys.push(new this.entity(this, "collide_tester"));

	this.infoText = new this.entity(this, "text");
	this.infoText.pos = [100, 50];
	this.entitys.push(this.infoText);

	//testing event
	this.GameLoop();
}

JumpnRun.prototype.addEventListener = function(eventName, callback)
{
	this.events.push([eventName, callback]);
}

JumpnRun.prototype.remEventListener = function(eventName, callback)
{
	var oldEvents = this.events;
	this.events = new Array();

	for(var i = 0; i < this.events.length; i++)
	{
		if(!(oldEvents[i][0] == eventName && oldEvents[i][1] == callback))
			this.events.push(oldEvents[i]);
	}
}

JumpnRun.prototype.onEvent = function(eventName, param)
{
	for(var i = 0; i < this.events.length; i++)
	{
		if(this.events[i][0] == eventName)
			this.events[i][1](param);
	}
}

JumpnRun.prototype.GameLoop = function()
{
	//clear screen
	this.ctx.fillStyle = "#000000";
	this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);


	//tick entitys
	for(var i = 0; i < this.entitys.length; i++)
		this.entitys[i].tick();
	
	this.drawMap();

	//render entitys
	for(var i = 0; i < this.entitys.length; i++)
		this.entitys[i].render();

	var me = this;
	setTimeout(function() { me.GameLoop.apply(me); }, 1000/50);
}

JumpnRun.prototype.drawBox = function(pos, size, color)
{
	if(color)
		this.ctx.strokeStyle = color;
	else
		this.ctx.strokeStyle = "#00FF00";

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
	for(var y = 0; y < this.mapSize[1]; y++)
	{
		for(var x = 0; x < this.mapSize[0]; x++)
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
	
	for(var i = 1; i < 2; i++)
	{
		var cur_pos;
		var cur_size;
		var rect_pos;
		var rect_size;
		
		if(i == 0)
		{
			cur_pos = [rpos1[0], rpos1[1]];
			cur_size = [rsize1[0], rsize1[1]];
			rect_pos = [rpos2[0], rpos2[1]];
			rect_size = [rsize2[0], rsize2[1]];
		}
		else
		{
			cur_pos = [rpos2[0], rpos2[1]];
			cur_size = [rsize2[0], rsize2[1]];
			rect_pos = [rpos1[0], rpos1[1]];
			rect_size = [rsize1[0], rsize1[1]];
		}

		if(this.inRect(cur_pos, rect_pos, rect_size))
			return true;
		
		cur_pos[0] += cur_size[0];
		if(this.inRect(cur_pos, rect_pos, rect_size))
			return true;
	
		cur_pos[1] += cur_size[1];
		if(this.inRect(cur_pos, rect_pos, rect_size))
			return true;
	
		cur_pos[0] -= cur_size[0];
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

JumpnRun.prototype.getTilePos = function(tile)
{
	return [tile[1]*this.tileSize, tile[0]*this.tileSize];
}

JumpnRun.prototype.distance = function(pos1, pos2)
{
	var cur = [pos2[0]-pos1[0], pos2[1]-pos1[1]];
	return Math.sqrt(Math.abs(cur[0]*cur[0]+cur[1]*cur[1]));
}

JumpnRun.prototype.mix = function(pos1, pos2, a)
{
	var dist = this.distance(pos1, pos2);
	var vec = [pos2[0]-pos1[0], pos2[1]-pos1[1]];

	vec = this.normalize(vec);

	dist *= a;

	vec[0] *= dist;
	vec[1] *= dist;

	return [pos1[0]+vec[0], pos1[1]+vec[1]];
}

//class entity
JumpnRun.prototype.entity = function(jnr, type)
{
	var me = this;
	this.TYPE_PLAYER=0;
	this.TYPE_BUILDER=1;
	this.TYPE_COLLIDE_TESTER=2;
	this.TYPE_TEXT=3;

	if(type == "player")
		this.type = this.TYPE_PLAYER;
	else if(type == "builder")
		this.type = this.TYPE_BUILDER;
	else if(type == "collide_tester")
		this.type = this.TYPE_COLLIDE_TESTER;
	else if(type == "text")
		this.type = this.TYPE_TEXT;

	this.jnr = jnr;

	this.physics = false;

	//entity position and velocity
	this.pos = [0.0, 0.0];
	this.vel = [0.0, 0.0];

	if(this.type == this.TYPE_PLAYER)
	{
		this.jnr.addEventListener("keypress", function(e) {
			if(e.keyCode == 98) //'b'
			{
				//reset player position
				me.pos = [100, 40];
				me.vel = [0.0, 0.0];
			}
			else if(e.keyCode == 97)
				me.pos[0] -= 16;
			else if(e.keyCode == 99)
				me.pos[0] += 16;
		});

		this.collBox = [16, 48];
		this.collBoxPos = [-8, -24];
		this.physics = true;
	}
	else if(this.type == this.TYPE_COLLIDE_TESTER)
	{
		this.bSize = [16, 48];
	}
	else if(this.type == this.TYPE_TEXT)
		this.text = "<empty>";
}

JumpnRun.prototype.entity.prototype.render = function()
{
	if(this.physics)
	{
		//draw bounding box
		this.jnr.drawBox([this.pos[0]+this.collBoxPos[0], this.pos[1]+this.collBoxPos[1]], [this.collBox[0], this.collBox[1]]);
	}

	if(this.type == this.TYPE_BUILDER)
	{
		var fix = this.jnr.tileSize / 2.0;
		var tilePos = this.jnr.getTileAt([this.jnr.mousePos[0]-fix, this.jnr.mousePos[1]-fix]);
		tilePos[0] *= this.jnr.tileSize;
		tilePos[1] *= this.jnr.tileSize;
		this.jnr.drawBox(tilePos, [32, 32]);
	}
	else if(this.type == this.TYPE_COLLIDE_TESTER)
	{
		this.jnr.drawBox(this.jnr.mousePos, [this.bSize[0], this.bSize[1]], this.collide ? "#ff0000" : null);
	}
	else if(this.type == this.TYPE_TEXT)
	{
		//render text
		this.jnr.ctx.font = "15pt Arial";
		this.jnr.ctx.textAlign = "center";
		this.jnr.ctx.fillStyle = "#0000ff";	
		this.jnr.ctx.fillText(this.text, this.pos[0], this.pos[1]);
	}
}

JumpnRun.prototype.entity.prototype.collides = function(curPos)
{
	var collide = false;
	for(var y = 0; y < this.jnr.mapSize[1]; y++)
	{
		for(var x = 0; x < this.jnr.mapSize[0]; x++)
		{
			if(this.jnr.map[y][x] != this.jnr.TILE_SOLID)
				continue;
			
			var ePos = [curPos[0]+this.collBoxPos[0], curPos[1]+this.collBoxPos[1]];
			var eSize = [this.collBox[0], this.collBox[1]];
			var tilePos = this.jnr.getTilePos([y, x]);

			if(this.jnr.boxCollide(ePos, eSize, tilePos, [this.jnr.tileSize, this.jnr.tileSize]))
				collide = true;	
		}
	}

	return collide;
}

JumpnRun.prototype.entity.prototype.move = function()
{
	var dist = this.jnr.distance(this.pos, [this.pos[0]+this.vel[0], this.pos[1]+this.vel[1]]);
	var end = dist;
	var lastPos = this.pos;

	var collide = false;
	for(var i = 0; i < end; i++)
	{
		var curPos = this.jnr.mix(this.pos, [this.pos[0]+this.vel[0], this.pos[1]+this.vel[1]], i/dist);

		if(this.collides(curPos))
		{
			collide = true;
			break;
		}

		lastPos = curPos;
	}

	this.jnr.infoText.text = collide ? "yes" : "no";

	if(collide)
	{
		//use the previous position
		this.pos[0] = lastPos[0];	
		this.pos[1] = lastPos[1];
		this.vel = [0.0, 0.0]; //reset velocity
	}
	else
	{
		this.pos[0] += this.vel[0];
		this.pos[1] += this.vel[1];
	}
}

JumpnRun.prototype.entity.prototype.tick = function()
{
	if(this.physics)
	{
		this.vel[0] += this.jnr.gravityVel[0];
		this.vel[1] += this.jnr.gravityVel[1];	
	
		//prevent endless speed
		if(this.jnr.vecLen(this.vel) > this.jnr.maxFallSpeed)
		{
			var norm = this.jnr.normalize(this.vel);
			this.vel = [norm[0]*this.jnr.maxFallSpeed, norm[1]*this.jnr.maxFallSpeed];	
		}
	
		this.move();
		
		/*var collide = false;
		//testing: collision check
		for(var y = 0; y < this.jnr.mapSize[1]; y++)
		{
			for(var x = 0; x < this.jnr.mapSize[0]; x++)
			{
				if(this.jnr.map[y][x] != this.jnr.TILE_SOLID)
					continue;

				var ePos = [this.pos[0]+this.collBoxPos[0], this.pos[1]+this.collBoxPos[1]];
				var eSize = [this.collBox[0], this.collBox[1]];
				var tilePos = this.jnr.getTilePos([y, x]);
	

				if(this.jnr.boxCollide(ePos, eSize, tilePos, [this.jnr.tileSize, this.jnr.tileSize]))
					collide = true;	
			}
		}*/
	}
	
	if(this.type == this.TYPE_BUILDER)
	{
		var fix = this.jnr.tileSize / 2.0;
		var tilePos = this.jnr.getTileAt([this.jnr.mousePos[0]-fix, this.jnr.mousePos[1]-fix]);

		if(this.jnr.mouseClicked[0])
		{
			//add a block
			this.jnr.map[tilePos[1]][tilePos[0]] = this.jnr.TILE_SOLID;
		}
	}
	else if(this.type == this.TYPE_COLLIDE_TESTER)
	{
		var rectPos = [this.jnr.mousePos[0], this.jnr.mousePos[1]];
		var num = 0;
		var collides = 0;

		for(var y = 0; y < this.jnr.mapSize[1]; y++)
		{
			for(var x = 0; x < this.jnr.mapSize[0]; x++)
			{
				if(this.jnr.map[y][x] != this.jnr.TILE_SOLID)
					continue;
				var pos = this.jnr.getTilePos([y, x]);
				
				if(this.jnr.boxCollide(pos, [this.jnr.tileSize, this.jnr.tileSize], rectPos, this.bSize))
					collides++;
				num++; //number of coll checks
			}
		}

		this.collide = collides > 0;
		this.jnr.infoText.text = collides;
	}
}
