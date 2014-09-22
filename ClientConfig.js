var igeClientConfig = {
	include: [
		/* Your custom game JS scripts */
		'./gameClasses/ClientNetworkEvents.js',
        './gameClasses/Orb.js',
        './gameClasses/FixedOrb.js',
		'./gameClasses/Bullet.js',
		'./gameClasses/Player.js',
        './gameClasses/Score.js',
		/* Standard game scripts */
		'./client.js',
		'./index.js'
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeClientConfig; }