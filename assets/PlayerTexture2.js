var image = {
	render: function (ctx, entity) {
		// Draw the player entity
		ctx.fillStyle = 'rgba(0,0,0,0.8)';
		ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
		ctx.lineWidth = 10;


        ctx.beginPath();
        //ctx.arc(0,0,entity._geometry.x*1.2,0,2*Math.PI);
        //ctx.fill();
        //ctx.lineWidth = 2;
        //ctx.stroke();




		ctx.moveTo(0, -entity._geometry.y*1.7);//top point
		ctx.lineTo(entity._geometry.x, entity._geometry.y);//lower right
        ctx.arc(0,0,entity._geometry.x,Math.PI,2*Math.PI);
		ctx.lineTo(0, entity._geometry.y - entity._geometry.y2);
		ctx.lineTo(-entity._geometry.x, entity._geometry.y);
		ctx.lineTo(0, -entity._geometry.y*1.7);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
};