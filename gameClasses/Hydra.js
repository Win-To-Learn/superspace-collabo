var HydraHead = BasicOrb.extend({

    classId: 'HydraHead',
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

        this.category('hydrahead');
        this.dying = false;
    },

    update: function (ctx) {
        if (ige.server && this.dying) {
            // Destroy arms
            for (var i = 0, arm; arm = this.parentHydra.arms[i]; i++) {
                arm.destroy();
            }
            new HydraEgg(this.scale)
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

var HydraArm = BasicOrb.extend({

    classId: 'HydraArm',
    color: '#00ff00',
    textureDef: 'basicPlanetoid',
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

        this.category('hydraarm');
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

var HydraEgg = BasicOrb.extend({

    classId: 'HydraEgg',
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

        this.category('hydraegg');

        this.pointWorth = 200;
    }

})

var Hydra = IgeClass.extend({
    classId: 'Hydra',

    init: function (x, y) {
        var baseScale = 1.5;
        var pi = Math.PI;
        this.head = new HydraHead(baseScale);
        this.head.parentHydra = this;

        this.head.translateTo(x, y, 0)
            .streamMode(1)
            .mount(ige.$('scene1'));

        this.arms = [];
        var innerArms = [];
        for (var a = 0, angle = pi/4; a < 4; a++, angle += pi/2) {
            var prevBody = this.head;
            //for (var r = 1, scaleFactor = 0.8; r <= 6; r++, scaleFactor *= 0.8) {
			for (var r = 1, scaleFactor = 1.5; r <= 4; r++, scaleFactor *= 0.8) {
                var ax = x + r*200*Math.sqrt(scaleFactor)*Math.cos(angle);
                var ay = y + r*200*Math.sqrt(scaleFactor)*Math.sin(angle);
                var arm = new HydraArm(baseScale*scaleFactor)
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



if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Hydra; }
