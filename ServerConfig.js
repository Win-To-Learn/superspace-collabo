var config = {
	include: [
		{name: 'ServerNetworkEvents', path: './gameClasses/ServerNetworkEvents'},
		{name: 'BasicOrb', path: './gameClasses/BasicOrb'},
		{name: 'Hydra', path: './gameClasses/Hydra'},
		{name: 'Dragon', path: './gameClasses/Dragon'},
        {name: 'Orb', path: './gameClasses/Orb'},
        {name: 'Planetoid', path: './gameClasses/Planetoid'},
        {name: 'FixedOrbRed', path: './gameClasses/FixedOrb4'},
		{name: 'Tree', path: './gameClasses/Tree'},
        {name: 'FixedOrbz', path: './gameClasses/FixedOrb3'},
        {name: 'Bullet', path: './gameClasses/Bullet'},
		{name: 'Player', path: './gameClasses/Player'}

	],
	db: {
		type: 'mysql',
		host: 'localhost',
		user: 'superspace',
		pass: 'collabo',
		dbName: 'superspace'
	}
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = config; }