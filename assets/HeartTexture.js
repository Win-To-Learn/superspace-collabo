var image = {
	render: function (ctx, entity) {
		// Draw the orb entity
		ctx.fillStyle = 'rgba(0,0,0,0.8)';
		ctx.strokeStyle = '#e371ff';
		ctx.lineWidth = 1/entity._scale.x;




		ctx.beginPath();
		//ctx.moveTo(entity._geometry.x, entity._geometry.y);
        //ctx.lineTo(entity._geometry.x / 2, -entity._geometry.y / 2);
        ctx.lineTo(entity._geometry.x + 200, entity._geometry.y + 250);
        ctx.lineTo(entity._geometry.x + 400, entity._geometry.y);
        ctx.lineTo(entity._geometry.x + 400, entity._geometry.y-50);
        ctx.lineTo(entity._geometry.x + 333, entity._geometry.y-100);
        ctx.lineTo(entity._geometry.x + 266, entity._geometry.y-100);
        ctx.lineTo(entity._geometry.x + 200, entity._geometry.y-30);
        ctx.lineTo(entity._geometry.x + 133, entity._geometry.y-100);
        ctx.lineTo(entity._geometry.x + 66, entity._geometry.y-100);
        ctx.lineTo(entity._geometry.x, entity._geometry.y-50);
        ctx.lineTo(entity._geometry.x, entity._geometry.y);

        //ctx.lineTo(entity._geometry.x, -entity._geometry.y / 2);
        //ctx.lineTo(entity._geometry.x, entity._geometry.y / 2);
        //ctx.lineTo(entity._geometry.x / 2, entity._geometry.y);
        //ctx.lineTo(-entity._geometry.x / 2, entity._geometry.y);
        //ctx.lineTo(-entity._geometry.x, entity._geometry.y / 2);
		//ctx.lineTo(entity._geometry.x*2, entity._geometry.y*2);

		ctx.closePath();
		ctx.fill();
		ctx.stroke();

	}
};