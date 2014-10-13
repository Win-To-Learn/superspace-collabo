var image = {
	render: function (ctx, entity) {
		// Draw the orb entity
		ctx.fillStyle = 'rgba(0,0,0,0.8)';
		ctx.strokeStyle = '#e371ff';
		ctx.lineWidth = 2.5/entity._scale.x;
        //ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(-entity._geometry.x, -entity._geometry.y / 2);
		ctx.lineTo(-entity._geometry.x / 2, -entity._geometry.y);
		ctx.lineTo(entity._geometry.x / 2, -entity._geometry.y);
		ctx.lineTo(entity._geometry.x, -entity._geometry.y / 2);
		ctx.lineTo(entity._geometry.x, entity._geometry.y / 2);
		ctx.lineTo(entity._geometry.x / 2, entity._geometry.y);
		ctx.lineTo(-entity._geometry.x / 2, entity._geometry.y);
		ctx.lineTo(-entity._geometry.x, entity._geometry.y / 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
};