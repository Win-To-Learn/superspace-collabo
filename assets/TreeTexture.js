//texture for tree

var image = {
	render: function (ctx, entity) {
		// Draw the tree entity
		var scale = entity.scale;
		ctx.strokeStyle = entity.color;
		//ctx.lineWidth = 1/entity._scale.x;

		ctx.lineWidth = 1;
		ctx.beginPath();

		function drawBranch (graph, stage) {
			var c;
			for (var i = 0, l = graph.children.length; i < l; i++) {
				c = graph.children[i];
				ctx.moveTo(graph.x, graph.y);
				ctx.lineTo(c.x, c.y);
				if (stage && c.children) {
					drawBranch(c, stage - 1);
				}
			}
		}
		drawBranch(entity.graph, entity.stage);

		//ctx.moveTo(-20, -20);
		//ctx.lineTo(-20, 20);
		//ctx.lineTo(20, 20);
		//ctx.lineTo(20, -20);

		//ctx.moveTo(-entity._geometry.x * scale, -entity._geometry.y * scale / 2);
		//ctx.lineTo(-entity._geometry.x * scale / 2, -entity._geometry.y * scale);
		//ctx.lineTo(entity._geometry.x * scale / 2, -entity._geometry.y * scale);
		//ctx.lineTo(entity._geometry.x * scale, -entity._geometry.y * scale / 2);
		//ctx.lineTo(entity._geometry.x * scale, entity._geometry.y * scale / 2);
		//ctx.lineTo(entity._geometry.x * scale / 2, entity._geometry.y * scale);
		//ctx.lineTo(-entity._geometry.x * scale / 2, entity._geometry.y * scale);
		//ctx.lineTo(-entity._geometry.x * scale, entity._geometry.y * scale / 2);

		ctx.closePath();
		//ctx.fill();
		ctx.stroke();



	}

};