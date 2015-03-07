/**
 * Created by jonathanmar on 9/27/14.
 */
//var thrustSound = new Howl({  urls: ['assets/thrustLoop.mp3', 'assets/thrustLoop.ogg'],
var thrustSound = new Howl({  urls: ['assets/ThrustUp.wav'], autoplay: false,  loop: true,  volume: 1});

var chimeSound = new Howl({  urls: ['assets/chime.mp3'], autoplay: false,  loop: false,  volume: 0.4});


//var blastSound = new Howl({  urls: ['assets/Explosion1.mp3', 'assets/Explosion1.ogg' ],
var blastSound = new Howl({  urls: ['assets/blast.mp3'], autoplay: false,  loop: false,  volume: 0.03});


//var laserSound = new Howl({  urls: ['assets/laser.mp3'],

var laserSound = new Howl({  urls: ['assets/ShortLaser2.wav'],autoplay: false,  loop: true,  volume: 1});

var collectiblesSound = new Howl({  urls: ['assets/Collectables.wav'],autoplay: false,  loop: false,  volume: 1});