
var Tree = IgeEntityBox2d.extend({

    classId: 'Tree',
	
    init: function (scale, branchFactor, branchDecay, spread, depth) {

		IgeEntityBox2d.prototype.init.call(this);
		var self = this;
		var d2r = Math.PI / 180;

        //self.touched = false;

        // Set the rectangle colour (this is read in the Rectangle.js smart texture)
        //this._rectColor = '#ffc600';
		self.color = 'rgb(0,255,0)';
		self.fillColor = 'rgba(0,255,0,0.25)';

		// TODO: More robust sanitizing
		//scale = scale || 2;
		scale = scale || 2.7;
		//branchFactor = Math.min(5, branchFactor || 2);
		branchFactor = Math.min(5, branchFactor || 3);
		//depth = Math.min(6, depth || 4);
		this.depth = Math.min(7, depth || 5);
		spread = spread || 90;
		if (branchDecay > 1) {
			this.branchDecay = 1 / branchDecay;
		} else if (branchDecay > 0) {
			this.brachDecay = branchDecay;
		} else {
			branchDecay = 0.7;
		}

		this.scale = scale;

		function makeBranch(graph, length, angle, depth) {
			var child;
			if (!graph.children) {
				graph.children = [];
			}
			child = {x: graph.x + length * Math.cos(angle),
				y: graph.y + length * Math.sin(angle)};
			graph.children.push(child);
			if (depth > 0) {
				for (var i = 0; i < branchFactor; i++) {
					makeBranch(child, length * branchDecay,
						angle + start + inc * i, depth - 1);
				}
			} else {
				leaves.push(child);
			}
		}

		if (ige.isServer) {
			var start = -0.5 * d2r * spread;
			var inc = spread * d2r / (branchFactor - 1);
			var leaves = [];

			this.graph = {x: 0, y: 0};
            this.stage = 0;
			makeBranch(this.graph, scale*40, -Math.PI/2, this.depth);
			//console.log(this.graph);

			// Define the polygon for collision
			//var triangles,
			//	fixDefs,
			//	collisionPoly = new IgePoly2d().addPoint(0,0);
			//		//.addPoint(-this._geometry.x * scale, -this._geometry.y * scale / 2)
			//		//.addPoint(-this._geometry.x * scale / 2, -this._geometry.y * scale)
			//		//.addPoint(this._geometry.x * scale / 2, -this._geometry.y * scale)
			//		//.addPoint(this._geometry.x * scale, -this._geometry.y * scale / 2)
			//		//.addPoint(this._geometry.x * scale, this._geometry.y * scale / 2)
			//		//.addPoint(this._geometry.x * scale / 2, this._geometry.y * scale)
			//		//.addPoint(-this._geometry.x * scale / 2, this._geometry.y * scale)
			//		//.addPoint(-this._geometry.x * scale, this._geometry.y * scale / 2)
			//for (i = 0; i < leaves.length; i++) {
			//	collisionPoly.addPoint(leaves[i].x, leaves[i].y);
			//}
			var minx = 100000, miny = 100000, maxx = -100000, maxy = -100000;
			var fixDefs =[], collisionPoly, triangles;

			for (i = 0; i < leaves.length; i++) {
				if (leaves[i].x < minx) {
					minx = leaves[i].x;
				} else if (leaves[i].x > maxx) {
					maxx = leaves[i].x;
				}
				if (leaves[i].y < miny) {
					miny = leaves[i].y;
				} else if (leaves[i].y > maxy) {
					maxy = leaves[i].y;
				}
			}
			//trunk = new IgePoly2d().addPoint(1,0)
			//	.addPoint(1, -scale*40)
			//	.addPoint(-1, -scale*40)
			//	.addPoint(-1, 0)
			//	.divide(ige.box2d._scaleRatio);
			//canopy = new IgePoly2d().addPoint(maxx, maxy)
			//	.addPoint(maxx, miny)
			//	.addPoint(minx, miny)
			//	.addPoint(minx, maxy)
			//	.divide(ige.box2d._scaleRatio);
			collisionPoly = new IgePoly2d().addPoint(-1, 0)
				.addPoint(-1, -scale*40)
				.addPoint(minx, maxy)
				.addPoint(minx, miny)
				.addPoint(maxx, miny)
				.addPoint(maxx, maxy)
				.addPoint(1, -scale*40)
				.addPoint(1, 0)
				.divide(ige.box2d._scaleRatio);

			triangles = collisionPoly.triangulate();

			for (i = 0; i < triangles.length; i++) {
				fixDefs.push({
					density: 0.01,
					friction: 0.2,
					restitution: 0,
					filter: {categoryBits: 0x9000, maskBits: 0xffff | 0x0002 & ~0x0004 & ~0x0016 & ~9000},
					shape: {type: 'polygon', data: triangles[i]}
				});
			}
					
			// Scale the polygon by the box2d scale ratio
			//collisionPoly.divide(ige.box2d._scaleRatio);

			// Now convert this polygon into an array of triangles
			//triangles = collisionPoly.triangulate();
			//self.triangles = triangles;

			// Create an array of box2d fixture definitions
			// based on the triangles
			//fixDefs = [
			//	{
			//		density: 0.01,
			//		friction: 0.2,
			//		restitution: 2.5,
			//		filter: {},
			//		shape: {type: 'polygon', data: trunk}
			//	},
			//	{
			//		density: 0.01,
			//		friction: 0.2,
			//		restitution: 2.5,
			//		filter: {},
			//		shape: {type: 'polygon', data: canopy}
			//	},
			//];
			//for (var i = 0; i < self.triangles.length; i++) {
			//	fixDefs.push({
			//		density: 0.1,
			//		friction: 0.2,
			//		restitution: 2.5,
			//		filter: {
			//			//categoryBits: 0x00ff,
			//			//categoryBits: 0x0008,
			//			//maskBits: 0xffff //& ~0x0008
			//			//categoryBits: 0x0016,
			//			//maskBits: 0xffff & ~0x0008
			//		},
			//		shape: {
			//			type: 'polygon',
			//			data: self.triangles[i]
			//		}
			//	});
			//}
			//// collision definition END

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

            // Age graph for gradual growth
            function ageGraph () {
                self.stage += 1;
                if (self.stage < self.depth) {
                    new IgeTimeout(ageGraph, 500);
                }
            }

            new IgeTimeout(ageGraph, 500);
			
		}

        if (!ige.isServer) {
			this.graph = scale;
            this.texture(ige.client.textures.tree);
        }

        //this.scaleTo(scale,scale,1);
		self.streamSections(['transform', 'color', 'stage']);
		
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
			//case 'graph':
			//	if (data) {
			//		this.graph = JSON.parse(data);
			//	} else {
			//		return JSON.stringify(this.graph);
			//	}
            case 'stage':
                if (data) {
                    this.stage = JSON.parse(data);
                } else {
                    return JSON.stringify(this.stage);
                }
                break;
			default:
				return IgeEntity.prototype.streamSectionData.call(this, sectionId, data);
				break;
		}
	},

	streamCreateData: function () {
		return this.graph;
	},


    update: function (ctx) {
		if (ige.isServer) {

		}
		IgeEntity.prototype.update.call(this, ctx);

	},

	onContact: function (other, contact) {
		switch (other.category()) {
			case 'orb':
				this.destroy();
				return true;
			case 'bullet':
				console.log('bullet hit tree');
				if (this.color != other.color) {
					this.color = other.color;
					//this.destroy();
				}
				return true;



			default:
				return false;
		}

	}
	
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Tree; }