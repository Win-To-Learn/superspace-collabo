//Start the server with node ./server/ige -g ./

var Client = IgeClass.extend({
	classId: 'Client',

	init: function () {
		//ige.timeScale(0.1);
		//ige.showStats(1);

		// Load our textures
		var self = this;

		// Enable networking
		ige.addComponent(IgeNetIoComponent);

		// Enable console logging of network messages but only show 10 of them and
		// then stop logging them. This is a demo of how to help you debug network
		// data messages.
		ige.network.debugMax(10);
		ige.network.debug(true);
		ige.debugEnabled(true);

		// Implement our game methods
		this.implement(ClientNetworkEvents);

		// Create the HTML canvas
		ige.createFrontBuffer(true);

		// Load the textures we want to use
		this.textures = {
			ship: new IgeTexture('./assets/PlayerTexture.js'),
            orb: new IgeTexture('./assets/OrbTexture.js'),
            planetoid: new IgeTexture('./assets/PlanetoidTexture.js'),
            fixedorbred: new IgeTexture('./assets/FixedOrbTexture4.js'),
            fixedorbz: new IgeTexture('./assets/FixedOrbTexture3.js'),
            bullet: new IgeTexture('./assets/BulletTexture.js'),
            stars: new IgeTexture('./assets/stars2.png'),
            boundary: new IgeTexture('./assets/BoundaryTexture.js'),
            font: new IgeFontSheet('./assets/agency_fb_20pt.png'),
            fontChat: new IgeFontSheet('./assets/verdana_10px.png'),
            fontid: new IgeFontSheet('./assets/arial_narrow_60pt.png'),
            coordinates: new IgeFontSheet('./assets/verdana_10px.png'),
			titlescreen: new IgeFontSheet('./assets/arial_narrow_60pt.png')

		};

		ige.on('texturesLoaded', function () {
			// Ask the engine to start
            //this.client.textures.ship.applyFilter(IgeFilters.colorOverlay, {color: 'rgba(0, 255, 255, 1)'});
			ige.start(function (success) {
				// Check if the engine started successfully
				if (success) {
                    //("canvas#igeFrontBuffer").focus();
                    $("#igeFrontBuffer").focus();
                    ige.viewportDepth(true);
					// Start the networking (you can do this elsewhere if it
					// makes sense to connect to the server later on rather
					// than before the scene etc are created... maybe you want
					// a splash screen or a menu first? Then connect after you've
					// got a username or something?
					//var serverUrl = 'http://aequoreagames.com:7610'; // This is the url for remote deployment
					var serverUrl = 'http://localhost:7610';
					//var serverUrl = 'http://starcoder3.jit.su/';
					//var serverUrl = 'http://superspace.mayumi.fi:7610'; // This is the url for remote deployment
					//if(location.origin == "file://" || location.origin.indexOf("http://localhost") == 0) {
					//	serverUrl = 'http://localhost:7610'; // This is the url for running the server locally
					//}

                    //var port = process.env.PORT || 5000;
					//var port = 5000;
					ige.network.start(serverUrl, function () {
					ige.network._onError = function (data) {
						if(data.reason == "Cannot establish connection, is server running?") {
							$("body").html(data.reason);
						}
					}
                    ige.network.start(serverUrl, function () {
						
						//login.init();
						//login.showLogin();

						/*
						var lessonId = 'someNewId'; // has to be unique, lessons are differentiated with this
						lessonList[lessonId] = 'lesson content that’s going to be put in the codebox';
						console.log(lessonList);
						$('#lessonList').append('<div class=lessonButton data-lesson=lessonId>');
						$('.lessonButton[data-lesson'+lessonId+']').click();
						*/


						
						ige.network.define('loginSuccessful', self._onLoginSuccessful); // Defined in ./gameClasses/ClientNetworkEvents.js
						ige.network.define('loginDenied', self._onLoginDenied); // Defined in ./gameClasses/ClientNetworkEvents.js

						//ige.on('login', function() {
							// Setup the network command listeners
							ige.network.define('playerEntity', self._onPlayerEntity); // Defined in ./gameClasses/ClientNetworkEvents.js
							ige.network.define('chatJoin', self._onChatJoin); // Defined in ./gameClasses/ClientNetworkEvents.js
							ige.network.define('chatMessage', self._onChatMessage); // Defined in ./gameClasses/ClientNetworkEvents.js
							ige.network.define('scored', self._onScored); // Defined in ./gameClasses/ClientNetworkEvents.js
							ige.network.define('code', self._onCode); // Defined in ./gameClasses/ClientNetworkEvents.js
							ige.network.define('updateTouchScore', self._onUpdateTouchScore); // Defined in ./gameClasses/ClientNetworkEvents.js
							ige.network.define('updateScore', self._onUpdateScore); // Defined in ./gameClasses/ClientNetworkEvents.js

							// Setup the network stream handler
							ige.network.addComponent(IgeStreamComponent)
								.stream.renderLatency(80) // Render the simulation 160 milliseconds in the past
								// Create a listener that will fire whenever an entity
								// is created because of the incoming stream data
								.stream.on('entityCreated', function (entity) {
									self.log('Stream entity created with ID: ' + entity.id());
								});
							
							//myAud=document.getElementById("Audio1");
							//myAud.volume=0.4;






							/* ------------------------------------------- *\
												Chat system
							\* ------------------------------------------- */
							
							self.chatBox = $("#chatBox>#chatHistory");
							//styles
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
							//events
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
							//functions
							self.formatMessage = function(data) {
								var date = new Date(data['time']);
								return "["+(date.getHours()<10 ? '0'+date.getHours() : date.getHours())+":"+(date.getMinutes()<10 ? '0'+date.getMinutes() : date.getMinutes())+":"+(date.getSeconds()<10 ? '0'+date.getSeconds() : date.getSeconds())+"] "+data['client']+": "+data['message'];
							}
							//get chat log
							ige.network.send("chatJoin");
							
							/* ------------------------------------------- *\
											Color randomiser
							\* ------------------------------------------- */
							
							self.floatToRgb = function(val) {
								self.colorStops = [
									[255,0,0],
									[255,255,0],
									[0,255,0],
									[0,255,255],
									[0,0,255],
									[255,0,255]
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

							/* ------------------------------------------- *\
											Scene setup
							\* ------------------------------------------- */
							
							self.mainScene = new IgeScene2d()
								//.backgroundPattern(self.textures.stars, 'repeat', true, false)
                                //.color("#000000")
								.id('mainScene');

							// Create the scene
							self.scene1 = new IgeScene2d()
								.id('scene1')
								.mount(self.mainScene);

							self.uiScene = new IgeScene2d()
								.id('uiScene')
								.ignoreCamera(true)
								.mount(self.mainScene);

							/* ------------------------------------------- *\
												Viewports
							\* ------------------------------------------- */
							
							self.vp1 = new IgeViewport()
								.id('vp1')
								.autoSize(true)
								.scene(self.mainScene)
								.drawBounds(false)
								.camera.scaleTo(.5,.5,.5)
								.depth(0)
								.mount(ige);

							self.minimap = new IgeViewport()
								.id('minimap')
								.left(0)
								.top(0)
								.width(260)
								.height(150)
								.autoSize(false)
								.borderColor('#ffffff')
								.camera.scaleTo(.03,.03,.03)
								.depth(1)
								.scene(self.mainScene)
								.mount(ige);

							/* ------------------------------------------- *\
											UI Text elements
							\* ------------------------------------------- */
							
							self.score = new IgeFontEntity()
								.texture(ige.client.textures.font)
								.width(100)
								.text('Team B')
								.top(5)
								.right(10)
								.hide()
								.mount(self.uiScene);

                        self.score = new IgeFontEntity()
                            .texture(ige.client.textures.font)
                            .width(100)
                            .text('Team A')
                            .top(5)
                            .right(100)
							.hide()
                            .mount(self.uiScene);


                            self.playerscore = new IgeFontEntity()
								.texture(ige.client.textures.font)
								.width(100)
								.text('Score')
								.top(-80)
								.right(10)
								.height(200)
                                .hide()
								.mount(self.uiScene);

							self.scoreText = new IgeFontEntity()
								.id('scoreText')
								.texture(ige.client.textures.font)
								.width(100)
								.text('0 points')
								.colorOverlay('#ff6000')
								.top(35)
								.right(10)
								.hide()
								.mount(self.uiScene);


                        self.scoreText2 = new IgeFontEntity()
                            .id('scoreText2')
                            .texture(ige.client.textures.font)
                            .width(100)
                            .text('0 points')
                            .colorOverlay('#ff6000')
                            .top(35)
                            .right(100)
							.hide()
                            .mount(self.uiScene);


                        self.coordinates1 = new IgeFontEntity()
                            .id('coordinates1')
                            .texture(ige.client.textures.coordinates)
                            .width(100)
                            .text('-4200,2400')
                            .colorOverlay('#ff6000')
                            .top(140)
                            .left(-10)
                            .mount(self.uiScene);

                        self.coordinates2 = new IgeFontEntity()
                            .id('coordinates2')
                            .texture(ige.client.textures.coordinates)
                            .width(100)
                            .text('4200,-2400')
                            .colorOverlay('#ff6000')
                            .top(-10)
                            .left(245)
                            .mount(self.uiScene);




							self.timerLabel = new IgeFontEntity()
								.texture(ige.client.textures.font)
								.width(100)
								.text('Time')
								.top(5)
								.right(200)
								.hide()
								.mount(self.uiScene);

							self.timerText = new IgeFontEntity()
								.texture(ige.client.textures.font)
								.width(100)
								.text('0:0:0')
								.colorOverlay('#ff6000')
								.top(35)
								.right(200)
								.hide()
								.mount(self.uiScene);

							self.rules = new IgeFontEntity()
								.texture(ige.client.textures.font)
								.width(600)
								.height(200)
								.text('_do not get tagged!\n_ARROW keys to move\n_press B to shoot asteroids in path\n_play limits shown in minimap\n_edit power codes for advantages')
								.colorOverlay('#ff6000')
								.top(20)
								.left(300)
								.textAlignX(0)
								.textAlignY(0)
								.mount(self.uiScene);

						self.titlescreen = new IgeFontEntity()
							.texture(ige.client.textures.font)
							.width(600)
							.height(400)
							.text('_click to play\nSTARCODERGAME.COM\n_alpha ver 0_2')
							.colorOverlay('#ff6000')
							.top(130)
							.left(300)
							.textAlignX(0)
							.textAlignY(0)
							.mount(self.uiScene);

							setTimeout(function() {
								self.rules.destroy();
							}, 24000);

						setTimeout(function() {
							self.titlescreen.destroy();
						}, 30000);



						var intTimer1 = 0;

							var a = new IgeInterval(function () {
								var d = new Date();
								var hours = (d.getHours() < 10 ? "0"+d.getHours() : d.getHours());
								var minutes = (d.getMinutes() < 10 ? "0"+d.getMinutes() : d.getMinutes());
								var seconds = (d.getSeconds() < 10 ? "0"+d.getSeconds() : d.getSeconds());
								var strTimerText = hours+":"+minutes+":"+seconds;
								ige.client.timerText.text(strTimerText);
								intTimer1++;
							}, 1000);

							/* ------------------------------------------- *\
											Player controls
							\* ------------------------------------------- */
							
							ige.input.mapAction('left', ige.input.key.left);
							ige.input.mapAction('right', ige.input.key.right);
							ige.input.mapAction('thrust', ige.input.key.up);
							ige.input.mapAction('down', ige.input.key.down);
							ige.input.mapAction('shoot', ige.input.key.b);

							// Ask the server to create an entity for us
							ige.network.send('playerEntity');

						}); // login
					});
				}
			});
		}); // texturesloaded
	}//init function
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }