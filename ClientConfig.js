var igeClientConfig = {
	include: [
        './gameClasses/sound.js',
		/* Your custom game JS scripts */
		'./gameClasses/ClientNetworkEvents.js',

        './gameClasses/Orb.js',
        './gameClasses/FixedOrb.js',
        './gameClasses/FixedOrb4.js',
        './gameClasses/FixedOrb3.js',
		'./gameClasses/Bullet.js',
		'./gameClasses/Player.js',
        './gameClasses/Score.js',
		/* Standard game scripts */

		'./client.js',

		'./index.js'
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeClientConfig; }