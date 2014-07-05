var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,

	init: function (options) {
		var self = this;
		ige.timeScale(1);

		// Define an object to hold references to our player entities
		this.players = {};
        this.orbs = {};

		// Add the server-side game methods / event handlers
		this.implement(ServerNetworkEvents);

        ige.addComponent(IgeBox2dComponent)
            .box2d.sleep(true)
            //.box2d.gravity(0, 1)
            .box2d.createWorld()
            .box2d.mode(0)
            .box2d.start();

		// Add the networking component
		ige.addComponent(IgeNetIoComponent)
			// Start the network server
			.network.start(7600, function () {
            //.network.start(2000, function () {
				// Networking has started so start the game engine
				ige.start(function (success) {
					// Check if the engine started successfully
					if (success) {
						// Create some network commands we will need
						ige.network.define('playerEntity', self._onPlayerEntity);
						ige.network.define('code', self._onCode);
                        ige.network.define('orbEntity', self._onOrbEntity);

						ige.network.define('playerControlLeftDown', self._onPlayerLeftDown);
						ige.network.define('playerControlRightDown', self._onPlayerRightDown);
						ige.network.define('playerControlThrustDown', self._onPlayerThrustDown);

						ige.network.define('playerControlLeftUp', self._onPlayerLeftUp);
						ige.network.define('playerControlRightUp', self._onPlayerRightUp);
						ige.network.define('playerControlThrustUp', self._onPlayerThrustUp);
						
						ige.network.define('playerShoot', self._onPlayerShoot);

						ige.network.on('connect', self._onPlayerConnect); // Defined in ./gameClasses/ServerNetworkEvents.js
						ige.network.on('disconnect', self._onPlayerDisconnect); // Defined in ./gameClasses/ServerNetworkEvents.js

						// Add the network stream component
						ige.network.addComponent(IgeStreamComponent)
							.stream.sendInterval(30) // Send a stream update once every 30 milliseconds
							.stream.start(); // Start the stream

						// Accept incoming network connections
						ige.network.acceptConnections(true);

						// Create the scene
						self.mainScene = new IgeScene2d()
							.id('mainScene');

						// Create the scene
						self.scene1 = new IgeScene2d()
							.id('scene1')
							.mount(self.mainScene);

						// Create the main viewport and set the scene
						// it will "look" at as the new scene1 we just
						// created above
						self.vp1 = new IgeViewport()
							.id('vp1')
							.autoSize(true)
							.scene(self.mainScene)
							.drawBounds(true)
							.mount(ige);

                        //var tex = new IgeTexture('./assets/OrbTexture.js');
						
						for(var i = 0; i < 3; i++) {
							scale = 1 + Math.random();
							var orb3 = new Orb(scale)
								.translateTo((Math.random()-0.5)*400, (Math.random()-0.5)*400, 0)
								.rotateTo(0,0,Math.radians(Math.random()*360))
						}
						
						ige.box2d.contactListener(
							// Listen for when contact's begin
							function (contact) {
								var A = contact.igeEntityA();
								var B = contact.igeEntityB();
								//console.log('Contact begins between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);
								if(A.category() == 'orb' && B.category() == 'bullet') {
									A.exploding = true;
									B.destroy();
								}
							},
							// Listen for when contact's end
							function (contact) {
								//console.log('Contact ends between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);
							}
						);




					}
				});
			});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }