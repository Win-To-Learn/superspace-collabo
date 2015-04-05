var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,

	init: function (options) {
		var self = this;
        serverScore = 0;
		ige.timeScale(1);
		ige.debugEnabled(true);
		this.tempScores = [];

		// Define an object to hold references to our player entities
		this.players = {};
        this.orbs = [];
        this.planetoids = [];
        this.fixedorbreds = [];
		this.trees = [];
        this.fixedorbzs = [];

		// Add the server-side game methods / event handlers
		this.implement(ServerNetworkEvents);

        ige.addComponent(IgeBox2dComponent)
            .box2d.sleep(true)
            .box2d.createWorld()
            .box2d.mode(0)
           	.box2d.start();

		/* ------------------------------------------- *\
						Database
							
			Please create a mysql user
			'superspace'@'localhost' with
			the password that's set in ServerConfig.js
			and a database 'superspace' that
			our user has permissions to use.
			
			Permissions for the user required
			SELECT, INSERT, UPDATE, DELETE
			CREATE, ALTER, INDEX
		\* ------------------------------------------- */
		/*
		self.tables = { // type, null, key, default, extra
			'users' : {
				'id' : ['int(11)', 'NO', 'PRI', null, 'auto_increment'],
				'clientId' : ['text', 'YES', '', null, ''],
				'username' : ['text', 'YES', '', null, ''],
				'username_safe' : ['text', 'YES', '', null, ''],
				'password' : ['text', 'YES', '', null, ''],
				'color' : ['text', 'YES', '', null, '']
			}
		}
		ige.addComponent(IgeMySqlComponent, options.db).mysql.connect(function (err, db) {
			ige.mysql.userTableDef = "CREATE TABLE `users` ( `id` INT NOT NULL AUTO_INCREMENT, `username` TEXT NULL, `password` TEXT NULL, `username_safe` TEXT NULL, `password` TEXT NULL, `color` TEXT NULL DEFAULT NULL, PRIMARY KEY (`id`) ) COLLATE='utf8_bin' ENGINE=InnoDB;";
			if (!err) {
				console.log('*                      Database connection sucessful                         *');
				// Check table structures
				ige.mysql.tablesOk = true;
				for(var i in self.tables) {
					self.tables[i].tableOk = true;
					if(self.tables[i] !== undefined) {
						var def = self.tables[i];
						ige.mysql.query("DESCRIBE "+i, function(err, rows, fields) {
							if(!err) {
								for(var k in rows) {
									var fieldData = rows[k];
									if(def[rows[k].Field] !== undefined) {
										def[fieldData.Field][5] = true;
										if(def[fieldData.Field][0] == fieldData.Type) {  } else { console.log("* Error: Table '"+i+"', Column '"+rows[k].Field+"', [type] attribute mismatch, expected '"+def[fieldData.Field][0]+"', database has '"+fieldData.Type+"'"); tableOk = false; }
										if(def[fieldData.Field][1] == fieldData.Null) {  } else { console.log("* Error: Table '"+i+"', Column '"+rows[k].Field+"', [null] attribute mismatch, expected '"+def[fieldData.Field][1]+"', database has '"+fieldData.Null+"'"); tableOk = false; }
										if(def[fieldData.Field][2] == fieldData.Key) {  } else { console.log("* Error: Table '"+i+"', Column '"+rows[k].Field+"', [key] attribute mismatch, expected '"+def[fieldData.Field][2]+"', database has '"+fieldData.Key+"'"); tableOk = false; }
										if(def[fieldData.Field][3] == fieldData.Default) {  } else { console.log("* Error: Table '"+i+"', Column '"+rows[k].Field+"', [default] attribute mismatch, expected '"+def[fieldData.Field][3]+"', database has '"+fieldData.Default+"'"); tableOk = false; }
										if(def[fieldData.Field][4] == fieldData.Extra) {  } else { console.log("* Error: Table '"+i+"', Column '"+rows[k].Field+"', [extra] attribute mismatch, expected '"+def[fieldData.Field][4]+"', database has '"+fieldData.Extra+"'"); tableOk = false; }
									}
									else {
										self.tables[i].tableOk = false;
										console.log("* Error: Table '"+i+"', Column '"+rows[k].Field+"' not defined in table definition");
									}
								}
							}
							else {
								self.tables[i].tableOk = false;
								console.log("* Error: failed to get table definition for "+i, err);
							}
							for(var k in def) {
								if(typeof(def[k]) !== "boolean" && def[k][5] === undefined) {
									self.tables[i].tableOk = false;
									console.log("* Error: Table '"+i+"', Column '"+k+"' not found in database");
								}
							}
							if(!self.tables[i].tableOk) { ige.mysql.tablesOk = false; }
							var allOk = true;
							for(var l in self.tables) {
								if(!self.tables[l].tableOk) { allOk = false; }
							}
							if(allOk) { ige.emit('tablesOk'); }
						});
					}
					else {
						self.tables[i].tableOk = false;
						console.log("* Error: Table definition to check against not found for table '"+i+"'");
					}
					if(!self.tables[i].tableOk) { ige.mysql.tablesOk = false; }
				}
				ige.on('tablesOk', function() {
					ige.mysql.query('SELECT * FROM users', function (err, rows, fields) {
						if (!err) { // users table found and successfully accessed
							var count = rows.length;
							console.log('*'+Array(29-count.toString().length).join(" ")+''+count+' users have registered                          *');
							console.log('------------------------------------------------------------------------------');
							ige.emit('mysqlReady');
						} else if(err.code == "ER_TABLEACCESS_DENIED_ERROR") { // user table found but permissions error
							console.log("Error while accessing users table, permission denied");
							console.log('------------------------------------------------------------------------------');
						} else if(err.code == "ER_NO_SUCH_TABLE") { // user table not found
									console.log('*                 Users table not found, creating it now                     *');
							ige.mysql.query(ige.mysql.userTableDef, function(err, rows, fields) {
								if(!err) {
									console.log('*                    Users table successfully created                        *');
									ige.emit('mysqlReady');
								}
								else {
									console.log('* Error creating users table', err);
								}
							console.log('------------------------------------------------------------------------------');
							});
						}
						else {
							console.log('* Error', err);
							console.log('------------------------------------------------------------------------------');
						}
					});
				});
			} else {
				switch(err.code) {
					case "ER_ACCESS_DENIED_ERROR":
						console.log("User access denied!");
						console.log("Have you created the mysql user? Config in ServerConfig.js");
						console.log(err);
						break;
					case "ER_DBACCESS_DENIED_ERROR":
						console.log("Database access denied!");
						console.log("Have you created the database itself and granted permissions to it?");
						break;
					default:
						console.log(err);
				}
			}
		});

		*/
		/* ------------------------------------------- *\
						Game itself
		\* ------------------------------------------- */
		//ige.on('mysqlReady', function() {
		// Add the networking component
		//ige.addComponent(IgeNetIoComponent)
		ige.addComponent(IgeNetIoComponent)
			// Start the network server
			.network.start(7610, function () {
            //.network.start(7610, function () {
				// Networking has started so start the game engine
				ige.start(function (success) {
					// Check if the engine started successfully
					if (success) {
						console.log("Server now accepting connections");
                        // Create some network commands we will need
                        ige.network.define('login', self._onLogin);
                        ige.network.define('loginSuccessful');
                        ige.network.define('loginDenied');
                        ige.network.define('playerEntity', self._onPlayerEntity);
                        ige.network.define('chatJoin', self._onChatJoin);
                        ige.network.define('chatMessage', self._onChatMessage);
                        ige.network.define('scored');
						ige.network.define('exploded');
						//ige.network.define('fixedorbzContact');
                        ige.network.define('updateScore');
                        ige.network.define('updateTouchScore');
                        ige.network.define('code', self._onCode);
                        ige.network.define('bulletEntity', self._onBulletEntity);
                        ige.network.define('playerControlLeftDown', self._onPlayerLeftDown);
                        ige.network.define('playerControlRightDown', self._onPlayerRightDown);
                        ige.network.define('playerControlThrustDown', self._onPlayerThrustDown);
                        ige.network.define('playerControlDownDown', self._onPlayerDownDown);
                        ige.network.define('playerControlShootDown', self._onPlayerShootDown);
                        ige.network.define('playerControlTurnDown', self._onPlayerTurnDown);

                        ige.network.define('playerControlLeftUp', self._onPlayerLeftUp);
                        ige.network.define('playerControlRightUp', self._onPlayerRightUp);
                        ige.network.define('playerControlThrustUp', self._onPlayerThrustUp);
                        ige.network.define('playerControlDownUp', self._onPlayerDownUp);
                        ige.network.define('playerControlShootUp', self._onPlayerShootUp);
                        ige.network.define('playerControlTurnUp', self._onPlayerTurnUp);

                        ige.network.on('connect', self._onPlayerConnect); // Defined in ./gameClasses/ServerNetworkEvents.js
                        ige.network.on('disconnect', self._onPlayerDisconnect); // Defined in ./gameClasses/ServerNetworkEvents.js

                        // Add the network stream component
                        ige.network.addComponent(IgeStreamComponent)
                            .stream.sendInterval(30) // Send a stream update once every 30 milliseconds
                            .stream.start(); // Start the stream

                        // Accept incoming network connections
                        ige.network.acceptConnections(true);

						// Create chat buffer
						self.chatBuffer = [];
						
						/* ------------------------------------------- *\
											Create the scene
						\* ------------------------------------------- */
						
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
						
						self.score = 0;
                        self.score2 = 0;
						
						/* ------------------------------------------- *\
										Spawn asteroids
						\* ------------------------------------------- */

						self.spawnOrbs = function spawnOrbs () {
							for (var i = 0; i < 15; i++) {
								scale = 1 + Math.random();
								var orb3 = new Orb(scale)
									.translateTo(-4200 + (Math.random()) * 8400, -2400 + (Math.random()) * 4800, 0)
									.rotateTo(0, 0, Math.radians(Math.random() * 360))
							}
						}
						self.spawnOrbs();

						//var tree1 = new Tree(1);
						/* ------------------------------------------- *\
										Spawn planetoids
						\* ------------------------------------------- */
						
                        var fixedorbrad = 1.5;

						new Hydra(3000, -2000);

						new Dragon(3000, 2000);

						self.spawnGoals = function spawnGoals () {
							var goal1 = new Planetoid(4)
								.streamMode(1)
								//.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
								.rotateTo(0, 0, Math.radians(Math.random() * 360))
								.translateTo(1000, 0, 0);

							goal1.color = 'rgb(0,255,0)';
							goal1.fillColor = 'rgba(0,255,0,0.35)';
							goal1.isgoal = true;
							goal1.leftgoal = false;
							//goal1.goalnum = 0;

							var goal2 = new Planetoid(4)
								.streamMode(1)
								//.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
								.rotateTo(0, 0, Math.radians(Math.random() * 360))
								.translateTo(-1000, 0, 0)

							goal2.color = 'rgb(255,255,0)';
							goal2.fillColor = 'rgba(255,255,0,0.35)';
							goal2.isgoal = true;
							goal2.leftgoal = true;
							//goal2.goalnum = -1;
						}
                        self.spawnRedSpheres = function spawnRedSpheres () {
                            for (int1 = 0; int1 < 2; int1++) {
                                new FixedOrbRed(1.5)
                                    .streamMode(1)
                                    //.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
                                    .rotateTo(0, 0, Math.radians(Math.random() * 360))
                                    .translateTo(-800 + Math.random() * 600, -1300 + Math.random() * 2600, 0);
                            }
                            for (int1 = 0; int1 < 1; int1++) {
                                new FixedOrbRed(1.5)
                                    .streamMode(1)
                                    //.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
                                    .rotateTo(0, 0, Math.radians(Math.random() * 360))
                                    .translateTo(200 + Math.random() * 600, -1300 + Math.random() * 2600, 0);
                            }
                        }
                        //self.spawnRedSpheres();

						/* ------------------------------------------- *\
										Contact listeners
						\* ------------------------------------------- */
						ige.box2d.contactListener(
							// Listen for when contact's begin
							function myContactListener (contact) {
								var A = contact.igeEntityA();
								var B = contact.igeEntityB();
								// Try calling A's collision handler on B; if not handled, try the other way
								if (!A.onContact || !A.onContact(B, contact)) {
									if (B.onContact) {
										B.onContact(A, contact);
									}
								}
							},
							// Listen for when contact's end
							function (contact) {
							}
						);

						ige.box2d.updateCallback(self.update);
						
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
							console.log('rgba('+colors[0]+','+colors[1]+','+colors[2]+',1)');
							return 'rgba('+colors[0]+','+colors[1]+','+colors[2]+',1)';
						}
						
					}
				});
			});
		//}); // mysqlReady
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }