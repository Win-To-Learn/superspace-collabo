//texture for tree

var image = {
	render: function (ctx, entity) {
		// Draw the orb entity
		ctx.strokeStyle = entity.color;
		ctx.fillStyle = entity.fillColor;
		//ctx.fillStyle = 'rgba(255,0,255,0.35)';
		//ctx.strokeStyle = '#ff0000';
		ctx.lineWidth = 2.5/entity._scale.x;
		//ctx.lineWidth = 5;
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