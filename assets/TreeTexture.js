//texture for tree

var image = {
	render: function (ctx, entity) {
		// Draw the tree entity
		//ctx.fillStyle = 'rgba(0,0,0,0.8)';
		//ctx.strokeStyle = '#e371ff';
		//ctx.lineWidth = 1/entity._scale.x;

		ctx.fillStyle = 'rgba(0,0,0,0.8)';
		ctx.strokeStyle = '#e371ff';
		//ctx.lineWidth = 1/entity._scale.x;

		ctx.lineWidth = 1;
		ctx.beginPath();

		ctx.moveTo(-2.5, -5.0);
		ctx.lineTo(-1.0, -8.0);
		ctx.lineTo(-2.0, -8.0);
		ctx.lineTo(-0.5, -11.0);
		ctx.lineTo(-1.5, -11.0);

		// Top of the tree
		ctx.lineTo(0, -14.0);

		ctx.lineTo(1.5, -11.0);
		ctx.lineTo(0.5, -11.0);
		ctx.lineTo(2.0, -8.0);
		ctx.lineTo(1.0, -8.0);
		ctx.lineTo(2.5, -5.0);

		// Close the path back to its start point
		ctx.closePath();
		ctx.fill();
		ctx.stroke();



	}

};