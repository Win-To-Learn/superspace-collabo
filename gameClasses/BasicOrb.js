var BasicOrb = IgeEntityBox2d.extend({

    classId: 'BasicOrb',
	color: '#00ff00',
	textureDef: 'basicOrb',
	physics: {
		type: 'dynamic',
		linearDamping: 2,
		angularDamping: 2,
		allowSleep: true,
		fixedRotation: false,
		gravityScale: 0.0,
		density: 0.1,
		friction: 1.0,
		restitution: 0.5,
		categoryBits: 0x00ff,
		maskBits: 0xffff & ~0x0008
	},

    init: function (scale) {
		IgeEntityBox2d.prototype.init.call(this);
		
		var self = this;
		
		if(arguments.length < 1) {
			scale = 2;
		}
		self.scale = scale;

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
					density: this.physics.density,
					friction: this.physics.friction,
					restitution: this.physics.restitution,
					filter: {
						categoryBits: this.physics.categoryBits,
						maskBits: this.physics.maskBits
					},
					shape: {
						type: 'polygon',
						data: self.triangles[i]
					}
				});
			}
			// collision definition END
		
			//self._thrustPower = 8*scale;

			self.box2dBody({
				type: this.physics.type,
				linearDamping: this.physics.linearDamping,
				angularDamping: this.physics.angularDamping,
				allowSleep: this.physics.allowSleep,
				fixtures: fixDefs,
				fixedRotation: this.physics.fixedRotation,
				gravityScale: this.physics.gravityScale
			});
		}

        if (!ige.isServer) {
            this.texture(ige.client.textures[this.textureDef]);
        }

        this.scaleTo(scale,scale,1);
		
    }
	
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = BasicOrb; }