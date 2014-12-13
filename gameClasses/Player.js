var Player = IgeEntityBox2d.extend({
	classId: 'Player',

	init: function (clientId) {
		//IgeEntity.prototype.init.call(this);
		IgeEntityBox2d.prototype.init.call(this);



		var self = this;
        self.clientId = clientId;
        self.score = 0;

        self.lastSoundTime = Date.now();

		this.drawBounds(false);
		
		self._thrustPower = 70;
		self._shootInterval = 100;
		self._lastShoot = ige._timeScaleLastTimestamp;
		self.exploding = false;
		self.color = "white";
		var scale = 0.5;
		
		self.shape = [
			[0,-1],
			[1,1],
			[0,0.5],
			[-1,1],
			[0,-1]
		];
		
		/*self.shape = [
			[-1,-1],
			[-0.5,0],
			[-1,1],
			[0,0.5],
			[1,1],
			[0.5,0],
			[1,-1],
			[0,-0.5]
		];*/

		this.controls = {
			left: false,
			right: false,
			thrust: false,
			down: false,
			shoot: false,
			turn: false,
			turnData: [0,0]
		};

		if (ige.isServer) {
			// Define the polygon for collision
			var triangles,
				fixDefs,
				collisionPoly = new IgePoly2d()
				.addPoint(0, -this._geometry.y * scale)
				.addPoint(this._geometry.x * scale, this._geometry.y * scale)
				.addPoint(-this._geometry.x * scale, this._geometry.y * scale);

			// Scale the polygon by the box2d scale ratio
			collisionPoly.divide(ige.box2d._scaleRatio);

			// Now convert this polygon into an array of triangles
			triangles = collisionPoly.triangulate();
			self.triangles = triangles;

			// Create an array of box2d fixture definitions
			// based on the triangles

			self.fixDefs = [];
			//for (var i = 0; i < self.triangles.length; i++) {
				self.fixDefs.push({
					density: 1.5,
					friction: 1.0,
					restitution: 0.2,
					filter: {
						categoryBits: 0x0004,
						maskBits: 0x0001
					},
					//shape: {
					//	type: 'polygon',
					//	data: self.triangles[i]
					//}
                    shape: {
                    	type: 'circle',
                        //data: {	radius: 10	}
                        data: {	radius: 30	}
                    }
				});
			//}
			// collision definition END

			self.box2dBody({
				type: 'dynamic',
				linearDamping: 1,
				isSensor: true,
				//restitution: 0.0,
				angularDamping: 1,
				allowSleep: true,
				bullet: true,
				fixtures: self.fixDefs,
				fixedRotation: false
			});

            // Add a sensor to the fixtures so we can detect
            // when the ship is near a fixedorb


            self.fixDefs.push({
                density: 0.0,
                friction: 0.0,
                restitution: 0.0,
                isSensor: true,
                filter: {
                    categoryBits: 0x0100,
                    maskBits: 0xffff
                },
                shape: {
                    type: 'circle',
                    data: {
                        radius: 400
                    }
                }
            });



			
			self.addComponent(IgeVelocityComponent)
				.category('ship');
				
		}

		if (!ige.isServer) {
			self.texture(ige.client.textures.ship);

            self.nametag = self.id().substr(0,3);
            self.scoretag = self.score.toString();

            self.nametagfont = new IgeFontEntity()
				.texture(ige.client.textures.fontid)
				.width(500)
				.colorOverlay('#ff6000')
				.height(500)
				.text(self.nametag)
				.textAlignX(1)
				.top(-100)
				.mount(self);
		}
		
		self.streamSections(['transform', 'mount', 'color', 'shape']);
		self.scaleTo(scale,scale,1);

	},

    carryOrb: function (fixedorbred, contact) {
        if (!this._oldfixedorbred || (this._oldfixedorbred !== fixedorbred)) {
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

            this._carryingfixedorbred = true;
            this._fixedorbred = fixedorbred;

            //fixedorbred.originalStart(fixedorbred._translate);
        }
    },

    dropOrb: function () {
        if (this._carryingfixedorbred) {
            ige.box2d._world.DestroyJoint(this._orbRope);

            //this._oldfixedorbred = this._fixedorbred;
            this._dropTime = ige._currentTime;

            delete this._orbRope;
            //delete this._fixedorbred;

            this._carryingfixedorbred = false;
        }
    },


	shoot: function(clientId) {
		if(ige.isServer) { // server
            this.dropOrb();
			if(ige._timeScaleLastTimestamp - this._lastShoot > this._shootInterval) {
				var b2vel = this._box2dBody.GetLinearVelocity();
				//var velocity = (Math.abs(b2vel.x) + Math.abs(b2vel.y)) / 2 / 3 / this._thrustPower;
                var velocity = (Math.abs(b2vel.x) + Math.abs(b2vel.y))// / 2 / 3 / this._thrustPower;
                if (this._fixedorbred) {
                    this._fixedorbred.velocity.byAngleAndPower(this._rotate.z - Math.radians(90), 0.2 + velocity * 0.012)
                }
                var bullet = new Bullet()
					.streamMode(1)
					.addComponent(IgeVelocityComponent)
					.velocity.byAngleAndPower(this._rotate.z-Math.radians(90), 0.1+velocity*0.012)
					.translateTo(this._translate.x, this._translate.y, 0)
					.mount(ige.server.scene1);
				bullet.sourceClient = clientId;
				this._lastShoot = ige._timeScaleLastTimestamp;
			}
		}
	},
	
	explode: function() {
		this.exploding = false;
		if(ige.isServer) {
            //console.log(this._orbRope)
            //ige.box2d._world.DestroyJoint(this._orbRope);
            //console.log(this);
            //this._oldOrb = this._orb;
            //this._dropTime = ige._currentTime;

            //delete this._orbRope;
            //delete this._orb;

            //this._carryingplanetoid = false;
			this.unMount();
			this._box2dBody.SetAwake(false);
			this._box2dBody.SetActive(false);
			this.respawn();
		}
		else {
			this._alive = false;
			thrustSound.stop();
		}
	},
	
	respawn: function() {
		if(ige.isServer) {
			var self = this;
			setTimeout(function() {
				self.rotateTo(0, 0, 0)
					.translateTo(0, 0, 0)
					.mount(ige.server.scene1);
				self._box2dBody.SetAngularVelocity(0);
				self._box2dBody.SetLinearVelocity(new IgePoint(0, 0, 0));
				self._box2dBody.SetActive(true);
			}, 2000);
		}
	},

	/**
	 * Override the default IgeEntity class streamSectionData() method
	 * so that we can check for the custom1 section and handle how we deal
	 * with it.
	 * @param {String} sectionId A string identifying the section to
	 * handle data get / set for.
	 * @param {*=} data If present, this is the data that has been sent
	 * from the server to the client for this entity.
	 * @return {*}
	 */
	streamSectionData: function (sectionId, data) {
		// Check if the section is one that we are handling
		switch(sectionId) {
			case 'color':
				if (data) {
					this.color = data;
				}
				else {
					return this.color;
				}
				break;
			case 'shape':
				if (data) {
					this.shape = JSON.parse(data);
				}
				else {
					return JSON.stringify(this.shape);
				}
				break;
			default:
				return IgeEntity.prototype.streamSectionData.call(this, sectionId, data);
				break;
		}
	},



	/**
	 * Called every frame by the engine when this entity is mounted to the
	 * scenegraph.
	 * @param ctx The canvas context to render to.
	 */
	tick: function (ctx) {
		if(this.exploding) {
			this.explode();
		}
		else if(this._alive) {
			myx1 = this._translate.x;
			myy1 = this._translate.y;
			myrot1 = this._rotate.z;
			
			/* CEXCLUDE */
			if (ige.isServer) {
				if (this.controls.left) {
					this.rotateBy(0, 0, Math.radians(-0.15 * ige._tickDelta));
					//var radians = Math.radians(180);
					//this._box2dBody.ApplyForce(new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower), this._box2dBody.GetWorldCenter());
				}

				if (this.controls.right) {
					this.rotateBy(0, 0, Math.radians(0.15 * ige._tickDelta));
					//var radians = Math.radians(0);
					//this._box2dBody.ApplyForce(new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower), this._box2dBody.GetWorldCenter());
				}

				if (this.controls.thrust) {
					var radians = this._rotate.z + Math.radians(-90),
					thrustVector = new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower);
					this._box2dBody.ApplyForce(thrustVector, this._box2dBody.GetWorldCenter());
					//var radians = Math.radians(270);
					//this._box2dBody.ApplyForce(new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower), this._box2dBody.GetWorldCenter());
				}

				if (this.controls.down) {
					//var radians = Math.radians(90);
					//this._box2dBody.ApplyForce(new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower), this._box2dBody.GetWorldCenter());
				}
				
				if (this.controls.turn) {
					var thisRot = this._rotate.z % Math.PI;
					var rad = Math.atan2(this.controls.turnData[0], this.controls.turnData[1]);
					this.rotateTo(0, 0, rad);
					//this.rotateToPoint(ige._currentViewport.mousePos());
				}
				
				if (this.controls.shoot) {
					this.shoot();
				}
			} // isServer
			/* CEXCLUDE */

			if (!ige.isServer) {

				if (self._carryingOrb) {
					//ctx.save();
					//ctx.rotate(-self._rotate.z);
					//ctx.strokeStyle = '#a6fff6';
					//ctx.beginPath();
					//ctx.moveTo(0, 0);
					//ctx.lineTo(self._fixedorb._translate.x - self._translate.x, self._fixedorb._translate.y - self._translate.y);
					//ctx.stroke();
					//ctx.restore();
				}
			/*
				ige.input.on('mouseDown', function(event, mouseX, mouseY, which) {
					if (which == 1 && mouseY<-200) {
						//the left mouse button was clicked or a touch happened
						ige.network.send('playerControlThrustDown');
						ige.network.send('playerShoot');
					}
				});

				ige.input.on('mouseDown', function(event, mouseX, mouseY, which) {
					if (mouseX < 150 && mouseY > -200) {
						//the left mouse button was clicked or a touch happened
						ige.network.send('playerControlLeftDown');
					}
				});

				ige.input.on('mouseUp', function(event, mouseX, mouseY, which) {
					if (mouseX < 150 && mouseY > -200) {
						//the left mouse button was clicked or a touch happened
						ige.network.send('playerControlLeftUp');
					}
				});

				ige.input.on('mouseDown', function(event, mouseX, mouseY, which) {
					if (mouseX > 150 && mouseY > -200) {
						//the left mouse button was clicked or a touch happened
						ige.network.send('playerControlRightDown');
					}
				});

				ige.input.on('mouseUp', function(event, mouseX, mouseY, which) {
					if (mouseX > 150 && mouseY > -200) {
						//the left mouse button was clicked or a touch happened
						ige.network.send('playerControlRightUp');
					}
				});



				ige.input.on('mouseUp', function(event, mouseX, mouseY, which) {
					if (which == 1) {
						//the left mouse button was clicked or a touch happened
						ige.network.send('playerControlThrustUp');
					}
				});
				*/



				if (ige.input.actionState('left')) { // if left key down
					if (!this.controls.left) { // left wasn't already down
						this.controls.left = true;
						ige.network.send('playerControlLeftDown');
					}
				} else {
					if (this.controls.left) {
						this.controls.left = false;
						ige.network.send('playerControlLeftUp');
					}
				}

				if (ige.input.actionState('right')) {
					if (!this.controls.right) {
						this.controls.right = true;
						ige.network.send('playerControlRightDown');
					}
				} else {
					if (this.controls.right) {
						this.controls.right = false;
						ige.network.send('playerControlRightUp');
					}
				}

				if (ige.input.actionState('thrust')) {
					if (!this.controls.thrust) {
						this.controls.thrust = true;
						ige.network.send('playerControlThrustDown');
						thrustSound.play();
					}
				} else {
					if (this.controls.thrust) {
						this.controls.thrust = false;
						ige.network.send('playerControlThrustUp');
						thrustSound.stop();
					}
				}

				if (ige.input.actionState('down')) {
					if (!this.controls.down) {
						this.controls.down = true;
						ige.network.send('playerControlDownDown');
					}
				} else {
					if (this.controls.down) {
						this.controls.down = false;
						ige.network.send('playerControlDownUp');
					}
				}

				if (ige.input.actionState('shoot')) {
					if (!this.controls.shoot) {
                        laserSound.stop('laser');
						this.controls.shoot = true;
						ige.network.send('playerControlShootDown');
                        //var now = Date.now();
                        //var elapsed = now - self.lastSoundTime;
                        //console.log(elapsed);
                        //if (elapsed < 50) {
                        //    return;
                        //}

                        //self.lastSoundTime = now;

					}
				} else {
					if (this.controls.shoot) {
                        laserSound.play('laser');
;						this.controls.shoot = false;
						ige.network.send('playerControlShootUp');
					}
				}
			} // !isServer
		} // !exploding

		// Call the IgeEntity (super-class) tick() method
		IgeEntity.prototype.tick.call(this, ctx);
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Player; }