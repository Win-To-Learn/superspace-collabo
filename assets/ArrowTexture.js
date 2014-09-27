var image = {
	render: function (ctx, entity) {
		// Draw the player entity
		ctx.fillStyle = 'rgba(0,0,0,0.8)';
		ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
		ctx.beginPath();
        ctx.moveTo(0, -entity._geometry.y);
        ctx.lineTo(entity._geometry.x, entity._geometry.y);
        ctx.lineTo(0, entity._geometry.y - entity._geometry.y2);
        ctx.lineTo(-entity._geometry.x, entity._geometry.y);
        ctx.lineTo(0, -entity._geometry.y);
        ctx.lineTo(0, -entity._geometry.y+20);
        ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
};