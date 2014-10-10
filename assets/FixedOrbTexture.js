var image = {
	render: function (ctx, entity) {
		// Draw the orb entity
		ctx.fillStyle = 'rgba(255,255,0,0.15)';
		ctx.strokeStyle = '#ffff00';
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