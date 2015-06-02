//var Orb = IgeEntityBox2d.extend({
var Bullet = IgeEntityBox2d.extend({

    classId: 'Bullet',
	
    init: function () {
        //IgeEntityBox2d.prototype.init.call(this);
		IgeEntityBox2d.prototype.init.call(this);
		
		var self = this;
		
		self.liveFor = 2000;
		//self.sourceClient; // the clientId that fired this bullet
		self.createTime = ige._timeScaleLastTimestamp;

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
					categoryBits: 0x0002,
					maskBits: 0x0001 | 0x00ff | 0x0004 | 0x8000 | 0x9000 | 0x0016
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
			
			//console.log(ige);
		}

        this.category('bullet')
            .width(2)
            .height(2);

		self.streamSections(['transform', 'mount', 'color', 'shape']);
    },

	streamSectionData: function (sectionId, data) {
		// Check if the section is one that we are handling
		switch(sectionId) {
			case 'color':
				if (data) {
					this.color = data;
				}
				else {
					return this.color;
				}
				break;
			case 'shape':
				if (data) {
					this.shape = JSON.parse(data);
				}
				else {
					return JSON.stringify(this.shape);
				}
				break;
			default:
				return IgeEntity.prototype.streamSectionData.call(this, sectionId, data);
				break;
		}
	},


    tick: function (ctx) {
		if(ige.isServer) {
			if(ige._timeScaleLastTimestamp - this.createTime > this.liveFor) {
				this.destroy();
			}
		}
		IgeEntity.prototype.tick.call(this, ctx);
    },

	onContact: function (other, contact) {
		switch (other.category()) {
			//case 'planetoid':
			//	if (other.isHydraHead) {
			//		other.destroy();
			//		//ige.network.send('updateTouchScore', tempScores);
			//		console.log('contact with planetoid and bullet');
			//		//A.carryOrb(contact.igeEntityByCategory('planetoid'), contact);
			//	}
			//	else {
			//		other.destroy();
			//	}
			//	return true;
			case 'orb':
				other.exploding = true;
				this.destroy();
				//this.source.score += other.pointWorth;
				//ige.network.send('scored', '+' + other.pointWorth + ' points!', this.source.clientId);
				//ige.network.send('updateScore', this.source.score, this.source.clientId);
				//new FixedOrbz(0.8).translateTo(other._translate.x, other._translate.y, 0);
				return true;
			case 'fixedorbred':

				this.destroy();
				return true;
			default:
				return false;
		}
	}
	
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Bullet; }