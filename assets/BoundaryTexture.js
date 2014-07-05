var image = {
	render: function (ctx, entity) {
		ctx.strokeStyle = 'rgb(255,255,255)';
		ctx.lineWidth = 2;
		ctx.fillStyle = 'rgba(150,150,150,0.1)';
		ctx.beginPath();
		ctx.rect(-entity._geometry.x2, -entity._geometry.y2, entity._geometry.x, entity._geometry.y);
		//ctx.moveTo(-entity._geometry.x, -entity._geometry.y);
		//ctx.lineTo(entity._geometry.x, -entity._geometry.y);
		//ctx.lineTo(entity._geometry.x, entity._geometry.y);
		//ctx.lineTo(-entity._geometry.x, entity._geometry.y);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}
};