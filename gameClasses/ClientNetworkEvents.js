var ClientNetworkEvents = {
	/**
	 * Is called when a network packet with the "playerEntity" command
	 * is received by the client from the server. This is the server telling
	 * us which entity is our player entity so that we can track it with
	 * the main camera!
	 * @param data The data object that contains any data sent from the server.
	 * @private
	 */
	_onPlayerEntity: function (data) {
		console.log("Got new player, entityId "+data);
		if (ige.$(data)) {
			ige.client.vp1.camera.trackTranslate(ige.$(data), 18);
		} else {
			console.log("It's new");
			// The client has not yet received the entity via the network
			// stream so lets ask the stream to tell us when it creates a
			// new entity and then check if that entity is the one we
			// should be tracking!
			var self = this;
			self._eventListener = ige.network.stream.on('entityCreated', function (entity) {
				if (entity.id() === data) {
                    // Store reference to player
                    ige.data('player', ige.$(data));
					ige.$(data).nametagfont.text(data.substr(0,3));

					// Tell the camera to track out player entity
					ige.client.vp1.camera.trackTranslate(ige.$(data), 18);
					// Turn off the listener for this event now that we
					// have found and started tracking our player entity
					ige.network.stream.off('entityCreated', self._eventListener, function (result) {
						if (!result) {
							this.log('Could not disable event listener!', 'warning');
						}
					});
				}
			});
		}
	},
	
	_onScored: function (data) {
        blastSound.play();
		new ClientScore(data)
			.translateTo(0, 0, 0)
			.mount(ige.client.uiScene)
			.start();
	},
	
	_onCode: function (data) {
		console.log(data);
		if(data.length > 0) {
			debug.setValue(data.join("\n\n"));
			debug.clearSelection();
			debugContainer.fadeIn(200);
		}
	},
	
	_onChatJoin: function(data) {
		var msgs = "";
		for(var i in data) {
			msgs += "<div>"+ige.client.formatMessage(data[i])+"</div>";
		}
		ige.client.chatBox.html(msgs);
		ige.client.chatBox.scrollTop(ige.client.chatBox.prop('scrollHeight'));
	},
	
	_onChatMessage: function(data) {
		console.log("Got chat message");
		ige.client.chatBox.append("<div>"+ige.client.formatMessage(data)+"</div>");
		ige.client.chatBox.scrollTop(ige.client.chatBox.prop('scrollHeight'));
	},
	
	_onUpdateScore: function(data) {
        blastSound.play();
        if (parseInt(data) > 0) {
            console.log(data);
            console.log(parseInt(data));
            ige.client.scoreText.text(data + ' points');
        }
        else if (parseInt(data)<0){
            console.log(data);
            console.log(parseInt(data));
            scoreb = parseInt(data)*-1;
            ige.client.scoreText2.text(scoreb + ' points');
        }
	},

    _onUpdateTouchScore: function(data) {
        var scores = [];
        for(var i in data)
        {scores.push(data[i]['id'].substring(0,3)+" "+data[i]['score']);}
        ige.client.playerscore.text(scores.join("\n"));
    }

};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }