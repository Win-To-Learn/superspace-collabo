var image = {
	render: function (ctx, entity) {
		// Draw the player entity
		ctx.strokeStyle = entity.color;
		ctx.fillStyle = entity.color;
		//ctx.fillStyle = 'rgba(0,0,0,0.8)';
		//ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
		ctx.beginPath();
		ctx.arc(0,0,entity._geometry.x,0,2*Math.PI);
		ctx.fill();
        ctx.lineWidth = 2;
		ctx.stroke();
	}
};