var Player = IgeEntityBox2d.extend({
	classId: 'Player',

	init: function (clientId) {
		//IgeEntity.prototype.init.call(this);
		IgeEntityBox2d.prototype.init.call(this);



		var self = this;
        self.clientId = clientId;
        self.score = 0;

		this.drawBounds(false);
		
		self._thrustPower = 8;
		self._shootInterval = 100;
		self._lastShoot = ige._timeScaleLastTimestamp;
		self.exploding = false;
		self.color = "white";
		var scale = 0.3;
		
		self.shape = [
			[0,-1],
			[1,1],
			[0,0.5],
			[-1,1],
			[0,-1]
		];

		this.controls = {
			left: false,
			right: false,
			thrust: false,
			shoot: false
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
					density: 1,
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
                        data: {	radius: 10	}
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
		
		self.streamSections(['transform', 'color', 'shape']);
		self.scaleTo(scale,scale,1);

	},
	
	shoot: function(clientId) {
		if(ige.isServer) { // server
			if(ige._timeScaleLastTimestamp - this._lastShoot > this._shootInterval) {
				var b2vel = this._box2dBody.GetLinearVelocity();
				var velocity = (Math.abs(b2vel.x) + Math.abs(b2vel.y)) / 2 / 3 / this._thrustPower;
				var bullet = new Bullet()
					.streamMode(1)
					.addComponent(IgeVelocityComponent)
					.velocity.byAngleAndPower(this._rotate.z-Math.radians(90), 0.07 + velocity)
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
			console.log("moving");
			myx1 = this._translate.x;
			myy1 = this._translate.y;
			myrot1 = this._rotate.z;
			
			/* CEXCLUDE */
			if (ige.isServer) {
				if (this.controls.left) {
					this.rotateBy(0, 0, Math.radians(-0.15 * ige._tickDelta));
				}

				if (this.controls.right) {
					this.rotateBy(0, 0, Math.radians(0.15 * ige._tickDelta));
				}

				if (this.controls.thrust) {
					var radians = this._rotate.z + Math.radians(-90),
					thrustVector = new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower);
					this._box2dBody.ApplyForce(thrustVector, this._box2dBody.GetWorldCenter());
				}
				
				if (this.controls.shoot) {
					this.shoot();
				}
			} // isServer
			/* CEXCLUDE */

			if (!ige.isServer) {
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

				if (ige.input.actionState('shoot')) {
					if (!this.controls.shoot) {
						this.controls.shoot = true;
						ige.network.send('playerControlShootDown');
					}
				} else {
					if (this.controls.shoot) {
						this.controls.shoot = false;
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