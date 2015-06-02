//texture for fixedorbred

var image = {
	render: function (ctx, entity) {
		// Draw the orb entity

		var R = Math.random() * 100,
			r = Math.random() * 100,
			d = Math.random() * 100,
			s = Math.round(Math.random()),
			ti = 1,
			ri = 1,
			t = 0,
			ta = 0,
			dx = 0,
			dy = 0,
			rad = 0,
			rada = 0;
		console.log("R = " + R);
		console.log("r = " + r);
		console.log("d = " + d);
		console.log("s = " + s);

		Math.radians = function(degrees) {
			return degrees * Math.PI / 180;
		}

		function drawHypo(R, r, d, t) {
			ta = t + ti;
			rad = Math.radians(t);
			rada = Math.radians(ta);
			dx = (R - r) * Math.cos(rad) + d * Math.cos((R - r) / r * rad) + 250;
			dy = (R - r) * Math.sin(rad) - d * Math.sin((R - r) / r * rad) + 250;
			dxa = (R - r) * Math.cos(rada) + d * Math.cos((R - r) / r * rada) + 250;
			dya = (R - r) * Math.sin(rada) - d * Math.sin((R - r) / r * rada) + 250;
			ctx.strokeStyle = "hsla(" + t + ", 100%, 50%, 1)";
			ctx.beginPath();
			ctx.moveTo(dx, dy);
			ctx.lineTo(dxa, dya);
			ctx.stroke();
			return;
		}

		function drawEpi(R, r, d, t) {
			ta = t + ti;
			rad = Math.radians(t);
			rada = Math.radians(ta);
			dx = (R + r) * Math.cos(rad) - d * Math.cos((R + r) / r * rad) + 250;
			dy = (R + r) * Math.sin(rad) - d * Math.sin((R + r) / r * rad) + 250;
			dxa = (R + r) * Math.cos(rada) - d * Math.cos((R + r) / r * rada) + 250;
			dya = (R + r) * Math.sin(rada) - d * Math.sin((R + r) / r * rada) + 250;
			ctx.strokeStyle = "hsla(" + t + ", 100%, 50%, 1)";
			ctx.beginPath();
			ctx.moveTo(dx, dy);
			ctx.lineTo(dxa, dya);
			ctx.stroke();
			return;
		}

		function loop() {
			switch (s) {
				case 0:
					drawHypo(R, r, d, t);
					break;
				case 1:
					drawEpi(R, r, d, t);
					break;
				default:
					console.log("var 's' not an accepted value");
					break;
			}
			t += ri;
			//loop();
			//requestAnimationFrame(loop);
			return;
		}
		var cntr = 0;
		for(cntr = 0;cntr<1000;cntr++) {
			loop();

		}



	}
};