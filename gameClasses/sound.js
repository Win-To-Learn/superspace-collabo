/**
 * Created by jonathanmar on 9/27/14.
 */
var thrustSound = new Howl({  urls: ['assets/thrustLoop.mp3', 'assets/thrustLoop.ogg'],
            autoplay: false,  loop: true,  volume: 1});

var chimeSound = new Howl({   urls: ['assets/chime.mp3'],
autoplay: false,  loop: false,  volume: 0.4});

var blastSound = new Howl({  urls: ['assets/blast.mp3'],
autoplay: false,  loop: false,  volume: 0.06});


var laserSound = new Howl({
	urls: ['assets/laser.mp3'],
	volume: 0.1,
	sprite: {
		laser: [0, 200]
	}
});