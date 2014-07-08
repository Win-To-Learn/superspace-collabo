//Start the server with node ./server/ige -g ../superspace-collabo

var Client = IgeClass.extend({
	classId: 'Client',

	init: function () {
		//ige.timeScale(0.1);
		//ige.showStats(1);

		// Load our textures
		var self = this;

		// Enable networking
		ige.addComponent(IgeNetIoComponent);

		// Implement our game methods
		this.implement(ClientNetworkEvents);

		// Create the HTML canvas
		ige.createFrontBuffer(true);

		// Load the textures we want to use
		this.textures = {
			ship: new IgeTexture('./assets/PlayerTexture.js'),
            orb: new IgeTexture('./assets/OrbTexture.js'),
            bullet: new IgeTexture('./assets/BulletTexture.js'),
            stars: new IgeTexture('./assets/stars2.png'),
            boundary: new IgeTexture('./assets/BoundaryTexture.js'),
            font: new IgeFontSheet('./assets/agency_fb_20pt.png', 3)

    };



        var tex = new IgeTexture('./assets/OrbTexture.js');
        //this.textures.orb = new IgeTexture('./assets/OrbTexture.js');
        //ige.addComponent(IgeBox2dComponent)
        //    .box2d.sleep(true)
        //    .box2d.gravity(0, 1)
        //    .box2d.createWorld()
        //    .box2d.mode(0)
        //    .box2d.start();
        ige.addComponent(IgeBox2dComponent)
            .box2d.sleep(true)
            .box2d.gravity(0, 1)
            .box2d.createWorld()
            .box2d.mode(0)
            .box2d.start();


		ige.on('texturesLoaded', function () {
			// Ask the engine to start
			ige.start(function (success) {
				// Check if the engine started successfully
				if (success) {
					// Start the networking (you can do this elsewhere if it
					// makes sense to connect to the server later on rather
					// than before the scene etc are created... maybe you want
					// a splash screen or a menu first? Then connect after you've
					// got a username or something?
					var serverUrl = 'http://aequoreagames.com:7610';
					if(location.origin = "file://") {
						serverUrl = 'http://localhost:7611';
					}
					//ige.network.start(, function () {
                    ige.network.start(serverUrl, function () {
						// Setup the network command listeners
						ige.network.define('playerEntity', self._onPlayerEntity); // Defined in ./gameClasses/ClientNetworkEvents.js
                        //ige.network.define('orbEntity', self._onOrbEntity); // Defined in ./gameClasses/ClientNetworkEvents.js

						// Setup the network stream handler
						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(80) // Render the simulation 160 milliseconds in the past
							// Create a listener that will fire whenever an entity
							// is created because of the incoming stream data
							.stream.on('entityCreated', function (entity) {
								self.log('Stream entity created with ID: ' + entity.id());

							});

						self.mainScene = new IgeScene2d()
							//.backgroundPattern(self.textures.stars, 'repeat', true, false)
							.id('mainScene');

						// Create the scene
						self.scene1 = new IgeScene2d()
							.id('scene1')
							.mount(self.mainScene);

						self.uiScene = new IgeScene2d()
							.id('uiScene')
							.ignoreCamera(true)
							.mount(self.mainScene);

						// Create the main viewport and set the scene
						// it will "look" at as the new scene1 we just
						// created above
						self.vp1 = new IgeViewport()
							.id('vp1')
							.autoSize(true)
							.scene(self.mainScene)
							.drawBounds(false)
							.mount(ige);
							
						//new IgeEntity()
						//	.id('boundaries')
						//	.width(500)
						//	.height(500)
						//	.texture(self.textures.boundary)
						//	.mount(self.scene1)

                        /*self.vp2 = new IgeViewport()
                            .id('vp2')

                            .id('bottom-right')
                            .right(0)
                            .bottom(0)
                            .width(150)
                            .height(75)
                            .autoSize(false)
                            .borderColor('#ffffff')
                            .camera.scaleTo(0.1, 0.1, 0.1)
                            .depth(1)
                            .scene(self.scene1)
                            .drawBounds(true)
                            .mount(ige);*/

                        self.score = new IgeFontEntity()
                            .texture(ige.client.textures.font)
                            .width(100)
                            .text('Score')
                            .top(5)
                            .right(10)
                            .mount(self.uiScene);

                        self.scoreText = new IgeFontEntity()
                            .id('scoreText')
                            .texture(ige.client.textures.font)
                            .width(100)
                            .text('0 points')
                            .colorOverlay('#ff6000')
                            .top(35)
                            .right(10)
                            .mount(self.uiScene);



						// Define our player controls
						ige.input.mapAction('left', ige.input.key.left);
						ige.input.mapAction('right', ige.input.key.right);
						ige.input.mapAction('thrust', ige.input.key.up);
						ige.input.mapAction('shoot', ige.input.key.space);


						// Ask the server to create an entity for us
						ige.network.send('playerEntity');
                        //ige.network.send('orbEntity');
                        //ige.server.players[self.id].destroy();

                        //delete ige.client.players(0);

						// We don't create any entities here because in this example the entities
						// are created server-side and then streamed to the clients. If an entity
						// is streamed to a client and the client doesn't have the entity in
						// memory, the entity is automatically created. Woohoo!

						// Enable console logging of network messages but only show 10 of them and
						// then stop logging them. This is a demo of how to help you debug network
						// data messages.
						ige.network.debugMax(10);
						ige.network.debug(true);

						// Create an IgeUiTimeStream entity that will allow us to "visualise" the
						// timestream data being interpolated by the player entity
						//self.tsVis = new IgeUiTimeStream()
						//	.height(140)
						//	.width(400)
						//	.top(0)
						//	.center(0)
						//	.mount(self.uiScene);

						self.custom1 = {
							name: 'Delta',
							value: 0
						};

						self.custom2 = {
							name: 'Data Delta',
							value: 0
						};

						self.custom3 = {
							name: 'Offset Delta',
							value: 0
						};

						self.custom4 = {
							name: 'Interpolate Time',
							value: 0
						};

						ige.watchStart(self.custom1);
						ige.watchStart(self.custom2);
						ige.watchStart(self.custom3);
						ige.watchStart(self.custom4);

                        ige.box2d.contactListener(
                            // Listen for when contact's begin
                            /**function (contact) {
                                //console.log('Contact begins between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);

                                // If player ship collides with lunar surface, crash!
                                if (contact.igeEitherCategory('floor') && contact.igeEitherCategory('ship')) {
                                    // The player has crashed!
                                    self.player.crash();
                                } else if (contact.igeEitherCategory('landingPad') && contact.igeEitherCategory('ship')) {
                                    // Clear the old orb data
                                    delete self.player._oldOrb;

                                    // If the player ship touches a landing pad, check velocity and angle
                                    var degrees = Math.degrees(self.player._rotate.z),
                                        wound = Math.round(degrees / 360);

                                    if (wound > 0) {
                                        degrees -= (360 * wound);
                                    }

                                    if (wound < 0) {
                                        degrees -= (360 * wound);
                                    }

                                    self.player._rotate.z = Math.radians(degrees);

                                    if (degrees > 30 || degrees < -30) {
                                        self.player.crash();
                                    } else {
                                        // The player has landed
                                        self.player._landed = true;
                                    }
                                } else if (!self.player._carryingOrb && contact.igeEitherCategory('orb') && contact.igeEitherCategory('ship')) {
                                    // Check if it is our sensor
                                    if (contact.m_fixtureA.IsSensor() || contact.m_fixtureB.IsSensor()) {
                                        // Sensor has collided, attach orb to ship!
                                        // Set carrying orb
                                        self.player.carryOrb(contact.igeEntityByCategory('orb'), contact);
                                    }
                                } else if (contact.igeEitherCategory('orb') && contact.igeEitherCategory('landingPad')) {
                                    // Orb has reached landing pad, score!
                                    if (self.player._carryingOrb && self.player._orb === contact.igeEntityByCategory('orb')) {
                                        // The orb the player was carrying has reached a pad
                                        self.player._orb.deposit(true, contact.igeEntityByCategory('landingPad'));
                                    } else {
                                        contact.igeEntityByCategory('orb').deposit(false, contact.igeEntityByCategory('landingPad'));
                                    }
                                }
                            },*/
                            // Listen for when contact's end
                            function (contact) {
                                //console.log('Contact ends between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);
                                if (contact.igeEitherCategory('bullet') && contact.igeEitherCategory('orb')) {
                                    // The player has taken off
                                    console.log('contact between bullet and orb');
                                    //this.player.destroy();
                                    //delete ige.servers.players(0);
                                    //delete ige.servers.players(1);
                                    //delete ige.servers.players(2);
                                    //delete ige.servers.players(3);
                                }
                            }

                             // You can also check an entity by it's category using igeEitherCategory('categoryName')
                             
                        );

                         new Score('+1 for orb')
                         .translateTo(0, 0, 0)
                         //.mount(this.uiScene)
                         .start(1000);





					});
				}
			});
		});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }