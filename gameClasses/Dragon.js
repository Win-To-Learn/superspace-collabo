var DragonHead = BasicOrb.extend({

    classId: 'DragonHead',
    color: '#ffff00',
    textureDef: 'basicPlanetoid',
    physics: {
        type: 'dynamic',
        linearDamping: 2,
        angularDamping: 2,
        allowSleep: true,
        fixedRotation: false,
        gravityScale: 0.0,
        density: 100,
        friction: 1.0,
        restitution: 0.5,
        categoryBits: 0x00ff,
        maskBits: 0xffff & ~0x0008
    },

    init: function (scale) {
        BasicOrb.prototype.init.call(this, scale);

        this.category('dragonhead');
        this.dying = false;
		this.neworb = "";
    },

    update: function (ctx) {
        if (ige.server && this.dying) {
            // Destroy arms
            for (var i = 0, arm; arm = this.parentDragon.arms[i]; i++) {
                arm.destroy();
            }
            new DragonEgg(this.scale)
                .translateTo(this._translate.x, this._translate.y, 0)
                .streamMode(1)
                .mount(ige.$('scene1'));
            this.destroy();
            this.dying = false
        }

        IgeEntity.prototype.update.call(this, ctx);
    },

    onContact: function (other, contact) {
        switch (other.category()) {
            case 'bullet':
                this.dying = true;
                return true;
            default:
                return false;
        }
    }
});

var DragonArm = BasicOrb.extend({

    classId: 'DragonArm',
    color: '#00ff00',
    textureDef: 'dragon',
    physics: {
        type: 'dynamic',
        linearDamping: 2,
        angularDamping: 2,
        allowSleep: true,
        fixedRotation: false,
        gravityScale: 0.0,
        density: 4,
        friction: 1.0,
        restitution: 0.5,
        categoryBits: 0x00ff,
        maskBits: 0xffff & ~0x0008
    },

    init: function (scale) {
        BasicOrb.prototype.init.call(this, scale);

        this.category('dragonarm');
    },

    onContact: function (other, contact) {
        switch (other.category()) {
            case 'bullet':
                other.destroy();
                return true;
            case 'ship':
                other.exploding = true;
                return true;
            default:
                return false;
        }
    }

});

var DragonEgg = BasicOrb.extend({

    classId: 'DragonEgg',
    color: '#ff1493',
    textureDef: 'basicPlanetoid',
    physics: {
        type: 'dynamic',
        linearDamping: 2,
        angularDamping: 2,
        allowSleep: true,
        fixedRotation: false,
        gravityScale: 0.0,
        density: 0.1,
        friction: 1.0,
        restitution: 0.5,
        categoryBits: 0x00ff,
        maskBits: 0xffff & ~0x0008
    },

    init: function (scale) {
        BasicOrb.prototype.init.call(this, scale);

        this.category('dragonegg');

        this.pointWorth = 200;
    }

})

var Dragon = IgeClass.extend({
	classId: 'Dragon',

	init: function (x, y) {
		var baseScale = 3.5;
		var pi = Math.PI;
		this.head = new DragonHead(baseScale);
		this.head.parentDragon = this;

		this.head.translateTo(x, y, 0)
			.streamMode(1)
			.mount(ige.$('scene1'));

		this.arms = [];
		var innerArms = [];
		for (var a = 0, angle = pi/4; a < 1; a++, angle += pi/2) {
			var prevBody = this.head;
			//for (var r = 1, scaleFactor = 0.8; r <= 6; r++, scaleFactor *= 0.8) {
			for (var r = 1, scaleFactor = 1.5; r <= 1; r++, scaleFactor *= 0.8) {
				var ax = x + r*200*Math.sqrt(scaleFactor)*Math.cos(angle);
				var ay = y + r*200*Math.sqrt(scaleFactor)*Math.sin(angle);
				var arm = new DragonArm(baseScale*scaleFactor)
					.translateTo(ax, ay, 0)
					.streamMode(1)
					.mount(ige.$('scene1'));
				this.arms.push(arm);
				var joint = new ige.box2d.b2RevoluteJointDef();
				joint.Initialize(prevBody._box2dBody, arm._box2dBody, prevBody._box2dBody.GetWorldCenter());
				if (r === 1) {
					joint.enableMotor = true;
					//joint.motorSpeed = 1000*pi;
					//joint.maxMotorTorque = 50000;
					joint.motorSpeed = 6000*pi;
					joint.maxMotorTorque = 600000;
				} else {
					joint.enableLimit = true;
					joint.lowerAngle = pi/6;
					joint.upperAngle = pi/6;
					innerArms.push(arm);
				}

				//var moveInterval = setInterval(function(){
				//	if (this.neworb) {
				//		this.neworb.destroy();
				//	}
				//	this.neworb = new Orb(1.5)
				//		.translateTo(ax,ay,0)
				//		.velocity.byAngleAndPower(Math.radians(Math.random()*225),2)
				//		//.color = 'rgb(50,155,0)'
				//		//.fillColor = 'rgba(0,155,50,0.35)';
				//	//put the conditional statement under here
                //
                //
				//}, 800);
				ige.box2d._world.CreateJoint(joint);
				prevBody = arm;
			}
		}
		// Keep arms separated - maybe tweak later
		//for (var i = 0, j = 1, l = innerArms.length; i < l; i++, j = (i + 1) % l) {
		//    joint = new ige.box2d.b2DistanceJointDef();
		//    joint.Initialize(innerArms[i]._box2dBody, innerArms[j]._box2dBody,
		//        innerArms[i]._box2dBody.GetWorldCenter(), innerArms[j]._box2dBody.GetWorldCenter());
		//    joint.frequencyHz = 5;
		//    joint.dampingRatio = 0.5;
		//    ige.box2d._world.CreateJoint(joint);
		//}
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Dragon; }
