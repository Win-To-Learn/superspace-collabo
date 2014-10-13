var image = {
	render: function (ctx, entity) {
		// Draw the orb entity
		ctx.fillStyle = 'rgba(255,0,255,0.35)';
		ctx.strokeStyle = '#ff0000';
		ctx.lineWidth = 2.5/entity._scale.x;
        //ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(-entity._geometry.x, -entity._geometry.y / 2);//pt 1 10 oclock
		ctx.lineTo(-entity._geometry.x / 2, -entity._geometry.y);//pt 2 7 oclock



		ctx.lineTo(entity._geometry.x / 2, -entity._geometry.y);//pt 3 6:30
		ctx.lineTo(entity._geometry.x, -entity._geometry.y / 2);//pt 4 5:30
		ctx.lineTo(entity._geometry.x, entity._geometry.y / 2);//pt 5 4:00
		ctx.lineTo(entity._geometry.x / 2, entity._geometry.y);//pt 6 2:00
		ctx.lineTo(-entity._geometry.x / 2, entity._geometry.y);//pt 7 1:00
		ctx.lineTo(-entity._geometry.x, entity._geometry.y / 2);//pt 8 0:30

		ctx.closePath();
        //ctx.lineTo(entity._geometry.x, entity._geometry.y / 2);//pt 5 4:00
        ctx.lineTo(entity._geometry.x, -entity._geometry.y / 2);//pt 4 5:30
        ctx.lineTo(-entity._geometry.x / 2, -entity._geometry.y);//pt 2 7 oclock


        ctx.moveTo(-entity._geometry.x / 2, -entity._geometry.y);//move to pt2
        //ctx.lineTo(entity._geometry.x / 2, entity._geometry.y);//pt 6 2:00
        ctx.lineTo(entity._geometry.x, entity._geometry.y / 2);//pt 5 4:00
        ctx.lineTo(-entity._geometry.x / 2, -entity._geometry.y);//pt 2 7 oclock

        ctx.moveTo(entity._geometry.x / 2, -entity._geometry.y);//move to pt3
        //ctx.lineTo(-entity._geometry.x / 2, entity._geometry.y);//pt 7 1:00
        ctx.lineTo(entity._geometry.x / 2, entity._geometry.y);//pt 6 2:00
        ctx.lineTo(-entity._geometry.x / 2, -entity._geometry.y);//pt 2 7 oclock

        ctx.moveTo(entity._geometry.x, -entity._geometry.y / 2);//move to pt4
        //ctx.lineTo(-entity._geometry.x, entity._geometry.y / 2);//pt 8 0:30
        ctx.lineTo(-entity._geometry.x / 2, entity._geometry.y);//pt 7 1:00
        ctx.lineTo(-entity._geometry.x / 2, -entity._geometry.y);//pt 2 7 oclock

        ctx.moveTo(entity._geometry.x, entity._geometry.y / 2);//move to pt 5 4:00
        ctx.lineTo(-entity._geometry.x, entity._geometry.y / 2);//pt 8 0:30
        ctx.lineTo(-entity._geometry.x / 2, -entity._geometry.y);//pt 2 7 oclock

        ctx.moveTo(entity._geometry.x / 2, entity._geometry.y);//move to pt 6 2:00
        ctx.lineTo(-entity._geometry.x, -entity._geometry.y / 2);//pt 1 10 oclock
        ctx.lineTo(-entity._geometry.x / 2, -entity._geometry.y);//pt 2 7 oclock

        ctx.moveTo(-entity._geometry.x / 2, entity._geometry.y);//move to pt 7 1:00
        ctx.lineTo(-entity._geometry.x / 2, -entity._geometry.y);//pt 2 7 oclock
        ctx.lineTo(-entity._geometry.x / 2, -entity._geometry.y);//pt 2 7 oclock

        ctx.moveTo(-entity._geometry.x, entity._geometry.y / 2);//move pt 8 0:30
        ctx.lineTo(entity._geometry.x / 2, -entity._geometry.y);//pt 3 6:30
        ctx.lineTo(-entity._geometry.x / 2, -entity._geometry.y);//pt 2 7 oclock


		ctx.fill();
		ctx.stroke();
	}
};