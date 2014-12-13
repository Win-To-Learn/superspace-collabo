var util = require('util');
var crypto = require('crypto');
var mres = function (val) {
  val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
    switch (s) {
      case "\0":
        return "\\0";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\b":
        return "\\b";
      case "\t":
        return "\\t";
      case "\x1a":
        return "\\Z";
      default:
        return "\\" + s;
    }
  });
  return val;
};
var pwHash = function (val) {
	var shasum = crypto.createHash('sha1');
	shasum.update(val);
	return shasum.digest('hex');
}
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
		var username = data[0].toLowerCase();
		var pw = pwHash(username[0]+data[1]);
		ige.mysql.query("SELECT * FROM users WHERE username_safe = '"+mres(username)+"'", function(err, rows, fields) {
			if(!err) {
				if(rows.length === 0) { // username not found, register it
					console.log("User '"+data[0]+"' registering");
					ige.mysql.query("INSERT INTO users (clientId, username, username_safe, password, color) VALUES ('"+clientId+"','"+mres(data[0])+"','"+mres(username)+"','"+mres(pw)+"',null)", function(err, rows, fields) {
						if(!err) {
							console.log("User '"+data[0]+"' logged in");
							ige.network.send('loginSuccessful', '', clientId);
						}
						else {
							console.log('* Error in register query', err);
						}
					});
				}
				else if(rows[0].password === pw) {
					ige.mysql.query("UPDATE users SET clientId = '"+clientId+"' WHERE id = "+rows[0].id+"", function(err, rows, fields) {
						if(!err) {
							console.log("User '"+data[0]+"' logged in");
							ige.network.send('loginSuccessful', '', clientId);
						}
						else {
							console.log('* Error in register query', err);
						}
					});
				}
				else {
					console.log("User '"+data[0]+"' tried to login with an invalid password");
					ige.network.send('loginDenied', '', clientId);
				}
			}
			else {
				console.log('* Error in login query', err);
			}
		});
	},

	_onPlayerEntity: function (data, clientId) {
		if (!ige.server.players[clientId]) {
			ige.server.players[clientId] = new Player(clientId)
				.streamMode(1)
				.translateTo(-2100+Math.random()*4200,-1200+Math.random()*2400,0)
				.mount(ige.server.scene1);
			
			ige.server.players[clientId].color = ige.server.floatToRgb(Math.random());
			// Tell the client to track their player entity
			ige.network.send('playerEntity', ige.server.players[clientId].id(), clientId);
			ige.network.send('updateScore', ige.server.score, clientId);
		}
	},
	
	_onCode: function(data, clientId) {
		var me = ige.server.players[clientId];

		var player = ige.server.players[clientId];

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

	_onPlayerDownDown: function (data, clientId) {
		ige.server.players[clientId].controls.down = true;
	},

	_onPlayerDownUp: function (data, clientId) {
		ige.server.players[clientId].controls.down = false;
	},
	
	_onPlayerTurnDown: function (data, clientId) {
		ige.server.players[clientId].controls.thrust = true;
		ige.server.players[clientId].controls.turn = true;
		ige.server.players[clientId].controls.turnData = data;
	},
	
	_onPlayerTurnUp: function (data, clientId) {
		ige.server.players[clientId].controls.thrust = false;
		ige.server.players[clientId].controls.turn = false;
	},
	
	_onPlayerShootDown: function (data, clientId) {
		ige.server.players[clientId].controls.shoot = true;
	},
	
	_onPlayerShootUp: function (data, clientId) {
		ige.server.players[clientId].controls.shoot = false;
	}
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }