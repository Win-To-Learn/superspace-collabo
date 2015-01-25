//var Orb = IgeEntityBox2d.extend({
var Planetoid = IgeEntityBox2d.extend({

    classId: 'Planetoid',
	
    init: function (scale) {
		IgeEntityBox2d.prototype.init.call(this);
		
		var self = this;

        // Set the rectangle colour (this is read in the Rectangle.js smart texture)
        self.color = 'rgb(255,255,0)';
		self.fillColor = 'rgba(255,255,0,0.25)';
		self.touched = false;
        self.leftgoal = false;
        self.isgoal = false;

		self.isHydraHead = false;
		
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
					density: 0.4,
					friction: 1.0,
					restitution: 0.5,
					filter: {
						categoryBits: 0x00ff,
						maskBits: 0xffff //& ~0x0008
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
                //SetFixedRotation: true,
				//type: 'dynamic',
				//linearDamping: 2,
				//angularDamping: 2,
				//allowSleep: true,
				//fixtures: fixDefs,

                //active: false,
                //gravityScale: 0.0
                type: 'dynamic',
                linearDamping: 0.1,
                angularDamping: 0.1,
                bullet: true,
                isSensor: true,
                allowSleep: true,
                fixtures: fixDefs,
                fixedRotation: true

			});
			
			
			self.addComponent(IgeVelocityComponent)
				.category('planetoid')
				.streamMode(1)
				.mount(ige.server.scene1);
				
			ige.server.planetoids.push(this);
			
		}

        if (!ige.isServer) {
            this.texture(ige.client.textures.planetoid);
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
			else if(!this.touched) {
				this._box2dBody.SetAngularVelocity(-0.4);
			}

			if (this.isHydraHead == true) {
				var b2vel = this._box2dBody.GetLinearVelocity();
				var shipVelX = b2vel.x;
				var shipVelY = b2vel.y;
				var shipAngle;


				var velocity = Math.sqrt(Math.pow(shipVelX,2) + Math.pow(shipVelY,2));
				//console.log(velocity);


				shipAngle = Math.atan2(shipVelX,-shipVelY);


				//console.log(shipAngle);



				if (this._translate.x > 4200) {
					this.translateTo(this._translate.x - 400, this._translate.y, 0);
					this.velocity.byAngleAndPower(shipAngle +Math.PI/2, velocity * 0.017)
				}
				if (this._translate.x < -4200) {
					this.translateTo(this._translate.x + 400, this._translate.y, 0);
					this.velocity.byAngleAndPower(shipAngle +Math.PI/2, 0.15 + velocity * 0.017)
				}
				if (this._translate.y < -2400) {
					this.translateTo(this._translate.x, this._translate.y + 400, 0);
					this.velocity.byAngleAndPower(shipAngle +Math.PI/2, 0.15 + velocity * 0.017)
				}
				if (this._translate.y > 2400) {
					this.translateTo(this._translate.x, this._translate.y - 400, 0);
					this.velocity.byAngleAndPower(shipAngle +Math.PI/2, 0.15 + velocity * 0.017)
				}

			}



		}
		IgeEntity.prototype.tick.call(this, ctx);
    },

    originalStart: function (translate) {
        this._originalStart = translate.clone();
    },

    carryOrb: function (planetoid, contact) {
        if (!this._oldplanetoid || (this._oldplanetoid !== planetoid)) {
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

            this._carryingPlanetoid = true;
            this._planetoid = planetoid;

            planetoid.originalStart(planetoid._translate);
        }
    },
	
	explode: function() {
		this.exploding = false;
		this.touched = true;
		//this.fillColor = 'rgba(0,255,255,0.35)';
		//this.color = 'rgb(0,255,255)';
		//ige.server.score += this.pointWorth;
		//ige.network.send('updateScore', ige.server.score);
	}
	
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Planetoid; }
