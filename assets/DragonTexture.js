var image = {
	render: function (ctx, entity) {


        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        //ctx.strokeStyle = colorstring;


        ctx.strokeStyle = 'rgba(255,0,0,0.8)';
		ctx.lineWidth = 10;


		ctx.beginPath();
		ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
		ctx.moveTo(110,75);
		ctx.arc(75,75,35,0,Math.PI,false);  // Mouth (clockwise)
		ctx.moveTo(65,65);
		ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
		ctx.moveTo(95,65);
		ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
		ctx.stroke();
        ctx.beginPath();


	}
};