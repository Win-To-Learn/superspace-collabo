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
        density: 0.1,
        friction: 1.0,
        restitution: 0.5,
        categoryBits: 0x00ff,
        maskBits: 0xffff & ~0x0008
    },

    init: function (scale) {
        BasicOrb.prototype.init.call(this, scale);

        this.category('hydrahead');
    }
});

var Hydra = IgeClass.extend({
    classId: 'Hydra',

    init: function (x, y) {
        this.head = new HydraHead(1.5);

        this.head.translateTo(x, y, 0)
            .streamMode(1)
            .mount(ige.$('scene1'));
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Hydra; }
