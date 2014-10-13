var image = {
	render: function (ctx, entity) {
		// Draw the player entity
		//var id1 = ige.client.id;
        //var red1 = Math.floor((Math.random() * 255) + 1);
        //var red1 = (Math.random() * 255);

        //red1 = String(red1);
        //var colorstring = "'rgba(255, 255, 0";
        //colorstring.concat(red1);
        //str2 = ", 1)'";
        //var str2 = ", 1";
        //colorstring.concat(str2);

        //console.log(red1);
        //console.log(colorstring);

        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        //ctx.strokeStyle = colorstring;


        ctx.strokeStyle = ige.data('player').color;
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