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
            .box2d.gravity(0, 1)
            .box2d.createWorld()
            .box2d.mode(0)
            .box2d.start();

		// Add the networking component
		ige.addComponent(IgeNetIoComponent)
			// Start the network server
			//.network.start(7600, function () {
            .network.start(2000, function () {
				// Networking has started so start the game engine
				ige.start(function (success) {
					// Check if the engine started successfully
					if (success) {
						// Create some network commands we will need
						ige.network.define('playerEntity', self._onPlayerEntity);
                        ige.network.define('orbEntity', self._onOrbEntity);

						ige.network.define('playerControlLeftDown', self._onPlayerLeftDown);
						ige.network.define('playerControlRightDown', self._onPlayerRightDown);
						ige.network.define('playerControlThrustDown', self._onPlayerThrustDown);

						ige.network.define('playerControlLeftUp', self._onPlayerLeftUp);
						ige.network.define('playerControlRightUp', self._onPlayerRightUp);
						ige.network.define('playerControlThrustUp', self._onPlayerThrustUp);

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

                        var orb2 = new Orb()
                            .id('orb2')
                            .streamMode(1)
                            .mount(ige.$('scene1'))
                            //.height(100)
                            //.width(100)
                            .addComponent(IgeVelocityComponent)
                            .velocity.byAngleAndPower(Math.radians(20), 0.01);



                        var orb3 = new Orb()
                            .id('orb3')
                            .streamMode(1)
                            .mount(ige.$('scene1'))
                            .scaleBy(0.5,0.5,0.5)
                            //.height(40)
                            //.width(40)
                            .addComponent(IgeVelocityComponent)
                            .translateTo(100, -200, 0)
                            .velocity.byAngleAndPower(Math.radians(100), 0.02);

                        ige.box2d.contactListener(
                            function (contact) {
                                //console.log('Contact ends between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);
                                if (contact.igeEitherCategory('Orb') && contact.igeEitherCategory('Orb')) {
                                    // The player has taken off
                                    //orb2._translateTo(200,200,0);
                                    //orb3.destroy;
                                    //delete ige.servers.players(1);
                                    //delete ige.servers.players(2);
                                    //delete ige.servers.players(3);
                                }
                            }
                            );




                        //orb2.texture(ige.client.textures.orb);

                        //orb2._translate.tween()
                        //    .stepTo({x: -200},60000)
                        //    .start();


                            //.velocity.x(-0.01)
                            //.velocity.y(0.01)
                            //.velocity.byAngleAndPower(Math.radians(45), 0.1)




					}
				});
			});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }