//var Orb = IgeEntityBox2d.extend({
var Planetoid = IgeEntityBox2d.extend({

    classId: 'Planetoid',
	
    init: function (scale) {
		IgeEntityBox2d.prototype.init.call(this);
		
		var self = this;

        // Set the rectangle colour (this is read in the Rectangle.js smart texture)
        self.color = 'rgb(255,255,0)';
		self.fillColor = 'rgba(255,255,0,0.25)';
		self.touched = false;
		
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
					friction: 1.0,
					restitution: 0.5,
					filter: {
						categoryBits: 0x00ff,
						maskBits: 0xffff & ~0x0008
					},
					shape: {
						type: 'polygon',
						data: self.triangles[i]
					}
				});
			}
			// collision definition END

			self.box2dBody({
				type: 'dynamic',
				linearDamping: 2,
				angularDamping: 2,
				allowSleep: true,
				fixtures: fixDefs,
				fixedRotation: false,
                gravityScale: 0.0,
			});
			
			
			self.addComponent(IgeVelocityComponent)
				.category('planetoid')
				.streamMode(1)
				.mount(ige.server.scene1);
				
			ige.server.planetoids.push(this);
			
		}

        if (!ige.isServer) {
            this.texture(ige.client.textures.planetoid);
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
			if(this.exploding) {
				this.explode();
			}
			else if(!this.touched) {
				this._box2dBody.SetAngularVelocity(-0.4);
			}
		}
		IgeEntity.prototype.tick.call(this, ctx);
    },
	
	explode: function() {
		this.exploding = false;
		this.touched = true;
		this.fillColor = 'rgba(0,255,255,0.35)';
		this.color = 'rgb(0,255,255)';
		ige.server.score += this.pointWorth;
		ige.network.send('updateScore', ige.server.score);
	}
	
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Planetoid; }