var image = {
	render: function (ctx, entity) {
		// Draw the player entity
		ctx.fillStyle = 'rgba(0,0,0,0.8)';
		ctx.strokeStyle = entity.color;
		ctx.lineWidth = 20;
		ctx.beginPath();
		for(var i in entity.shape) {
			if(i == 0) {
				ctx.moveTo(entity._geometry.x * entity.shape[i][0], entity._geometry.y * entity.shape[i][1]);
			}
			else {
				ctx.lineTo(entity._geometry.x * entity.shape[i][0], entity._geometry.y * entity.shape[i][1]);
			}
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
};