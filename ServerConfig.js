var config = {
	include: [
		{name: 'ServerNetworkEvents', path: './gameClasses/ServerNetworkEvents'},
        {name: 'Orb', path: './gameClasses/Orb'},
        {name: 'FixedOrb', path: './gameClasses/FixedOrb'},
        {name: 'FixedOrbz', path: './gameClasses/FixedOrb3'},
        {name: 'Bullet', path: './gameClasses/Bullet'},
		{name: 'Player', path: './gameClasses/Player'}

	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = config; }