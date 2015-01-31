var Player = IgeEntityBox2d.extend({
	classId: 'Player',

	init: function (clientId) {
		//IgeEntity.prototype.init.call(this);
		IgeEntityBox2d.prototype.init.call(this);



		var self = this;
        self.clientId = clientId;
        self.score = 0;
		self.gotPickup = false;

        self.lastSoundTime = Date.now();

		this.drawBounds(false);
		
		self._thrustPower = 550;
		self._shootInterval = 100;
		self._lastShoot = ige._timeScaleLastTimestamp;
		self.exploding = false;
		self.color = "white";

		self.score = 0;
		self.orbsCollected = 0;

		self.bulletSpread = 0;
		self.bulletCount = 1;

		var scale = 1.0;
		
		/*self.shape = [
			[0,-1],
			[1,1],
			[0,0.5],
			[-1,1],
			[0,-1]
		];*/
		
		self.shape = [
			[-1,-1],
			[-0.5,0],
			[-1,1],
			[0,0.5],
			[1,1],
			[0.5,0],
			[1,-1],
			[0,-0.5]
		];

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
						maskBits: 0x0016 & 0x00ff
						//maskBits: 0xffff
					},
					//shape: {
					//	type: 'polygon',
					//	data: self.triangles[i]
					//}
                    shape: {
                    	type: 'circle',
                        //data: {	radius: 10	}
                        data: {	radius: 70	}
                    }
				});
			//}
			// collision definition END

			self.box2dBody({
				type: 'dynamic',
				linearDamping: 1,
				isSensor: true,
				//restitution: 0.0,
				angularDamping: 10,
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
                    categoryBits: 0x0010,
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


			self.thrustEmitter = new IgeParticleEmitter()
				// Set the particle entity to generate for each particle
				.particle(ThrustParticle)
				// Set particle life to 300ms
				.lifeBase(400)
				// Set output to 60 particles a second (1000ms)
				.quantityBase(60)
				.quantityTimespan(1500)
				// Set the particle's death opacity to zero so it fades out as it's lifespan runs out
				.deathOpacityBase(0)
				// Set velocity vector to y = 0.05, with variance values
				.velocityVector(new IgePoint(0, 0.05, 0), new IgePoint(-0.04, 0.05, 0), new IgePoint(0.04, 0.15, 0))
				// Mount new particles to the object scene
				//.particleMountTarget(ige.client.objectScene)
				.particleMountTarget(ige.client.scene1)
				// Move the particle emitter to the bottom of the ship
				.translateTo(0, 5, 0)
				// Mount the emitter to the ship
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
                //var velocity = (Math.abs(b2vel.x) + Math.abs(b2vel.y))// / 2 / 3 / this._thrustPower;
				var shipVelX = b2vel.x;
				var shipVelY = b2vel.y;
				var shipAngle;

				var velocity = Math.sqrt(Math.pow(shipVelX,2) + Math.pow(shipVelY,2));

				shipAngle = Math.atan2(shipVelX,-shipVelY);
                if (this._fixedorbred) {
                    //this._fixedorbred.velocity.byAngleAndPower(this._rotate.z - Math.radians(90), 0.2 + velocity * 0.012)
					this._fixedorbred.velocity.byAngleAndPower(shipAngle -Math.PI/2, 0.15 + velocity * 0.017)

				}

				var steps = this.bulletCount - 1;
				var bulletSpreadRad = steps ? this.bulletSpread * Math.PI / 180 : 0;
				var deltaA = steps ? bulletSpreadRad / steps : 0;
				for (var i = 0, a = -bulletSpreadRad / 2; i <= steps; i++, a += deltaA) {
					var bullet = new Bullet()
						.streamMode(1)
						.addComponent(IgeVelocityComponent)
						//.velocity.byAngleAndPower(this._rotate.z-Math.radians(90), 0.1+velocity*0.012)
						.velocity.byAngleAndPower(shipAngle -Math.PI/2 + a, 0.14+velocity*0.017)
						.translateTo(this._translate.x, this._translate.y, 0)
						.mount(ige.server.scene1);
					bullet.source = this;
				}
                //var bullet = new Bullet()
				//	.streamMode(1)
				//	.addComponent(IgeVelocityComponent)
				//	//.velocity.byAngleAndPower(this._rotate.z-Math.radians(90), 0.1+velocity*0.012)
				//	.velocity.byAngleAndPower(shipAngle -Math.PI/2, 0.14+velocity*0.017)
                //
				//	.translateTo(this._translate.x, this._translate.y, 0)
				//	.mount(ige.server.scene1);
				//bullet.sourceClient = clientId;
				this._lastShoot = ige._timeScaleLastTimestamp;
			}
		}
	},

	changePickupScore: function(){
		this.score++;
		this.gotPickup = false;
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

	carryShip: function (ship, contact) {
		if (!this._oldship || (this._oldship !== ship)) {
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

			this._carryingShip = true;
			this._ship = ship;

			//ship.originalStart(ship._translate);
		}
	},




	respawn: function() {
		if(ige.isServer) {
			var self = this;
			setTimeout(function() {
				self.rotateTo(0, 0, 0)
					.translateTo(-1000+Math.random()*2000,-1000+Math.random()*2000,0)
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
		//console.log('Player tick', this.clientId);
		if(this.gotPickup) {
			this.changePickupScore();
		}

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
					//this.rotateBy(0, 0, Math.radians(-0.15 * ige._tickDelta));
					var radians = Math.radians(180);
					this._box2dBody.ApplyForce(new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower), this._box2dBody.GetWorldCenter());
				}

				if (this.controls.right) {
					//this.rotateBy(0, 0, Math.radians(0.15 * ige._tickDelta));
					var radians = Math.radians(0);
					this._box2dBody.ApplyForce(new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower), this._box2dBody.GetWorldCenter());
				}

				if (this.controls.thrust) {
					//var radians = this._rotate.z + Math.radians(-90),
					//thrustVector = new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower);
					//this._box2dBody.ApplyForce(thrustVector, this._box2dBody.GetWorldCenter());

					var radians = Math.radians(270);
					this._box2dBody.ApplyForce(new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower), this._box2dBody.GetWorldCenter());
				}


				if (this.controls.down) {
					var radians = Math.radians(90);
					this._box2dBody.ApplyForce(new ige.box2d.b2Vec2(Math.cos(radians) * this._thrustPower, Math.sin(radians) * this._thrustPower), this._box2dBody.GetWorldCenter());
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

				/*if (this._translate.x > 2100 || this._translate.x < -2100 || this._translate.y>1200 || this._translate.y<-1200) {
					//this.respawn();
					this.translateTo(-2100+Math.random()*4200,-1200+Math.random()*2400,0)
				}*/
				if (this._translate.x > 4200){
					this.translateTo(this._translate.x-200,this._translate.y,0);
				}
				if (this._translate.x < -4200){
					this.translateTo(this._translate.x+200,this._translate.y,0);
				}
				if (this._translate.y < -2400){
					this.translateTo(this._translate.x,this._translate.y+200,0);
				}
				if (this._translate.y > 2400){
					this.translateTo(this._translate.x,this._translate.y-200,0);
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
						thrustSound.play();
						this.thrustEmitter.start();
						console.log("emitter started");
						ige.network.send('playerControlLeftDown');
					}
				} else {
					if (this.controls.left) {
						this.controls.left = false;
						thrustSound.stop();
						this.thrustEmitter.stop();
						ige.network.send('playerControlLeftUp');
					}
				}

				if (ige.input.actionState('right')) {
					if (!this.controls.right) {
						this.controls.right = true;
						thrustSound.play();
						this.thrustEmitter.start();
						ige.network.send('playerControlRightDown');
					}
				} else {
					if (this.controls.right) {
						this.controls.right = false;
						thrustSound.stop();
						this.thrustEmitter.stop();
						ige.network.send('playerControlRightUp');
					}
				}

				if (ige.input.actionState('thrust')) {
					if (!this.controls.thrust) {
						this.controls.thrust = true;
						ige.network.send('playerControlThrustDown');
						thrustSound.play();
						this.thrustEmitter.start();
					}
				} else {
					if (this.controls.thrust) {
						this.controls.thrust = false;
						ige.network.send('playerControlThrustUp');
						thrustSound.stop();
						this.thrustEmitter.stop();
					}
				}

				if (ige.input.actionState('down')) {
					if (!this.controls.down) {
						this.controls.down = true;
						thrustSound.play();
						this.thrustEmitter.start();
						ige.network.send('playerControlDownDown');
					}
				} else {
					if (this.controls.down) {
						this.controls.down = false;
						thrustSound.stop();
						this.thrustEmitter.stop();
						ige.network.send('playerControlDownUp');
					}
				}

				if (ige.input.actionState('shoot')) {
					if (!this.controls.shoot) {
						this.controls.shoot = true;
						laserSound.play();
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
						this.controls.shoot = false;
						laserSound.stop();
						ige.network.send('playerControlShootUp');
					}
				}
			} // !isServer
		} // !exploding

		// Call the IgeEntity (super-class) tick() method
		IgeEntity.prototype.tick.call(this, ctx);
	},

	onContact: function (other, contact) {
		switch (other.category()) {
			case 'planetoid':
				this.score = this.score + 1;
				this.gotPickup = true;
				other.exploding = true;

				for (var i in ige.server.players) {
					ige.server.tempScores.push(
						{'id' : ige.server.players[i].id(), 'score' : ige.server.players[i].score}
					);
				}
				//ige.network.send('updateTouchScore', tempScores);
				console.log('contact with planetoid and ship');
				ige.network.send('updateScore', this.score, this.clientId);
				return true;
			case 'fixedorbred':
				if (ige.server.score > 100){
					other.growingTree = true;
				}
				return true;
			case 'ship':
				//ige.network.send('updateTouchScore', tempScores);
				console.log('contact with ship and ship');
				//B.carryShip(contact.igeEntityByCategory('ship'), contact);
				this.shape = [

					[1,0],
					[1,-1],
					[0,-1],
					[-1,0],
					[-1,1],
					[0,1]
				];
				other.shape = [

					[1,0],
					[1,-1],
					[0,-1],
					[-1,0],
					[-1,1],
					[0,1]
				];
				return true;
			case 'orb':
				this.exploding = true;
				other.exploding = true;
				//ige.network.send('scored', '+'+A.pointWorth+' points!', B.sourceClient);
				this.score += other.pointWorth;
				ige.network.send('scored', '+' + other.pointWorth + ' points!', this.clientId);
				ige.network.send('updateScore', this.score, this.clientId);
				console.log("contact with asteroid and ship");
				return true;
			case 'fixedorbz':
				console.log('contact with fixed orbz and ship');
				if (this.orbsCollected++ === 3) {
					ige.network.send('code', {label: 'Weapon Upgrade', code: 'player.upgradeFiringArc();'},
						this.sourceClient);
				}
				other.destroy();
				return true;
			default:
				return false;
		}
	},

	upgradeFiringArc: function () {
		this.bulletSpread = 40;
		this.bulletCount = 3;
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Player; }