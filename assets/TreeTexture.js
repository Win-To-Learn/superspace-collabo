//texture for tree

var image = {
	render: function (ctx, entity) {
		// Draw the tree entity
		var scale = entity.scale;
		ctx.strokeStyle = entity.color;
		//ctx.lineWidth = 1/entity._scale.x;

		ctx.lineWidth = 1;
		ctx.beginPath();

		function drawBranch (graph) {
			var c;
			for (var i = 0, l = graph.children.length; i < l; i++) {
				c = graph.children[i];
				ctx.moveTo(graph.x, graph.y);
				ctx.lineTo(c.x, c.y);
				if (c.children) {
					drawBranch(c);
				}
			}
		}

		// Testing
		var g = {x: 0, y: 0, children: [
			{x: -40, y: 40, children: [
				{x: -50, y: 70}, {x: -30, y:70}
			]},
			{x: 40, y: 40, children: [
				{x: 50, y: 70}, {x: 30, y: 70}
			]}
		]};

		drawBranch(entity.graph);

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