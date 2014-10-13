var ExampleEntity = IgeEntity.extend({
	classId: 'ExampleEntity',
	
	init: function () {
        IgeEntity.prototype.init.call(this);

        if (!ige.isServer) {
            this.texture(ige.client.textures.orb)
                .width(50)
                .height(50);
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ExampleEntity; }