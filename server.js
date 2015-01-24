var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,

	init: function (options) {
		var self = this;
        serverScore = 0;
		ige.timeScale(1);
		ige.debugEnabled(true);

		// Define an object to hold references to our player entities
		this.players = {};
        this.orbs = [];
        this.planetoids = [];
        this.fixedorbreds = [];
        this.fixedorbzs = [];

		// Queue for changes that need to be handled outside the Box2D update method
		this.changeQueue = [];

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
			//.network.start(5000, function () {
            .network.start(7610, function () {
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

						self.spawnOrbs = function() {
							for (var i = 0; i < 15; i++) {
								scale = 1 + Math.random();
								var orb3 = new Orb(scale)
									.translateTo(-4200 + (Math.random()) * 8400, -2400 + (Math.random()) * 4800, 0)
									.rotateTo(0, 0, Math.radians(Math.random() * 360))
							}
						}
						self.spawnOrbs();


						/* ------------------------------------------- *\
										Spawn planetoids
						\* ------------------------------------------- */
						
                        var fixedorbrad = 1.0;

                        self.spawnBoss = function() {
                            var plan1 = new Planetoid(2)
                                //.rotateTo(0, 0, Math.radians(Math.random() * 360))
                                .translateTo(150, 100, 0)
								.velocity.byAngleAndPower(Math.radians(225),0.2);

							var plan2 = new Planetoid(fixedorbrad)
                                //.rotateTo(0, 0, Math.radians(Math.random() * 360))
                                .translateTo(300, 100, 0);

							var plan3 = new Planetoid(fixedorbrad)
                                //.rotateTo(0, 0, Math.radians(Math.random() * 360))
                                .translateTo(400, 100, 0);

							var plan4 = new Planetoid(fixedorbrad)
                                //.rotateTo(0, 0, Math.radians(Math.random() * 360))
                                .translateTo(500, 100, 0)
								.velocity.byAngleAndPower(Math.radians(15),0.4);

							var plan5 = new Planetoid(fixedorbrad)
								//.rotateTo(0, 0, Math.radians(Math.random() * 360))
								.translateTo(0, 100, 0);

							var plan6 = new Planetoid(fixedorbrad)
								//.rotateTo(0, 0, Math.radians(Math.random() * 360))
								.translateTo(-100, 100, 0);

							var plan7 = new Planetoid(fixedorbrad)
								//.rotateTo(0, 0, Math.radians(Math.random() * 360))
								.translateTo(-200, 100, 0)
								.velocity.byAngleAndPower(Math.radians(15),0.4);



							var RevoluteJointDef1 = new ige.box2d.b2RevoluteJointDef(),
								bodyA = plan1._box2dBody,
								bodyB = plan2._box2dBody;

							RevoluteJointDef1.Initialize(
								bodyA,
								bodyB,
								//bodyA.GetWorldCenter(),
								bodyB.GetWorldCenter()
							);

							this._orbRope1 = ige.box2d._world.CreateJoint(RevoluteJointDef1);

							var DistanceJointDef2 = new ige.box2d.b2DistanceJointDef(),
								bodyA = plan2._box2dBody,
								bodyB = plan3._box2dBody;

							DistanceJointDef2.Initialize(
								bodyA,
								bodyB,
								bodyA.GetWorldCenter(),
								bodyB.GetWorldCenter()
							);

							this._orbRope2 = ige.box2d._world.CreateJoint(DistanceJointDef2);

							var DistanceJointDef3 = new ige.box2d.b2DistanceJointDef(),
								bodyA = plan3._box2dBody,
								bodyB = plan4._box2dBody;

							DistanceJointDef3.Initialize(
								bodyA,
								bodyB,
								bodyA.GetWorldCenter(),
								bodyB.GetWorldCenter()
							);

							this._orbRope3 = ige.box2d._world.CreateJoint(DistanceJointDef3);

							var RevoluteJointDef4 = new ige.box2d.b2RevoluteJointDef(),
								bodyA = plan1._box2dBody,
								bodyB = plan5._box2dBody;

							RevoluteJointDef4.Initialize(
								bodyA,
								bodyB,
								bodyA.GetWorldCenter(),
								bodyB.GetWorldCenter()
							);

							this._orbRope4 = ige.box2d._world.CreateJoint(RevoluteJointDef4);

							var DistanceJointDef5 = new ige.box2d.b2DistanceJointDef(),
								bodyA = plan5._box2dBody,
								bodyB = plan6._box2dBody;

							DistanceJointDef5.Initialize(
								bodyA,
								bodyB,
								bodyA.GetWorldCenter(),
								bodyB.GetWorldCenter()
							);

							this._orbRope5 = ige.box2d._world.CreateJoint(DistanceJointDef5);

							var DistanceJointDef6 = new ige.box2d.b2DistanceJointDef(),
								bodyA = plan6._box2dBody,
								bodyB = plan7._box2dBody;

							DistanceJointDef6.Initialize(
								bodyA,
								bodyB,
								bodyA.GetWorldCenter(),
								bodyB.GetWorldCenter()
							);

							this._orbRope6 = ige.box2d._world.CreateJoint(DistanceJointDef6);


                            /*
                            new Planetoid(fixedorbrad)
                                //.rotateTo(0, 0, Math.radians(Math.random() * 360))
                                .translateTo(-700, -500, 0);

                            new Planetoid(fixedorbrad)
                                //.rotateTo(0, 0, Math.radians(Math.random() * 360))
                                .translateTo(-700, 1100, 0);
                            */

                        }
                        //self.spawnOrbs();


                        /*new FixedOrbz(2)
                            .streamMode(1)
                            //.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
                            .rotateTo(0, 0, Math.radians(Math.random() * 360))
                            .translateTo(0, 0, 0);*/
						self.spawnGoals = function() {
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
                        /*
                        new FixedOrbz(4)
                            .streamMode(1)
                            //.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
                            .rotateTo(0, 0, Math.radians(Math.random() * 360))
                            .translateTo(1500, 300, 0);

                        new FixedOrbz(4)
                            .streamMode(1)
                            //.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
                            .rotateTo(0, 0, Math.radians(Math.random() * 360))
                            .translateTo(1500, -300, 0);

                        new FixedOrbz(4)
                            .streamMode(1)
                            //.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
                            .rotateTo(0, 0, Math.radians(Math.random() * 360))
                            .translateTo(-1500, 300, 0);

                        new FixedOrbz(4)
                            .streamMode(1)
                            //.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
                            .rotateTo(0, 0, Math.radians(Math.random() * 360))
                            .translateTo(-1500, -300, 0);
                        */

                        self.spawnRedSpheres = function() {
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

                        /*
                        new FixedOrbRed(2)
                            .streamMode(1)
                            //.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
                            .rotateTo(0, 0, Math.radians(Math.random() * 360))
                            .translateTo(-1200+Math.random()*2400, -600+Math.random()*1200, 0);
                        */

                        /*
                        new FixedOrbRed(2)
                            .streamMode(1)
                            //.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
                            .rotateTo(0, 0, Math.radians(Math.random() * 360))
                            .translateTo(-1200+Math.random()*2400, -600+Math.random()*1200, 0);

                        new FixedOrbRed(2)
                            .streamMode(1)
                            //.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
                            .rotateTo(0, 0, Math.radians(Math.random() * 360))
                            .translateTo(-1200+Math.random()*2400, -600+Math.random()*1200, 0);
						*/
						/* ------------------------------------------- *\
										Contact listeners
						\* ------------------------------------------- */
                        
						ige.box2d.contactListener(
							// Listen for when contact's begin
							function (contact) {
								var A = contact.igeEntityA();
								var B = contact.igeEntityB();
								//console.log('Contact', A.category(), B.category());
                                //var C = contact.igeEntityC();
								//console.log('Contact begins between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);
								if(A.category() == 'planetoid' && B.category() == 'ship') {
									if(!A.touched) {
										B.score++;
										A.exploding = true;
										var tempScores = [];
										for (var i in self.players){
											tempScores.push(
												{'id' : self.players[i].id(), 'score' : self.players[i].score}
											);
										}
										//ige.network.send('updateTouchScore', tempScores);
										console.log('contact with planetoid and ship');
                                        //A.carryOrb(contact.igeEntityByCategory('planetoid'), contact);
									}
								}
                                else if(A.category() == 'fixedorbred' && B.category() == 'ship') {

                                        //ige.network.send('updateTouchScore', tempScores);
                                        console.log('contact with fixedorb and ship');
                                        B.carryOrb(contact.igeEntityByCategory('fixedorbred'), contact);

                                }
								else if(A.category() == 'ship' && B.category() == 'ship') {

									//ige.network.send('updateTouchScore', tempScores);
									console.log('contact with ship and ship');
									//B.carryShip(contact.igeEntityByCategory('ship'), contact);
									A.shape = [

										[1,0],
										[1,-1],
										[0,-1],
										[-1,0],
										[-1,1],
										[0,1]
									];
									B.shape = [

										[1,0],
										[1,-1],
										[0,-1],
										[-1,0],
										[-1,1],
										[0,1]
									];
								}
                                else if (A.category() == 'orb' && B.category() == 'bullet') {
                                    A.exploding = true;
                                    B.destroy();
									ige.network.send('scored', '+'+A.pointWorth+' points!', B.sourceClient);
									self.changeQueue.push({
										action: 'create',
										type: 'FixedOrbz',
										scale: 2,
										translate: {x: A._translate.x, y: A._translate.y}
									});
                                }
                                else if (A.category() == 'fixedorb' && B.category() == 'fixedorb') {
                                    A.carryOrb(contact.igeEntityByCategory('fixedorb'), contact);
                                }
                                else if (A.category() == 'fixedorbred' && B.category() == 'planetoid') {
                                    console.log("red orb and planetoid");
                                    //ige.server.spawnOrbs();
                                    //var newball = new FixedOrbRed(2);
                                        //newball.streamMode(1)
                                        //.translateTo(this._translate.x - -this._geometry.x + this._geometry.x * this.scale, this._translate.y, 0);
                                        //newball.rotateTo(0, 0, Math.radians(Math.random() * 360))
                                        //newball.translateTo(-1200+Math.random()*2400, -600+Math.random()*1200, 0);
                                    if (B.isgoal == true) {

                                        if (B.leftgoal == true) {

                                            console.log("goal should be left");
                                            //A.exploding = true;
                                            //console.log("hey");

                                            //the A. code below crashes the server when you are too close
                                            //to the goals
                                            //A.unMount();
                                            //A._box2dBody.SetAwake(false);
                                            //A._box2dBody.SetActive(false);
                                            A.destroy();
                                            //A._translateTo(-1200+Math.random()*2400, -600+Math.random()*1200, 0);
                                            ige.server.score += 1;
                                            ige.network.send('updateScore', ige.server.score);
                                            //this.respawn();
                                        }
                                        else if (B.leftgoal == false) {
                                            console.log("goal should be right");
                                            //A.exploding = true;
                                            //console.log("hey");
                                            //A.unMount();
                                            //A._box2dBody.SetAwake(false);
                                            //A._box2dBody.SetActive(false);
                                            A.destroy();
                                            //A._translateTo(-1200+Math.random()*2400, -600+Math.random()*1200, 0);
                                            ige.server.score2 -= 1;
                                            ige.network.send('updateScore', ige.server.score2);
                                            //this.respawn();


                                        }
                                    }
                                    else{
                                    //A.carryOrb(contact.igeEntityByCategory('fixedorbred'), contact);
                                    }
                                }
                                else if (A.category() == 'fixedorb' && B.category() == 'fixedorbz') {
                                    A.destroy();
                                    ige.network.send('scored', '+'+A.pointWorth+' points!', B.sourceClient);
                                }
                                else if(A.category() == 'orb' && B.category() == 'ship') {
                                    A.exploding = true;
									B.exploding = true;
                                    //ige.network.send('scored', '+'+A.pointWorth+' points!', B.sourceClient);
                                    ige.network.send('scored', '+'+A.pointWorth+' points!', B.sourceClient);
									console.log("contact with asteroid and ship");
								} else if (A.category() == 'fixedorbz' && B.category() == 'ship') {
									console.log('contact with fixed orbz and ship');
									ige.network.send('code', {label: 'Orb Contact', code: '// Orb contact'},
										A.sourceClient);
								}
							},
							// Listen for when contact's end
							function (contact) {
							}
						);

						/* ------------------------------------------- *\
						                Update physics objects
						/* ------------------------------------------- */

						self.update = function () {
							// Obviously more virtualized than currently necessary
							for (var i = 0, change; change = self.changeQueue[i]; i++) {
								switch (change.action) {
									case 'create':
										switch (change.type) {
											case 'FixedOrbz':
												new FixedOrbz(change.scale)
													.translateTo(change.translate.x, change.translate.y, 0);
												break;
										}
										break;
								}
							}
							self.changeQueue = [];
						};

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