//var Orb = IgeEntityBox2d.extend({
var Orb = IgeEntityBox2d.extend({

    classId: 'Bullet',
	
    init: function () {
        //IgeEntityBox2d.prototype.init.call(this);
		IgeEntityBox2d.prototype.init.call(this);
		
		var self = this;
		
		self.liveFor = 1500;

        // Set the rectangle colour (this is read in the Rectangle.js smart texture)
        this._rectColor = '#ffc600';

        if (!ige.isServer) {
            this.texture(ige.client.textures.bullet);
        }
		
		if (ige.isServer) {
		
			// Define the polygon for collision
			var fixDefs = [];
			fixDefs.push({
				density: 0.0,
				friction: 0.0,
				restitution: 0.0,
				isSensor: true,
				filter: {
					categoryBits: 0x0004,
					maskBits: 0x0001
				},
				shape: {
					type: 'circle',
					data: {
						radius: 3
					}
				}
			});
			// collision definition END
			
			this.addComponent(IgeVelocityComponent);

			self.box2dBody({
				type: 'dynamic',
				linearDamping: 2.5,
				angularDamping: 2.5,
				bullet: true,
				isSensor: true,
				allowSleep: true,
				fixtures: fixDefs,
				fixedRotation: true
			});
			
			self.createTime = ige._timeScaleLastTimestamp;
			//console.log(ige);
		}

        this.category('bullet')
            .width(2)
            .height(2);
    },

    tick: function (ctx) {
		if (ige.isServer) {
			if(ige._timeScaleLastTimestamp - this.createTime > this.liveFor) {
				this.destroy();
			}
		}
		IgeEntity.prototype.tick.call(this, ctx);
    }
	
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Orb; }