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
            font: new IgeFontSheet('./assets/agency_fb_20pt.png', 3),
            fontChat: new IgeFontSheet('./assets/verdana_10px.png', 3)

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
					var serverUrl = 'http://aequoreagames.com:7610'; // This is the url for remote deployment

                    //var serverUrl = 'http://localhost:7610';
					//var serverUrl = 'http://superspace.mayumi.fi:7610'; // This is the url for remote deployment
					console.log(location);
					if(location.origin == "file://" || location.origin == "http://localhost") {
						serverUrl = 'http://localhost:7610'; // This is the url for running the server locally
					}
                    //var port = process.env.PORT || 5000;
					//ige.network.start(port, function () {
                    ige.network.start(serverUrl, function () {
						// Setup the network command listeners
						ige.network.define('playerEntity', self._onPlayerEntity); // Defined in ./gameClasses/ClientNetworkEvents.js
						ige.network.define('chatJoin', self._onChatJoin); // Defined in ./gameClasses/ClientNetworkEvents.js
						ige.network.define('chatMessage', self._onChatMessage); // Defined in ./gameClasses/ClientNetworkEvents.js
						ige.network.define('scored', self._onScored); // Defined in ./gameClasses/ClientNetworkEvents.js
						ige.network.define('updateScore', self._onUpdateScore); // Defined in ./gameClasses/ClientNetworkEvents.js
                        //ige.network.define('orbEntity', self._onOrbEntity); // Defined in ./gameClasses/ClientNetworkEvents.js

						// Setup the network stream handler
						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(80) // Render the simulation 160 milliseconds in the past
							// Create a listener that will fire whenever an entity
							// is created because of the incoming stream data
							.stream.on('entityCreated', function (entity) {
								self.log('Stream entity created with ID: ' + entity.id());

							});
							
						// Chat system
						ige.network.send("chatJoin");
						self.chatBox = $("#chatBox>#chatHistory");
						$("INPUT[name=chatInputSubmit]").on("click", function() {
							ige.network.send("chatMessage", $(this).siblings("#chatInputField").val());
							$(this).siblings("#chatInputField").val("");
						});
						$("INPUT[name=chatInputField]").on("keyup", function(e) {
							if(e.keyCode == 13) { // enter
								ige.network.send("chatMessage", $(this).val());
								$(this).val("");
							}
						});
						self.formatMessage = function(data) {
							var date = new Date(data['time']);
							return "["+(date.getHours()<10 ? '0'+date.getHours() : date.getHours())+":"+(date.getMinutes()<10 ? '0'+date.getMinutes() : date.getMinutes())+":"+(date.getSeconds()<10 ? '0'+date.getSeconds() : date.getSeconds())+"] "+data['client']+": "+data['message'];
						}
						
						

						

						self.floatToRgb = function(val) {
							self.colorStops = [
								[255,0,0],
								[255,255,0],
								[0,255,0]
							];
							if(val > 1) { val = val % 1; }
							var fromStop = Math.floor(val*(self.colorStops.length-1));
							var toStop = Math.ceil(val*(self.colorStops.length-1));
							var stopPercentage = (val - 1 / (self.colorStops.length-1) * fromStop) * (self.colorStops.length-1);
							var colors = [0,0,0];
							if(fromStop == toStop) { colors[0] = self.colorStops[fromStop][0]; colors[1] = self.colorStops[fromStop][1]; colors[2] = self.colorStops[fromStop][2]; }
							else {
								colors[0] = Math.round((self.colorStops[toStop][0]-self.colorStops[fromStop][0])*stopPercentage)+self.colorStops[fromStop][0];
								colors[1] = Math.round((self.colorStops[toStop][1]-self.colorStops[fromStop][1])*stopPercentage)+self.colorStops[fromStop][1];
								colors[2] = Math.round((self.colorStops[toStop][2]-self.colorStops[fromStop][2])*stopPercentage)+self.colorStops[fromStop][2];
							}
							return 'rgba('+colors[0]+','+colors[1]+','+colors[2]+',1)';
						}

                        //ige.addComponent(IgeAudioComponent);
                        //self.thrust = new IgeAudioComponent()
                        //.load("assets/thrust.mp3");

                        //self.thrust.play();

						// Scene setup
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
                            //.minimumVisibleArea(7800,5600);

                        //console.log(self.vp1.viewArea());
						new IgeEntity()
							.id('boundaries')
							.width(500)
							.height(500)
							.texture(self.textures.boundary)
							//.mount(self.scene1)

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
						
						ige.ui.style('.chatInput', {
							'borderColor': "rgb(200,200,200)",
							'borderWidth': 1,
							'color': "white"
						});
						ige.ui.style('.chatInput:hover', {
							'borderColor': "rgb(255,255,255)",
						});
						ige.ui.style('.chatInput:focus', {
							'borderColor': "rgb(200,200,255)",
						});
						
						self.chatHistory = new IgeUiLabel
						/*
						self.chatInput = new IgeUiTextBox()
							.id("chatInputBox")
							.width(350)
							.height(20)
							.bottom(1)
							.right(1)
							.styleClass("chatInput")
							.placeHolder("Input message:")
							.placeHolderColor('rgb(150,150,150)')
							.value('')
                            .fontSheet(ige.client.textures.fontChat)
                            .mount(self.uiScene);
						*/

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
						ige.input.mapAction('shoot', ige.input.key.b);


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
						ige.network.debug(false);

						ige.debug(false);

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
                            function (contact) {
								
                            },
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





					});
				}
			});
		});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }