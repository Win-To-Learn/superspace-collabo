include: '../../engine/components/chat/IgeChatClient.js';

var Client = IgeClass.extend({
	classId: 'Client',

	init: function () {
		ige.showStats(1);

		// Load our textures
		var self = this;

		this.obj = [];
		this.gameTexture = {};

		// Enable networking
		ige.addComponent(IgeSocketIoComponent);

		// Implement our game methods
		this.implement(ClientNetworkEvents);

		// Create the HTML canvas
		ige.createFrontBuffer(true);

		// Ask the engine to start
		ige.start(function (success) {
			// Check if the engine started successfully
			if (success) {

                ige.addGraph('IgeBaseScene');

                ige.$('vp1').addComponent(IgeMouseZoomComponent)
                    .mouseZoom.enabled(true);

                // Create the UI scene
                self.uiScene = new IgeScene2d()
                    .id('uiScene')
                    .depth(1)
                    .ignoreCamera(true)
                    .mount(ige.$('baseScene'));

                ige.ui.style('#topNav', {
                    'backgroundColor': '#212121',
                    'top': 0,
                    'left': 0,
                    'right': 0,
                    'height': 42
                });

                ige.ui.style('#leftNav', {
                    'backgroundColor': '#3d3d3d',
                    'top': 42,
                    'left': 0,
                    'width': 225,
                    'bottom': 0
                });

                ige.ui.style('#main', {
                    'backgroundColor': '#ffffff',
                    'left': 225,
                    'right': 0,
                    'top': 42,
                    'bottom': 0
                });

                ige.ui.style('#logo', {
                    'backgroundImage': self.gameTexture.metronic,
                    'backgroundRepeat': 'no-repeat',
                    'middle': 0,
                    'left': 20,
                    'width': 86,
                    'height': 14
                });

                ige.ui.style('.title', {
                    'font': '3em Open Sans',
                    'color': '#666666',
                    'width': 200,
                    'height': 40,
                    'top': 10,
                    'left': 10
                });

                ige.ui.style('.subTitle', {
                    'font': 'lighter 16px Open Sans',
                    'color': '#666666',
                    'width': 400,
                    'height': 40,
                    'top': 40,
                    'left': 11
                });

                ige.ui.style('IgeUiTextBox', {
                    'backgroundColor': '#ffffff',
                    'borderColor': '#212121',
                    'borderWidth': 1,
                    'bottom': null,
                    'right': null,
                    'width': 300,
                    'height': 30,
                    'left': 15,
                    'font': '12px Open Sans',
                    'color': '#000000'
                });

                ige.ui.style('#textBox1', {
                    'top': 140
                });

                ige.ui.style('#textBox2', {
                    'top': 180
                });

                ige.ui.style('#textBox1:focus', {
                    'borderColor': '#00ff00'
                });

                ige.ui.style('#textBox2:focus', {
                    'borderColor': '#00ff00'
                });

                ige.ui.style('#dashBar', {
                    'backgroundColor': '#eeeeee',
                    'top': 80,
                    'left': 15,
                    'right': 15,
                    'height': 40
                });

                ige.ui.style('IgeUiLabel', {
                    'font': '12px Open Sans',
                    'color': '#000000'
                });

                ige.ui.style('#homeLabel', {
                    'font': '14px Open Sans',
                    'color': '#333333'
                });

                var topNav = new IgeUiElement()
                    .id('topNav')
                    .mount(self.uiScene);

                new IgeUiElement()
                    .id('logo')
                    .mount(topNav);

                var leftNav = new IgeUiElement()
                    .id('leftNav')
                    .mount(self.uiScene);

                var main = new IgeUiElement()
                    .id('main')
                    .mount(self.uiScene);

                new IgeUiLabel()
                    .value('Dashboard')
                    .styleClass('title')
                    .mount(main);

                new IgeUiLabel()
                    .value('Test the chat application')
                    .styleClass('subTitle')
                    .mount(main);

                var dashBar = new IgeUiElement()
                    .id('dashBar')

                    .mount(main);



                new IgeUiLabel()
                    .id('homeLabel')
                    .value('Click here to send message')
                    .width(300)
                    .height(40)
                    .left(0)
                    .top(0)
                    .mount(dashBar);

                var textBox1 = new IgeUiTextBox()
                    .id('textBox1')
                    .value('')
                    .placeHolder('Enter a chat message here')
                    .placeHolderColor('#989898')
                    .mount(main);

                self.textBox2 = new IgeUiTextBox()
                    .id('textBox2')
                    .value('')

                    .placeHolder('Received messages should show here')
                    .placeHolderColor('#989898')
                    .mount(main);
				// Start the networking (you can do this elsewhere if it
				// makes sense to connect to the server later on rather
				// than before the scene etc are created... maybe you want
				// a splash screen or a menu first? Then connect after you've
				// got a username or something?


                //mychat1 = new chat1();

				ige.network.start('http://localhost:2000', function () {
					// Enable chat - notice we do that here AFTER the network
					// has started. This is because the chat component registers
					// a number of new network commands and they will fail if
					// the client has not yet started the network and received
					// the list of accepted network commands from the server.
					//ige.addComponent(IgeChatComponent);
                    ige.addComponent(IgeChatComponent);
                    console.log(ige.chat._onMessageFromServer);
                    ige.chat.onMessageFromServer=function(data){
                        $("body").html(JSON.stringify(data));
                        console.log("got data");

                    };
                    console.log(ige.chat._onMessageFromServer);
				});



                dashBar.mouseDown(function(){
                    ige.chat.joinRoom('lobby');
                    ige.chat.sendToRoom('lobby', textBox1.value());
                    //chat1.joinRoom('lobby');
                    //chat1.sendToRoom('lobby', textBox1.value());
                    //console.log('Mouse down button: ');

                });

			}
		});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }