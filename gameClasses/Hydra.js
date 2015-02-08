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
        density: 10,
        friction: 1.0,
        restitution: 0.5,
        categoryBits: 0x00ff,
        maskBits: 0xffff & ~0x0008
    },

    init: function (scale) {
        BasicOrb.prototype.init.call(this, scale);

        this.category('hydrahead');
    },

    onContact: function (other, contact) {
        switch (other.category()) {
            case 'bullet':
                console.log('bullet hit hydra head');
                this.destroy();     // Just testing
                break;
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
        density: 2,
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
                console.log('bullet hit hydra arm');
                other.destroy();
                break;
        }
    }

});


var Hydra = IgeClass.extend({
    classId: 'Hydra',

    init: function (x, y) {
        var baseScale = 1.5;
        var pi = Math.PI;
        this.head = new HydraHead(baseScale);

        this.head.translateTo(x, y, 0)
            .streamMode(1)
            .mount(ige.$('scene1'));

        this.arms = [];
        for (var a = 0, angle = pi/4; a < 4; a++, angle += pi/2) {
            var prevBody = this.head;
            for (var r = 1, scaleFactor = 0.8; r <= 3; r++, scaleFactor *= 0.8) {
                var ax = x + r*200*scaleFactor*Math.cos(angle);
                var ay = y + r*200*scaleFactor*Math.sin(angle);
                var arm = new HydraArm(baseScale*scaleFactor)
                    .translateTo(ax, ay, 0)
                    .streamMode(1)
                    .mount(ige.$('scene1'));
                this.arms.push(arm);
                var joint = new ige.box2d.b2RevoluteJointDef();
                joint.Initialize(prevBody._box2dBody, arm._box2dBody, prevBody._box2dBody.GetWorldCenter());
                if (r === 1) {
                    joint.enableMotor = true;
                    joint.motorSpeed = 100*pi;
                    joint.maxMotorTorque = 20000;
                } else {
                    joint.enableLimit = true;
                    joint.lowerAngle = pi/6;
                    joint.upperAngle = pi/6;
                }
                ige.box2d._world.CreateJoint(joint);
                prevBody = arm;
            }
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Hydra; }
