//var Orb = IgeEntityBox2d.extend({
var Orb = IgeEntityBox2d.extend({

    classId: 'Orb',
	
    init: function (scale) {
		IgeEntityBox2d.prototype.init.call(this);
		
		var self = this;

		if (ige.codeRunner) {
			ige.codeRunner.addOrb(this);
			scale = Math.min(4, scale);
		}

        // Set the rectangle colour (this is read in the Rectangle.js smart texture)
        this._rectColor = '#ffc600';
		self.color = 'rgb(255,255,0)';
		self.fillColor = 'rgba(255,255,0,0.25)';
		
		if(arguments.length < 1) {
			scale = 2;
		}

		self.scale = scale;
		self.pointWorth = Math.round(Math.pow(1/self.scale,2)*100);
		self.exploding = false;
		
		if (ige.isServer) {
			// Define the polygon for collision
			var triangles,
				fixDefs,
				collisionPoly = new IgePoly2d()
					.addPoint(-this._geometry.x * scale, -this._geometry.y * scale / 2)
					.addPoint(-this._geometry.x * scale / 2, -this._geometry.y * scale)
					.addPoint(this._geometry.x * scale / 2, -this._geometry.y * scale)
					.addPoint(this._geometry.x * scale, -this._geometry.y * scale / 2)
					.addPoint(this._geometry.x * scale, this._geometry.y * scale / 2)
					.addPoint(this._geometry.x * scale / 2, this._geometry.y * scale)
					.addPoint(-this._geometry.x * scale / 2, this._geometry.y * scale)
					.addPoint(-this._geometry.x * scale, this._geometry.y * scale / 2)
					
			// Scale the polygon by the box2d scale ratio
			collisionPoly.divide(ige.box2d._scaleRatio);

			// Now convert this polygon into an array of triangles
			triangles = collisionPoly.triangulate();
			self.triangles = triangles;

			// Create an array of box2d fixture definitions
			// based on the triangles
			fixDefs = [];

			for (var i = 0; i < self.triangles.length; i++) {
				fixDefs.push({
					density: 0.1,
					friction: 1.0,
					restitution: 0.5,
					filter: {
						categoryBits: 0x00ff,
						maskBits: 0xffff & ~0x0008
					},
					shape: {
						type: 'polygon',
						data: self.triangles[i]
					}
				});
			}
			// collision definition END
			
		
			self._thrustPower = 8*scale;

			self.box2dBody({
				type: 'dynamic',
				linearDamping: 2,
				angularDamping: 2,
				allowSleep: true,
				fixtures: fixDefs,
				fixedRotation: false,
                gravityScale: 0.0,
			});
			
			
			self.addComponent(IgeVelocityComponent)
				.category('orb')
				.streamMode(1)
				.mount(ige.$('scene1'));
				
			ige.server.orbs.push(this);
		}

        if (!ige.isServer) {
            this.texture(ige.client.textures.orb);
			self.streamSections(['transform', 'color']);
        }

        this.scaleTo(scale,scale,1);
    },



	streamSectionData: function (sectionId, data) {
		// Check if the section is one that we are handling
		switch(sectionId) {
			case 'color':
				if (data) {
					var s = JSON.parse(data);
					this.color = s[0];
					this.fillColor = s[1];
				}
				else {
					return JSON.stringify([this.color,this.fillColor]);
				}
				break;
			default:
				return IgeEntity.prototype.streamSectionData.call(this, sectionId, data);
				break;
		}
	},




    update: function (ctx) { // was tick
		if (ige.isServer) {
			if(this.exploding) {
				this.explode();
			}
			else {
/*				if(this._translate.x < -250) {
					this.translateTo(250,0,0);
				}
				else if(this._translate.x > 250) {
					this.translateTo(-250,0,0);
				}
				if(this._translate.y < -250) {
					this.translateTo(0,250,0);
				}
				else if(this._translate.y > 250) {
					this.translateTo(0,-250,0);
				}*/
				var radians = this._rotate.z,
				thrustVector = new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower);
				this._box2dBody.ApplyForce(thrustVector, this._box2dBody.GetWorldCenter());

				this._box2dBody.SetAngularVelocity(-0.4);
			}

		}
		if (!ige.isServer) {
			if (this.exploding){
				blastSound.play();
				console.log("exploding orb");
			}
		}
		//IgeEntity.prototype.tick.call(this, ctx);
		IgeEntity.prototype.update.call(this, ctx);
    },
	
	explode: function() {

		/**
		var count = 2;
		if(this.scale / 2 > 0.3) {
			for(var i = 0; i < count; i++) {
				new Orb(this.scale/2)
					.streamMode(1)
					.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * i * this.scale, this._translate.y, 0)
					.rotateTo(0,0,Math.radians((i+1)/count*360));
					//.mount(ige.$('scene1'));
				//var thrustVector = new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower);
				//this._box2dBody.ApplyForce(thrustVector, this._box2dBody.GetWorldCenter());
			}
		}
		else {
			if(Math.random() > 0.9) {
				new Orb(3)
					.streamMode(1)
					.translateTo(this._translate.x, this._translate.y, 0)
					.mount(ige.$('scene1'));
			}
		}
		 **/
		// Don't create a new orb when player created orbs are destroyed
		if (!this.playerOwner) {
			scale = 1 + Math.random();
			var orb3 = new Orb(scale)
				.translateTo(-4200 + (Math.random()) * 8400, -2400 + (Math.random()) * 4800, 0)
				.rotateTo(0, 0, Math.radians(Math.random() * 360));
		}
		var fixed = new FixedOrbz(0.8).translateTo(this._translate.x, this._translate.y, 0);
		//ige.server.score += this.pointWorth;
		//ige.network.send('updateScore', ige.server.score);
        //ige.network.send('updateScore', 0);

		this.destroy();
	},

	destroy: function () {
		if (this.playerOwner) {
			this.playerOwner.removeOrb(this);
		}
		IgeEntityBox2d.prototype.destroy.call(this);
	}
	
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Orb; }