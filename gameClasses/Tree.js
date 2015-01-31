
var Tree = IgeEntityBox2d.extend({

    classId: 'Tree',
	
    init: function (scale) {
		IgeEntityBox2d.prototype.init.call(this);
		
		var self = this;

        //self.touched = false;

        // Set the rectangle colour (this is read in the Rectangle.js smart texture)
        //this._rectColor = '#ffc600';
		self.color = 'rgb(255,0,0)';
		self.fillColor = 'rgba(0,255,0,0.25)';


		
		if(arguments.length < 1) {
			scale = 2;
		}
		self.scale = scale;
		self.pointWorth = Math.round(Math.pow(1/self.scale,2)*100);
		self.exploding = false;
		
		if (ige.isServer) {
			// Define the polygon for collision
			var triangles,
				fixDefs,
				collisionPoly = new IgePoly2d()
					.addPoint(-this._geometry.x * scale, -this._geometry.y * scale / 2)
					.addPoint(-this._geometry.x * scale / 2, -this._geometry.y * scale)
					.addPoint(this._geometry.x * scale / 2, -this._geometry.y * scale)
					.addPoint(this._geometry.x * scale, -this._geometry.y * scale / 2)
					.addPoint(this._geometry.x * scale, this._geometry.y * scale / 2)
					.addPoint(this._geometry.x * scale / 2, this._geometry.y * scale)
					.addPoint(-this._geometry.x * scale / 2, this._geometry.y * scale)
					.addPoint(-this._geometry.x * scale, this._geometry.y * scale / 2)
					
			// Scale the polygon by the box2d scale ratio
			collisionPoly.divide(ige.box2d._scaleRatio);

			// Now convert this polygon into an array of triangles
			triangles = collisionPoly.triangulate();
			self.triangles = triangles;

			// Create an array of box2d fixture definitions
			// based on the triangles
			fixDefs = [];

			for (var i = 0; i < self.triangles.length; i++) {
				fixDefs.push({
					density: 0.1,
					friction: 0.2,
					restitution: 2.5,
					filter: {
						//categoryBits: 0x00ff,
						//categoryBits: 0x0008,
						//maskBits: 0xffff //& ~0x0008
						//categoryBits: 0x0016,
						//maskBits: 0xffff & ~0x0008
					},
					shape: {
						type: 'polygon',
						data: self.triangles[i]
					}
				});
			}
			// collision definition END

		
			self._thrustPower = 0.01*scale;

			self.box2dBody({
                //isSensor: true,
				type: 'dynamic',
				linearDamping: 0.5,
				angularDamping: 0,
				allowSleep: true,
				fixtures: fixDefs,
				fixedRotation: false,
                gravityScale: 0.0
			});
			
			
			self.addComponent(IgeVelocityComponent)
				.category('tree')
				.streamMode(1)
				//.mount(ige.$('scene1'));
				.mount(ige.server.scene1);

				
			ige.server.trees.push(this);
			
		}

        if (!ige.isServer) {
            this.texture(ige.client.textures.tree);
        }

        this.scaleTo(scale,scale,1);
		self.streamSections(['transform', 'color']);
		
    },

	streamSectionData: function (sectionId, data) {
		// Check if the section is one that we are handling
		switch(sectionId) {
			case 'color':
				if (data) {
					var s = JSON.parse(data);
					this.color = s[0];
					this.fillColor = s[1];
				}
				else {
					return JSON.stringify([this.color,this.fillColor]);
				}
				break;
			default:
				return IgeEntity.prototype.streamSectionData.call(this, sectionId, data);
				break;
		}
	},




    tick: function (ctx) {
		if (ige.isServer) {



		}
		IgeEntity.prototype.tick.call(this, ctx);


	}

	
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Tree; }