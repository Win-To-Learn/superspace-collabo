var igeClientConfig = {
	include: [
        './gameClasses/sound.js',
        './gameClasses/login.js',
		/* Your custom game JS scripts */
		'./gameClasses/ClientNetworkEvents.js',

        './gameClasses/Orb.js',
        './gameClasses/Planetoid.js',
		'./gameClasses/Bullet.js',
		'./gameClasses/Player.js',
        './gameClasses/Score.js',
		/* Standard game scripts */

		'./client.js',

		'./index.js'
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeClientConfig; }