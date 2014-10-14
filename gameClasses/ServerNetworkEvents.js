var util = require('util');
var ServerNetworkEvents = {
	/**
	 * Is called when the network tells us a new client has connected
	 * to the server. This is the point we can return true to reject
	 * the client connection if we wanted to.
	 * @param data The data object that contains any data sent from the client.
	 * @param clientId The client id of the client that sent the message.
	 * @private
	 */
	_onPlayerConnect: function (socket) {
		// Don't reject the client connection
		return false;
	},

	_onPlayerDisconnect: function (clientId) {
		if (ige.server.players[clientId]) {
			// Remove the player from the game
			ige.server.players[clientId].destroy();

			// Remove the reference to the player entity
			// so that we don't leak memory
			delete ige.server.players[clientId];
		}
	},
	
	_onLogin: function(data, clientId) {
		console.log("Login attempt");
	},

	_onPlayerEntity: function (data, clientId) {
		if (!ige.server.players[clientId]) {
			ige.server.players[clientId] = new Player(clientId)
				.streamMode(1)
				.translateTo(0,0,0)
				.mount(ige.server.scene1);
			
			ige.server.players[clientId].color = ige.server.floatToRgb(Math.random());
			// Tell the client to track their player entity
			ige.network.send('playerEntity', ige.server.players[clientId].id(), clientId);
			ige.network.send('updateScore', ige.server.score, clientId);
		}
	},
	
	_onCode: function(data, clientId) {
		var me = ige.server.players[clientId];
		var msgs = [];
		var oldLog = console.log;
		console.log = function (message) {
			msgs.push(util.inspect(message, {showHidden: true, depth: 1}));
			//msgs.push(util.inspect(message));
			//oldLog.apply(console, arguments);
		};
		log = console.log;
		try {
			eval(data);
		}
		catch(e) {
			console.log(e);
		}
		ige.network.send('code', msgs, clientId);
	},

	_onChatJoin: function(data, clientId) {
		ige.network.send('chatJoin', ige.server.chatBuffer, clientId);
	},

	_onChatMessage: function(data, clientId) {
		var msg = {'time' : new Date(), 'message' : data, 'client' : clientId};
		ige.server.chatBuffer.push(msg);
		ige.network.send('chatMessage', msg);
	},

	_onPlayerLeftDown: function (data, clientId) {
		ige.server.players[clientId].controls.left = true;
	},

	_onPlayerLeftUp: function (data, clientId) {
		ige.server.players[clientId].controls.left = false;
	},

	_onPlayerRightDown: function (data, clientId) {
		ige.server.players[clientId].controls.right = true;
	},

	_onPlayerRightUp: function (data, clientId) {
		ige.server.players[clientId].controls.right = false;
	},

	_onPlayerThrustDown: function (data, clientId) {
		ige.server.players[clientId].controls.thrust = true;
	},

	_onPlayerThrustUp: function (data, clientId) {
		ige.server.players[clientId].controls.thrust = false;
	},
	
	_onPlayerShootDown: function (data, clientId) {
		ige.server.players[clientId].controls.shoot = true;
	},
	
	_onPlayerShootUp: function (data, clientId) {
		ige.server.players[clientId].controls.shoot = false;
	}
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }