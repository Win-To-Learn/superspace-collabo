//var Orb = IgeEntityBox2d.extend({
var FixedOrbRed = IgeEntityBox2d.extend({

    classId: 'FixedOrbRed',
	
    init: function (scale) {
		IgeEntityBox2d.prototype.init.call(this);
		
		var self = this;

        //self.touched = false;

        // Set the rectangle colour (this is read in the Rectangle.js smart texture)
        //this._rectColor = '#ffc600';
		self.color = 'rgb(255,0,0)';
		self.fillColor = 'rgba(0,255,0,0.25)';


		
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
					friction: 0.2,
					restitution: 2.5,
					filter: {
						//categoryBits: 0x00ff,
						//categoryBits: 0x0008,
						//maskBits: 0xffff //& ~0x0008
						//categoryBits: 0x0016,
						//maskBits: 0xffff & ~0x0008
					},
					shape: {
						type: 'polygon',
						data: self.triangles[i]
					}
				});
			}
			// collision definition END

		
			self._thrustPower = 0.01*scale;

			self.box2dBody({
                //isSensor: true,
				type: 'dynamic',
				linearDamping: 0.5,
				angularDamping: 0,
				allowSleep: true,
				fixtures: fixDefs,
				fixedRotation: false,
                gravityScale: 0.0
			});
			
			
			self.addComponent(IgeVelocityComponent)
				.category('fixedorbred')
				.streamMode(1)
				//.mount(ige.$('scene1'));
				.mount(ige.server.scene1);

				
			ige.server.fixedorbreds.push(this);
			
		}

        if (!ige.isServer) {
            this.texture(ige.client.textures.fixedorbred);
        }

        this.scaleTo(scale,scale,1);
		self.streamSections(['transform', 'color']);
		
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




    tick: function (ctx) {
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
		IgeEntity.prototype.tick.call(this, ctx);
    },

    originalStart: function (translate) {
        this._originalStart = translate.clone();
    },

    carryOrb: function (fixedorbred, contact) {
        if (!this._oldOrb || (this._oldOrb !== fixedorbred)) {
            var distanceJointDef = new ige.box2d.b2DistanceJointDef(),
                bodyA = contact.m_fixtureA.m_body,
                bodyB = contact.m_fixtureB.m_body;

            distanceJointDef.Initialize(
                bodyA,
                bodyB,
                bodyA.GetWorldCenter(),
                bodyB.GetWorldCenter()
            );

            this._orbRope = ige.box2d._world.CreateJoint(distanceJointDef);

            this._carryingOrb = true;
            this._fixedorbred = fixedorbred;

            fixedorbred.originalStart(fixedorbred._translate);
        }
    },


	
	explode: function() {
		//var count = 2;
		//if(this.scale / 2 > 0.3) {
			//for(var i = 0; i < count; i++) {

				new FixedOrbz(this.scale)
					.streamMode(1)
					//.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
                    .translateTo(this._translate.x, this._translate.y, 0)
					.rotateTo(0,0,this._rotate.z);
					//.mount(ige.$('scene1'));
				//var thrustVector = new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower);
				//this._box2dBody.ApplyForce(thrustVector, this._box2dBody.GetWorldCenter());
			//}
		//}
		/*else {
			if(Math.random() > 0.9) {
				new Orb(3)
					.streamMode(1)
					.translateTo(this._translate.x, this._translate.y, 0)
					.mount(ige.$('scene1'));
			}
		}*/
		ige.server.score += this.pointWorth;
		ige.network.send('updateScore', ige.server.score);
		this.destroy();
        delete ige.server.fixedorbreds[ige.server.fixedorbreds.indexOf(this)];
        //console.log(ige.server.fixedorbs.length);
        //console.log(fixedorbs);
	}
	
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = FixedOrbRed; }