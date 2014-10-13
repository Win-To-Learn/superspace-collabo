var Player = IgeEntityBox2d.extend({
	classId: 'Player',

	init: function (clientID) {
		//IgeEntity.prototype.init.call(this);
		IgeEntityBox2d.prototype.init.call(this);



		var self = this;
        self.clientID = clientID;
        self.score = 0;

        self.lastSoundTime = Date.now();

		this.drawBounds(false);
		
		self._thrustPower = 60;
		self._shootInterval = 100;
		self._lastShoot = ige._timeScaleLastTimestamp;
		var scale = 0.3;

		// Rotate to point upwards
		this.controls = {
			left: false,
			right: false,
			thrust: false
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
			fixDefs = [];

			//for (var i = 0; i < self.triangles.length; i++) {
				fixDefs.push({
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
				fixtures: fixDefs,
				fixedRotation: false
			});

            // Add a sensor to the fixtures so we can detect
            // when the ship is near a fixedorb


            fixDefs.push({
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
			self.texture(ige.client.textures.ship2);

            //self.nametag =  ige.data('player')._id;
            self.nametag = self.id().substr(0,3);

            self.scoretag = self.score.toString();

            //console.log(self._id);
            //console.log(ige.data('player'));
            //console.log(self.nametag);



            self.nametagfont = new IgeFontEntity()
				.texture(ige.client.textures.fontid)
				.width(500)
				.colorOverlay('#ff6000')
				.height(500)
				.text(self.nametag)
				//.left(250)
				.textAlignX(1)
				.top(-100)
				//.right(250)
				.mount(self);


            /*self.scoretagfont = new IgeFontEntity()

				.texture(ige.client.textures.fontid)
				.width(500)
				.colorOverlay('#ff6000')
				.height(500)
				.text(self.nametag)
				//.left(250)
				.textAlignX(1)
				.top(0)
				//.right(250)
				.mount(self);
            */





		}
		
		self.streamSections(['transform', 'color', 'texture']);
		self.scaleTo(scale,scale,1);
		self.color = "white";

	},

    carryOrb: function (fixedorb, contact) {
        if (!this._oldOrb || (this._oldOrb !== fixedorb)) {
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
            this._fixedorb = fixedorb;

            fixedorb.originalStart(fixedorb._translate);
        }
    },


	shoot: function(clientId) {
		if(ige.isServer) {
			if(ige._timeScaleLastTimestamp - this._lastShoot > this._shootInterval) {
				var b2vel = this._box2dBody.GetLinearVelocity();
				//var velocity = (Math.abs(b2vel.x) + Math.abs(b2vel.y)) / 2 / 3 / this._thrustPower;
                var velocity = (Math.abs(b2vel.x) + Math.abs(b2vel.y))// / 2 / 3 / this._thrustPower;

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
		if (sectionId === 'score') {
			// Check if the server sent us data, if not we are supposed
			// to return the data instead of set it
			if (data) {
				// We have been given new data!
				this._score = data;
			} else {
				// Return current data
				return this._score;
			}
		} else if (sectionId === 'color') {
            // Check if the server sent us data, if not we are supposed
            // to return the data instead of set it
            if (data) {
                // We have been given new data!
                this.color = data;
            } else {
                // Return current data
                return this.color;
            }
        } else if (sectionId === 'texture') {
            // Check if the server sent us data, if not we are supposed
            // to return the data instead of set it
            if (data) {
                // We have been given new data!
                this.texture = data;
            } else {
                // Return current data
                return this.texture;
            }
        }
		else if (sectionId === "custom1") {
			console.log(data);
		} else {
			// The section was not one that we handle here, so pass this
			// to the super-class streamSectionData() method - it handles
			// the "transform" section by itself
			return IgeEntity.prototype.streamSectionData.call(this, sectionId, data);
		}
	},



	/**
	 * Called every frame by the engine when this entity is mounted to the
	 * scenegraph.
	 * @param ctx The canvas context to render to.
	 */
	tick: function (ctx) {
        myx1 = this._translate.x;
        myy1 = this._translate.y;
		//this._texture.script.color = ige.client.floatToRgb(Math.random());
        //myrot1 = this.worldRotationZ();
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
				this._box2dBody.SetAwake(true);
                //createjs.Sound.play("thrust", createjs.Sound.INTERUPT_LATE);
			}
		}
		/* CEXCLUDE */

		if (!ige.isServer) {

            if (self._carryingOrb) {
                ctx.save();
                ctx.rotate(-self._rotate.z);
                ctx.strokeStyle = '#a6fff6';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(self._fixedorb._translate.x - self._translate.x, self._fixedorb._translate.y - self._translate.y);
                ctx.stroke();
                ctx.restore();
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



			if (ige.input.actionState('left')) {
				if (!this.controls.left) {
					// Record the new state
					this.controls.left = true;

					// Tell the server about our control change
					ige.network.send('playerControlLeftDown');
				}
			} else {
				if (this.controls.left) {
					// Record the new state
					this.controls.left = false;

					// Tell the server about our control change
					ige.network.send('playerControlLeftUp');
				}
			}

			if (ige.input.actionState('right')) {
				if (!this.controls.right) {
					// Record the new state
					this.controls.right = true;

					// Tell the server about our control change
					ige.network.send('playerControlRightDown');
				}
			} else {
				if (this.controls.right) {
					// Record the new state
					this.controls.right = false;

					// Tell the server about our control change
					ige.network.send('playerControlRightUp');
				}
			}

			if (ige.input.actionState('thrust')) {
				if (!this.controls.thrust) {
					// Record the new state
					this.controls.thrust = true;

					// Tell the server about our control change
					ige.network.send('playerControlThrustDown');
				}
			} else {
				if (this.controls.thrust) {
					// Record the new state
					this.controls.thrust = false;

					// Tell the server about our control change
					ige.network.send('playerControlThrustUp');
				}

			}

            if(this.controls.thrust) {
                //console.log(thrustSound);
                thrustSound.play();
            }
			
			if (ige.input.actionState('shoot')) {
				ige.network.send('playerShoot');
                //setTimeout(function() { 
                var now = Date.now();
                var elapsed = now - self.lastSoundTime;
                //console.log(elapsed);
                if (elapsed < 50) {
                    return;
                }

                self.lastSoundTime = now;
                laserSound.play('laser');

                //}, 400);
			}
		}

		// Call the IgeEntity (super-class) tick() method
		IgeEntity.prototype.tick.call(this, ctx);
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Player; }