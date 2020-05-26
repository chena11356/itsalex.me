/*jshint unused: false, undef: true */
/*global blockSize: false */

// ----- utils ----- //

const THICKNESS_EXTRATHICK = 60;
const THICKNESS_THICK = 46; 
const THICKNESS_MEDTHICK = 34;
const THICKNESS_MEDIUM = 23; 
const THICKNESS_MEDTHIN = 17;
const THICKNESS_THIN = 10;
const COLOR_BLACK = '#3c3d3d'; 
const COLOR_DARKER_BLACK = '#232424';
const COLOR_YELLOW = '#fffe5b';
const COLOR_ORANGE = '#ff813d';

// extends objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

function modulo( num, div ) {
  return ( ( num % div ) + div ) % div;
}

function normalizeAngle( angle ) {
  return modulo( angle, Math.PI * 2 );
}

function getDegrees( angle ) {
  return angle * ( 180 / Math.PI );
}



// --------------------------  -------------------------- //

function line( ctx, a, b ) {
  ctx.beginPath();
  ctx.moveTo( a.x, a.y );
  ctx.lineTo( b.x, b.y );
  ctx.stroke();
  ctx.closePath();
}

/*jshint browser: true, undef: true, unused: true */

// -------------------------- vector -------------------------- //

function Vector( x, y ) {
  this.x = x || 0;
  this.y = y || 0;
}

Vector.prototype.set = function( v ) {
  this.x = v.x;
  this.y = v.y;
};

Vector.prototype.setCoords = function( x, y ) {
  this.x = x;
  this.y = y;
};

Vector.prototype.add = function( v ) {
  this.x += v.x;
  this.y += v.y;
};

Vector.prototype.subtract = function( v ) {
  this.x -= v.x;
  this.y -= v.y;
};

Vector.prototype.scale = function( s )  {
  this.x *= s;
  this.y *= s;
};

Vector.prototype.multiply = function( v ) {
  this.x *= v.x;
  this.y *= v.y;
};

// custom getter whaaaaaaat
Object.defineProperty( Vector.prototype, 'magnitude', {
  get: function() {
    return Math.sqrt( this.x * this.x  + this.y * this.y );
  }
});

Vector.prototype.equals = function ( v ) {
  return this.x == v.x && this.y == v.y;
};

Vector.prototype.zero = function() {
  this.x = 0;
  this.y = 0;
};

Vector.prototype.block = function( size ) {
  this.x = Math.floor( this.x / size );
  this.y = Math.floor( this.y / size );
};

Object.defineProperty( Vector.prototype, 'angle', {
  get: function() {
    return normalizeAngle( Math.atan2( this.y, this.x ) );
  }
});

// ----- class functions ----- //
// return new vectors

Vector.subtract = function( a, b ) {
  return new Vector( a.x - b.x, a.y - b.y );
};

Vector.add = function( a, b ) {
  return new Vector( a.x + b.x, a.y + b.y );
};

Vector.copy = function( v ) {
  return new Vector( v.x, v.y );
};

Vector.isSame = function( a, b ) {
  return a.x == b.x && a.y == b.y;
};

Vector.getDistance = function( a, b ) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt( dx * dx + dy * dy );
};

Vector.addDistance = function( vector, distance, angle ) {
  var x = vector.x + Math.cos( angle ) * distance;
  var y = vector.y + Math.sin( angle ) * distance;
  return new Vector( x, y );
};

// --------------------------  -------------------------- //


// -------------------------- Particle -------------------------- //


function Particle( x, y ) {
  this.position = new Vector( x, y );
  this.previousPosition = new Vector( x, y );
}

Particle.prototype.update = function( friction, gravity ) {
  var velocity = Vector.subtract( this.position, this.previousPosition );
  // friction
  velocity.scale( friction );
  this.previousPosition = Vector.copy( this.position );
  this.position.add( velocity );
  this.position.add( gravity );
};

// --------------------------  -------------------------- //

Particle.prototype.render = function( ctx ) {
  // big circle
  ctx.fillStyle = 'hsla(0, 0%, 10%, 0.5)';
  circle( ctx, this.position.x, this.position.y, 4 );
  // dot
  // ctx.fillStyle = 'hsla(0, 100%, 50%, 0.5)';
  // circle( this.position.x, this.position.y, 5  );
};

function circle( ctx, x, y, radius ) {
  ctx.beginPath();
  ctx.arc( x, y, radius, 0, Math.PI * 2 );
  ctx.fill();
  ctx.closePath();
}

// --------------------------  -------------------------- //


function StickConstraint( particleA, particleB, distance ) {
  this.particleA = particleA;
  this.particleB = particleB;
  if ( distance ) {
    this.distance = distance;
  } else {
    var delta = Vector.subtract( particleA.position, particleB.position );
    this.distance = delta.magnitude;
  }

  this.distanceSqrd = this.distance * this.distance;
}

StickConstraint.prototype.update = function() {
  var delta = Vector.subtract( this.particleA.position, this.particleB.position );
  var mag = delta.magnitude;
  var scale = ( this.distance - mag ) / mag * 0.5;
  delta.scale( scale );
  this.particleA.position.add( delta );
  this.particleB.position.subtract( delta );
};

StickConstraint.prototype.render = function( ctx ) {
  ctx.strokeStyle = 'hsla(200, 100%, 50%, 0.5)';
  ctx.lineWidth = 2;
  line( ctx, this.particleA.position, this.particleB.position );
};
// --------------------------  -------------------------- //

function PinConstraint( particle, position ) {
  this.particle = particle;
  this.position = position;
}

PinConstraint.prototype.update = function() {
  this.particle.position = Vector.copy( this.position );
};

PinConstraint.prototype.render = function() {};


// --------------------------  -------------------------- //

function SpringAngleConstraint( particleA, particleB, strength, angle ) {
  this.particleA = particleA;
  this.particleB = particleB;
  this.strength = strength;
  if ( angle === undefined ) {
    var delta = Vector.subtract( particleB.position, particleA.position );
    this.angle = delta.angle;
  } else {
    this.angle = angle;
  }
}

SpringAngleConstraint.prototype.update = function() {
  var positionA = this.particleA.position;
  var positionB = this.particleB.position;
  var delta = Vector.subtract( positionB, positionA );
  var deltaAngle = delta.angle;
  var angleDiff = normalizeAngle( this.angle - deltaAngle );
  angleDiff = angleDiff > Math.PI ? angleDiff - Math.PI * 2 : angleDiff;
  var springAngle = deltaAngle + Math.PI / 2;
  var springForce = new Vector( Math.cos( springAngle ), Math.sin( springAngle ) );
  springForce.scale( angleDiff * this.strength * Math.PI * 2 );
  this.particleB.position.add( springForce );
};

SpringAngleConstraint.prototype.render = function( ctx ) {
  var end = Vector.addDistance( this.particleA.position, 50, this.angle );
  ctx.strokeStyle = 'hsla(0, 0%, 50%, 0.5)';
  line( ctx, this.particleA.position, end );
};


// --------------------------  -------------------------- //

function ChainLinkConstraint( particleA, particleB, distance, shiftEase ) {
  this.particleA = particleA;
  this.particleB = particleB;
  this.distance = distance;
  this.distanceSqrd = distance * distance;
  this.shiftEase = shiftEase === undefined ? 0.85 : shiftEase;
}

ChainLinkConstraint.prototype.update = function() {
  var delta = Vector.subtract( this.particleA.position, this.particleB.position );
  var deltaMagSqrd = delta.x * delta.x + delta.y * delta.y;

  if ( deltaMagSqrd <= this.distanceSqrd ) {
    return;
  }
  var newPosition = Vector.addDistance( this.particleA.position, this.distance, delta.angle + Math.PI );
  var shift = Vector.subtract( newPosition, this.particleB.position );
  shift.scale( this.shiftEase );
  this.particleB.previousPosition.add( shift );
  this.particleB.position.set( newPosition );
};

ChainLinkConstraint.prototype.render = function( ctx ) {
  ctx.strokeStyle = 'hsla(200, 100%, 50%, 0.5)';
  ctx.lineWidth = 2;
  line( ctx, this.particleA.position, this.particleB.position );
};

function line( ctx, a, b ) {
  ctx.beginPath();
  ctx.moveTo( a.x, a.y );
  ctx.lineTo( b.x, b.y );
  ctx.stroke();
  ctx.closePath();
}

// --------------------------  -------------------------- //

function StickConstraint( particleA, particleB, distance ) {
  this.particleA = particleA;
  this.particleB = particleB;
  if ( distance ) {
    this.distance = distance;
  } else {
    var delta = Vector.subtract( particleA.position, particleB.position );
    this.distance = delta.magnitude;
  }

  this.distanceSqrd = this.distance * this.distance;
}

StickConstraint.prototype.update = function() {
  var delta = Vector.subtract( this.particleA.position, this.particleB.position );
  var mag = delta.magnitude;
  var scale = ( this.distance - mag ) / mag * 0.5;
  delta.scale( scale );
  this.particleA.position.add( delta );
  this.particleB.position.subtract( delta );
};

StickConstraint.prototype.render = function( ctx ) {
  ctx.strokeStyle = 'hsla(200, 100%, 50%, 0.5)';
  ctx.lineWidth = 2;
  line( ctx, this.particleA.position, this.particleB.position );
};

// --------------------------  -------------------------- //

// x, y
// angle
// springStrength
// curl
// segmentLength
// friction
// gravity
// movementStrength
// thickness
// color
function Follicle( props ) {
  extend( this, props );
  delete this.x;
  delete this.y;
  this.particleA = new Particle( props.x, props.y );
  var positionB = Vector.addDistance( this.particleA.position, this.segmentLength, this.angle );
  this.particleB = new Particle( positionB.x, positionB.y );
  this.stick0 = new StickConstraint( this.particleA, this.particleB );
  this.springAngle0 = new SpringAngleConstraint( this.particleA, this.particleB, this.springStrength, this.angle );

  var angle1 = this.angle + this.curl;
  var positionC =  Vector.addDistance( this.particleB.position, this.segmentLength, angle1 );
  this.particleC = new Particle( positionC.x, positionC.y );
  this.stick1 = new StickConstraint( this.particleB, this.particleC );
  this.springAngle1 = new SpringAngleConstraint( this.particleB, this.particleC, this.springStrength, angle1 );

}

Follicle.prototype.update = function() {
  this.particleA.update( this.friction, this.gravity );
  this.particleB.update( this.friction, this.gravity );
  this.particleC.update( this.friction, this.gravity );
  this.stick0.update();
  this.springAngle0.update();
  // update springAngle1's angle
  var delta = Vector.subtract( this.particleB.position, this.particleA.position );
  this.springAngle1.angle = delta.angle + this.curl;

  this.stick1.update();
  this.springAngle1.update();
};

Follicle.prototype.addMovement = function( movement ) {
  movement.scale( this.movementStrength );
  this.particleB.position.add( movement );
  this.particleC.position.add( movement );
  this.particleB.previousPosition.add( movement );
  this.particleC.previousPosition.add( movement );
};

Follicle.prototype.render = function( ctx, thickness, color ) {

  ctx.lineWidth = thickness;
  // ctx.strokeStyle = 'hsla(0, 100%, 50%, 0.4)';
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo( this.particleA.position.x, this.particleA.position.y );
  ctx.quadraticCurveTo( this.particleB.position.x, this.particleB.position.y,
    this.particleC.position.x, this.particleC.position.y );
  ctx.stroke();
  ctx.closePath();
  // reset line props
  ctx.lineCap = 'butt';
  ctx.lineWidth = 1;
};

// --------------------------  -------------------------- //

function Ribbon( props ) {
  extend( this, props );

  // create particles

  this.particles = [];
  this.constraints = [];
  
  this.controlParticle = new Particle( this.controlPoint.x, this.controlPoint.y );
  var pin = new PinConstraint( this.controlParticle, this.controlPoint );
  this.constraints.push( pin );

  var x = this.controlPoint.x;
  for ( var i=0; i < this.sections; i++ ) {
    var y = this.controlPoint.y + this.sectionLength * i;
    var particle = new Particle( x, y );
    this.particles.push( particle );
    // create links
    var linkParticle = i === 0 ? this.controlParticle : this.particles[ i-1 ];
    var link = new ChainLinkConstraint( linkParticle, particle, this.sectionLength, this.chainLinkShiftEase );
    this.constraints.push( link );
  }
}

Ribbon.prototype.update = function() {
  var i, len;
  for ( i=0, len = this.particles.length; i < len; i++ ) {
    this.particles[i].update( this.friction, this.gravity );
  }

  for ( i=0, len = this.constraints.length; i < len; i++ ) {
    this.constraints[i].update();
  }
  for ( i=0, len = this.constraints.length; i < len; i++ ) {
    this.constraints[i].update();
  }
};


Ribbon.prototype.render = function( ctx ) {

  ctx.strokeStyle = '#d916d9';
  ctx.lineWidth = this.width;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo( this.controlParticle.x, this.controlParticle.y );
  for ( var i=0, len = this.particles.length; i < len; i++ ) {
    var particle = this.particles[i];
    ctx.lineTo( particle.position.x, particle.position.y );
  }
  ctx.stroke();
  ctx.closePath();
  ctx.lineWidth = 1;

};

// --------------------------  -------------------------- //

var canvas = document.querySelector('#canvas-header');
var body = document.querySelector('html');
var ctx = canvas.getContext('2d');
var w = canvas.width = window.innerWidth - 0;
var h = canvas.height = window.innerHeight - 0;

canvas.addEventListener( 'mousedown', onMousedown, false );
var rect = canvas.getBoundingClientRect();
console.log(body.scrollTop);
console.log(body.scrollLeft);
canvasOffsetLeft = rect.left + body.scrollLeft;
canvasOffsetTop = rect.top + body.scrollTop;

// --------------------------  -------------------------- //

var friction = 0.75;
var frictionMore = 0.75;
var gravity = new Vector( 0, 0.4 );
var gravityMore = new Vector( 0, 0.7); 
var movementStrength = 0.9;
var movementStrengthLess = 0.5; 
var springStrength = 0.5;
var springStrengthMore = 1; 

var follicles = [];
var front_follicles = [];
var folliclesB = [];
var front_folliclesB = [];
var folliclesC = []; 
var front_folliclesC = []; 
var pins = [];

const ADJUST_X = 0;
const ADJUST_Y = 0;

//#region Asian woman hair

var controlPoint1 = new Vector( 147, 160 );
var follicle1 = new Follicle({
  x: controlPoint1.x,
  y: controlPoint1.y,
  thickness: THICKNESS_MEDIUM,
  color: COLOR_BLACK,
  segmentLength: 0,
  angle: 0,
  curl: 0,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
follicles.push( follicle1 );

var pin1 = new PinConstraint( follicle1.particleA, controlPoint1 );
pins.push( pin1 );

var controlPoint2 = new Vector( 160, 190 );
var follicle2 = new Follicle({
  x: controlPoint2.x,
  y: controlPoint2.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_BLACK,
  segmentLength: 77,
  angle: 1.6,
  curl: 0,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
follicles.push( follicle2 );
var control2Delta = Vector.subtract( controlPoint2, controlPoint1 );
var pin2 = new PinConstraint( follicle2.particleA, controlPoint2 );
pins.push( pin2 );

var controlPoint3 = new Vector( 160, 190 );
var follicle3 = new Follicle({
  x: controlPoint3.x,
  y: controlPoint3.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_BLACK,
  segmentLength: 77,
  angle: 2,
  curl: -0.3,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
follicles.push( follicle3 );
var control3Delta = Vector.subtract( controlPoint3, controlPoint1 );
var pin3 = new PinConstraint( follicle3.particleA, controlPoint3 );
pins.push( pin3 );

var controlPoint4 = new Vector( 160, 190 );
var follicle4 = new Follicle({
  x: controlPoint4.x,
  y: controlPoint4.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_BLACK,
  segmentLength: 77,
  angle: 1.2,
  curl: 0.3,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
follicles.push( follicle4 );
var control4Delta = Vector.subtract( controlPoint4, controlPoint1 );
var pin4 = new PinConstraint( follicle4.particleA, controlPoint4 );
pins.push( pin4 );

var controlPoint5 = new Vector( 160, 185 );
var follicle5 = new Follicle({
  x: controlPoint5.x,
  y: controlPoint5.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_BLACK,
  segmentLength: 80,
  angle: 0.9,
  curl: 0.65,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
follicles.push( follicle5 );
var control5Delta = Vector.subtract( controlPoint5, controlPoint1 );
var pin5 = new PinConstraint( follicle5.particleA, controlPoint5 );
pins.push( pin5 );

var controlPoint6 = new Vector( 160, 180 );
var follicle6 = new Follicle({
  x: controlPoint6.x,
  y: controlPoint6.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_BLACK,
  segmentLength: 80,
  angle: 0.75,
  curl: 0.7,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
follicles.push( follicle6 );
var control6Delta = Vector.subtract( controlPoint6, controlPoint1 );
var pin6 = new PinConstraint( follicle6.particleA, controlPoint6 );
pins.push( pin6 );

var controlPoint7 = new Vector( 180, 170 );
var follicle7 = new Follicle({
  x: controlPoint7.x,
  y: controlPoint7.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_BLACK,
  segmentLength: 80,
  angle: 0.75,
  curl: 0.75,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
follicles.push( follicle7 );
var control7Delta = Vector.subtract( controlPoint7, controlPoint1 );
var pin7 = new PinConstraint( follicle7.particleA, controlPoint7 );
pins.push( pin7 );

// middle bottom
var controlPoint8 = new Vector( 200, 150 );
var follicle8 = new Follicle({
  x: controlPoint8.x,
  y: controlPoint8.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_BLACK,
  segmentLength: 80,
  angle: 0.75,
  curl: 0.8,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
follicles.push( follicle8 );
var control8Delta = Vector.subtract( controlPoint8, controlPoint1 );
pins.push( new PinConstraint( follicle8.particleA, controlPoint8 ) );

var controlPoint9 = new Vector( 160, 185 );
var follicle9 = new Follicle({
  x: controlPoint9.x,
  y: controlPoint9.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_BLACK,
  segmentLength: 80,
  angle: -4,
  curl: -0.5,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
follicles.push( follicle9 );
var control9Delta = Vector.subtract( controlPoint9, controlPoint1 );
pins.push( new PinConstraint( follicle9.particleA, controlPoint9 ) );

var controlPoint10 = new Vector( 140, 180 );
var follicle10 = new Follicle({
  x: controlPoint10.x,
  y: controlPoint10.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_BLACK,
  segmentLength: 80,
  angle: -3.85,
  curl: -0.6,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
follicles.push( follicle10 );
var control10Delta = Vector.subtract( controlPoint10, controlPoint1 );
pins.push( new PinConstraint( follicle10.particleA, controlPoint10 ) );

var controlPoint11 = new Vector( 120, 170 );
var follicle11 = new Follicle({
  x: controlPoint11.x,
  y: controlPoint11.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_BLACK,
  segmentLength: 80,
  angle: -3.8,
  curl: -0.7,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
follicles.push( follicle11 );
var control11Delta = Vector.subtract( controlPoint11, controlPoint1 );
pins.push( new PinConstraint( follicle11.particleA, controlPoint11 ) );

var controlPoint12 = new Vector( 100, 150 );
var follicle12 = new Follicle({
  x: controlPoint12.x,
  y: controlPoint12.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_BLACK,
  segmentLength: 80,
  angle: -3.75,
  curl: -0.8,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
follicles.push( follicle12 );
var control12Delta = Vector.subtract( controlPoint12, controlPoint1 );
pins.push( new PinConstraint( follicle12.particleA, controlPoint12 ) );

// Front follicle! 
var controlPoint13 = new Vector( 175, 132 );
var follicle13 = new Follicle({
  x: controlPoint13.x,
  y: controlPoint13.y,
  thickness: THICKNESS_THIN,
  color: COLOR_BLACK,
  segmentLength: 52,
  angle: 75.8,
  curl: 1.5,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
front_follicles.push( follicle13 );
var control13Delta = Vector.subtract( controlPoint13, controlPoint1 );
pins.push( new PinConstraint( follicle13.particleA, controlPoint13 ) );

// Front follicle again! 
var controlPoint14 = new Vector( 175, 132 );
var follicle14 = new Follicle({
  x: controlPoint14.x,
  y: controlPoint14.y,
  thickness: THICKNESS_THIN,
  color: COLOR_BLACK,
  segmentLength: 48,
  angle: 75.5,
  curl: 1.5,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
front_follicles.push( follicle14 );
var control14Delta = Vector.subtract( controlPoint14, controlPoint1 );
pins.push( new PinConstraint( follicle14.particleA, controlPoint14 ) );

// Front follicle again! 
var controlPoint15 = new Vector( 175, 132 );
var follicle15 = new Follicle({
  x: controlPoint15.x,
  y: controlPoint15.y,
  thickness: THICKNESS_THIN,
  color: COLOR_BLACK,
  segmentLength: 25,
  angle: 75.2,
  curl: 0.85,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
front_follicles.push( follicle15 );
var control15Delta = Vector.subtract( controlPoint15, controlPoint1 );
pins.push( new PinConstraint( follicle15.particleA, controlPoint15 ) );

// Side front follicle! 
var controlPoint16 = new Vector( 127, 147 );
var follicle16 = new Follicle({
  x: controlPoint16.x,
  y: controlPoint16.y,
  thickness: THICKNESS_MEDTHIN,
  color: COLOR_BLACK,
  segmentLength: 70,
  angle: 9,
  curl: -0.85,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
front_follicles.push( follicle16 );
var control16Delta = Vector.subtract( controlPoint16, controlPoint1 );
pins.push( new PinConstraint( follicle16.particleA, controlPoint16 ) );

// Side front follicle! 
var controlPoint17 = new Vector( 127, 147 );
var follicle17 = new Follicle({
  x: controlPoint17.x,
  y: controlPoint17.y,
  thickness: THICKNESS_MEDTHIN,
  color: COLOR_BLACK,
  segmentLength: 65,
  angle: 8.95,
  curl: -1.05,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
front_follicles.push( follicle17 );
var control17Delta = Vector.subtract( controlPoint17, controlPoint1 );
pins.push( new PinConstraint( follicle17.particleA, controlPoint17 ) );

// Side front follicle! 
var controlPoint18 = new Vector( 123, 150 );
var follicle18 = new Follicle({
  x: controlPoint18.x,
  y: controlPoint18.y,
  thickness: THICKNESS_MEDTHIN,
  color: COLOR_BLACK,
  segmentLength: 52,
  angle: 9.2,
  curl: -0.85,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
front_follicles.push( follicle18 );
var control18Delta = Vector.subtract( controlPoint18, controlPoint1 );
pins.push( new PinConstraint( follicle18.particleA, controlPoint18 ) );

//#endregion

//#region Black woman hair

var controlPointB1 = new Vector( 147, 160 );
var follicleB1 = new Follicle({
  x: controlPointB1.x,
  y: controlPointB1.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 0,
  angle: -1.75,
  curl: 1.17,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB1 );

var pinB1 = new PinConstraint( follicleB1.particleA, controlPointB1 );
pins.push( pinB1 );



var controlPointB0 = new Vector( 112 + ADJUST_X, 110 + ADJUST_Y );
var follicleB0 = new Follicle({
  x: controlPointB0.x,
  y: controlPointB0.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 54,
  angle: -1.75,
  curl: 1.17,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB0 );
var controlB0Delta = Vector.subtract( controlPointB0, controlPointB1 );
var pinB0 = new PinConstraint( follicleB0.particleA, controlPointB0 );
pins.push( pinB0 );




var controlPointB2 = new Vector( 140 + ADJUST_X, 100 + ADJUST_Y );
var follicleB2 = new Follicle({
  x: controlPointB2.x,
  y: controlPointB2.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 63,
  angle: -1.33,
  curl: 1.15,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB2 );
var controlB2Delta = Vector.subtract( controlPointB2, controlPointB1 );
var pinB2 = new PinConstraint( follicleB2.particleA, controlPointB2 );
pins.push( pinB2 );

var controlPointB3 = new Vector( 165 + ADJUST_X, 105 + ADJUST_Y );
var follicleB3 = new Follicle({
  x: controlPointB3.x,
  y: controlPointB3.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 54,
  angle: -1.05,
  curl: 1.15,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB3 );
var controlB3Delta = Vector.subtract( controlPointB3, controlPointB1 );
var pinB3 = new PinConstraint( follicleB3.particleA, controlPointB3 );
pins.push( pinB3 );

var controlPointB4 = new Vector( 178 + ADJUST_X, 113 + ADJUST_Y );
var follicleB4 = new Follicle({
  x: controlPointB4.x,
  y: controlPointB4.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 52,
  angle: -0.63,
  curl: 1.15,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB4 );
var controlB4Delta = Vector.subtract( controlPointB4, controlPointB1 );
var pinB4 = new PinConstraint( follicleB4.particleA, controlPointB4 );
pins.push( pinB4 );

var controlPointB5 = new Vector( 185 + ADJUST_X, 130 + ADJUST_Y );
var follicleB5 = new Follicle({
  x: controlPointB5.x,
  y: controlPointB5.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 46,
  angle: -0.29,
  curl: 1.15,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB5 );
var controlB5Delta = Vector.subtract( controlPointB5, controlPointB1 );
var pinB5 = new PinConstraint( follicleB5.particleA, controlPointB5 );
pins.push( pinB5 );

var controlPointB6 = new Vector( 180 + ADJUST_X, 152 + ADJUST_Y );
var follicleB6 = new Follicle({
  x: controlPointB6.x,
  y: controlPointB6.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 40,
  angle: 0.05,
  curl: 1.15,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB6 );
var controlB6Delta = Vector.subtract( controlPointB6, controlPointB1 );
var pinB6 = new PinConstraint( follicleB6.particleA, controlPointB6 );
pins.push( pinB6 );

var controlPointB7 = new Vector( 160 + ADJUST_X, 166 + ADJUST_Y );
var follicleB7 = new Follicle({
  x: controlPointB7.x,
  y: controlPointB7.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 30,
  angle: 0.45,
  curl: 0.8,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB7 );
var controlB7Delta = Vector.subtract( controlPointB7, controlPointB1 );
var pinB7 = new PinConstraint( follicleB7.particleA, controlPointB7 );
pins.push( pinB7 );

// middle bottom
var controlPointB8 = new Vector( 145 + ADJUST_X, 166 + ADJUST_Y );
var follicleB8 = new Follicle({
  x: controlPointB8.x,
  y: controlPointB8.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 26,
  angle: Math.PI / 2,
  curl: 0,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB8 );
var controlB8Delta = Vector.subtract( controlPointB8, controlPointB1 );
pins.push( new PinConstraint( follicleB8.particleA, controlPointB8 ) );

// compare to 7
var controlPointB9 = new Vector( 130 + ADJUST_X, 166 + ADJUST_Y );
var follicleB9 = new Follicle({
  x: controlPointB9.x,
  y: controlPointB9.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 30,
  angle: 2.7,
  curl: -0.8,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB9 );
var controlB9Delta = Vector.subtract( controlPointB9, controlPointB1 );
pins.push( new PinConstraint( follicleB9.particleA, controlPointB9 ) );

// compare to 6
var controlPointB10 = new Vector( 118 + ADJUST_X, 152 + ADJUST_Y );
var follicleB10 = new Follicle({
  x: controlPointB10.x,
  y: controlPointB10.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 46,
  angle: 3.20,
  curl: -1.15,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB10 );
var controlB10Delta = Vector.subtract( controlPointB10, controlPointB1 );
pins.push( new PinConstraint( follicleB10.particleA, controlPointB10 ) );

// compare to 5
var controlPointB11 = new Vector( 105 + ADJUST_X, 130 + ADJUST_Y );
var follicleB11 = new Follicle({
  x: controlPointB11.x,
  y: controlPointB11.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 46,
  angle: -2.8,
  curl: -1.15,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB11 );
var controlB11Delta = Vector.subtract( controlPointB11, controlPointB1 );
pins.push( new PinConstraint( follicleB11.particleA, controlPointB11 ) );

// compare to 4
var controlPointB12 = new Vector( 120 + ADJUST_X, 105 + ADJUST_Y );
var follicleB12 = new Follicle({
  x: controlPointB12.x,
  y: controlPointB12.y,
  thickness: THICKNESS_THICK,
  color: COLOR_DARKER_BLACK,
  segmentLength: 52,
  angle: -2.5,
  curl: -1.15,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesB.push( follicleB12 );
var controlB12Delta = Vector.subtract( controlPointB12, controlPointB1 );
pins.push( new PinConstraint( follicleB12.particleA, controlPointB12 ) );

//#endregion

//#region Fred hair

var controlPointC1 = new Vector( 147, 160 );
var follicleC1 = new Follicle({
  x: controlPointC1.x,
  y: controlPointC1.y,
  thickness: THICKNESS_MEDIUM,
  color: COLOR_YELLOW,
  segmentLength: 0,
  angle: 0,
  curl: 0,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesC.push( follicleC1 );

var pinC1 = new PinConstraint( follicleC1.particleA, controlPointC1 );
pins.push( pinC1 );

var controlPointC2 = new Vector( 130, 100 );
var follicleC2 = new Follicle({
  x: controlPointC2.x,
  y: controlPointC2.y,
  thickness: THICKNESS_EXTRATHICK,
  color: COLOR_YELLOW,
  segmentLength: 25,
  angle: 0,
  curl: -1,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength + 0.3,
  movementStrength: movementStrengthLess
});
front_folliclesC.push( follicleC2 );
var controlC2Delta = Vector.subtract( controlPointC2, controlPointC1 );
var pinC2 = new PinConstraint( follicleC2.particleA, controlPointC2 );
pins.push( pinC2 );

var controlPointC3 = new Vector( 190, 100 );
var follicleC3 = new Follicle({
  x: controlPointC3.x,
  y: controlPointC3.y,
  thickness: THICKNESS_THICK,
  color: COLOR_YELLOW,
  segmentLength: 10,
  angle: 0,
  curl: -1,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
front_folliclesC.push( follicleC3 );
var controlC3Delta = Vector.subtract( controlPointC3, controlPointC1 );
var pinC3 = new PinConstraint( follicleC3.particleA, controlPointC3 );
pins.push( pinC3 );

var controlPointC4 = new Vector( 105, 105 );
var follicleC4 = new Follicle({
  x: controlPointC4.x,
  y: controlPointC4.y,
  thickness: THICKNESS_THICK,
  color: COLOR_YELLOW,
  segmentLength: 10,
  angle: 1.8,
  curl: 0.5,
  friction: friction,
  gravity: gravityMore,
  springStrength: springStrength,
  movementStrength: movementStrength
});
front_folliclesC.push( follicleC4 );
var controlC4Delta = Vector.subtract( controlPointC4, controlPointC1 );
var pinC4 = new PinConstraint( follicleC4.particleA, controlPointC4 );
pins.push( pinC4 );

var controlPointC5 = new Vector( 165, 210 );
var follicleC5 = new Follicle({
  x: controlPointC5.x,
  y: controlPointC5.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_ORANGE,
  segmentLength: 15,
  angle: 1,
  curl: -0.5,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesC.push( follicleC5 );
var controlC5Delta = Vector.subtract( controlPointC5, controlPointC1 );
var pinC5 = new PinConstraint( follicleC5.particleA, controlPointC5 );
pins.push( pinC5 );

var controlPointC6 = new Vector( 140, 215 );
var follicleC6 = new Follicle({
  x: controlPointC6.x,
  y: controlPointC6.y,
  thickness: THICKNESS_MEDTHICK,
  color: COLOR_ORANGE,
  segmentLength: 15,
  angle: 2.2,
  curl: -0.5,
  friction: friction,
  gravity: gravity,
  springStrength: springStrength,
  movementStrength: movementStrength
});
folliclesC.push( follicleC6 );
var controlC6Delta = Vector.subtract( controlPointC6, controlPointC1 );
var pinC6 = new PinConstraint( follicleC6.particleA, controlPointC6 );
pins.push( pinC6 );

//#endregion

// --------------------------  -------------------------- //

//#region Ribbons

var ribbon0 = new Ribbon({
  controlPoint: new Vector( 130 + ADJUST_X, 180 + ADJUST_Y ),
  sections: 40,
  width: 40,
  sectionLength: 8,
  friction: 0.95,
  gravity: new Vector( 0, 0.2 ),
  chainLinkShiftEase: 0.9
});
var ribbon0Delta = Vector.subtract( ribbon0.controlPoint, controlPoint1 );

var ribbon1 = new Ribbon({
  controlPoint: new Vector( 130 + ADJUST_X, 180 + ADJUST_Y ),
  sections: 40,
  width: 40,
  sectionLength: 8,
  friction: 0.9,
  gravity: new Vector( 0, 0.25 ),
  chainLinkShiftEase: 0.9
});
var ribbon1Delta = Vector.subtract( ribbon1.controlPoint, controlPointB1 ); 

//#endregion

// --------------------------  -------------------------- //

//#region Head images

var headImg = new Image();
var isHeadImgLoaded;
headImg.onload = function() {
  isHeadImgLoaded = true;
};
headImg.src = './img/art/asian-woman-'+(Math.floor(Math.random() * Math.floor(9)) + 1)+'.png';
var headPosition = new Vector( 77, 87 );
var headPositionDelta = Vector.subtract( headPosition, controlPoint1 );

var headImg2 = new Image(); 
var isHeadImgLoaded2; 
headImg2.onload = function() {
    isHeadImgLoaded2 = true;
  };
headImg2.src = './img/art/black-woman-'+(Math.floor(Math.random() * Math.floor(9)) + 1)+'.png';
var headPosition2 = new Vector( 77, 87 );
var headPosition2Delta = Vector.subtract( headPosition2, controlPointB1 );

var headImg3 = new Image(); 
var isHeadImgLoaded3; 
headImg3.onload = function() {
    isHeadImgLoaded3 = true;
  };
headImg3.src = './img/art/fred-'+(Math.floor(Math.random() * Math.floor(9)) + 1)+'.png';
var headPosition3 = new Vector( 77, 87 );
var headPosition3Delta = Vector.subtract( headPosition3, controlPointC1 );

//#endregion

// --------------------------  -------------------------- //

var didMouseDown = false;
var rotateAngle = 0;
var rotateSpeed = 0.018;
var rotateLength = h/3;
var didMouseDownTimer = 0;
const TIMERLIMIT = 100;
var curX; 
var curY; 
var targetX; 
var targetY;
var tempX; 
var tempY;
var headingToTarget = false;
const THRESHOLD = 7;
var rotateAngleB = 9000; 
var curXB; 
var curYB;
var closestAgent = 0;
var agentOrder = []; 
agentOrder.push(2); 
agentOrder.push(1);
agentOrder.push(0);
var targetXB; 
var targetYB;
var rotateAngleC = 18000; 
var curXC; 
var curYC; 
var targetXC; 
var targetYC;

function update() {
  ribbon0.update();
  ribbon1.update(); 
  var i, len;
  for ( i=0, len = follicles.length; i < len; i++ ) {
    follicles[i].update();
  }
  for ( i=0, len = front_follicles.length; i < len; i++ ) {
    front_follicles[i].update();
  }
  for ( i=0, len = folliclesB.length; i < len; i++ ) {
    folliclesB[i].update();
  }
  for ( i=0, len = front_folliclesB.length; i < len; i++ ) {
    front_folliclesB[i].update();
  }
  for ( i=0, len = folliclesC.length; i < len; i++ ) {
    folliclesC[i].update();
  }
  for ( i=0, len = front_folliclesC.length; i < len; i++ ) {
    front_folliclesC[i].update();
  }
  for ( i=0, len = pins.length; i < len; i++ ) {
    pins[i].update();
  }
  for ( i=0, len = follicles.length; i < len; i++ ) {
    follicles[i].stick0.update();
    follicles[i].stick1.update();
  }
  for ( i=0, len = front_follicles.length; i < len; i++ ) {
    front_follicles[i].stick0.update();
    front_follicles[i].stick1.update();
  }
  for ( i=0, len = folliclesB.length; i < len; i++ ) {
    folliclesB[i].stick0.update();
    folliclesB[i].stick1.update();
  }
  for ( i=0, len = front_folliclesB.length; i < len; i++ ) {
    front_folliclesB[i].stick0.update();
    front_folliclesB[i].stick1.update();
  }
  for ( i=0, len = folliclesC.length; i < len; i++ ) {
    folliclesC[i].stick0.update();
    folliclesC[i].stick1.update();
  }
  for ( i=0, len = front_folliclesC.length; i < len; i++ ) {
    front_folliclesC[i].stick0.update();
    front_folliclesC[i].stick1.update();
  }

  // if you're not the closest agent, no matter what, just float
  // console.log("cos Rotate angle B is " + Math.cos( rotateAngleB * 1.3 ));
  // console.log("curXB is " + curXB + " and w is " + w + " and h is " + h);
  if (closestAgent == 0) {
    rotateAngleB += (rotateSpeed / 1.5);
    var xB = w/2 + Math.cos( rotateAngleB * 1.3 ) * w/3;
    var yB = h/2 + Math.sin( rotateAngleB ) * h/4;
    move( xB, yB, 1 );
    rotateAngleC += (rotateSpeed / 1.5);
    var xC = w/2 + Math.cos( rotateAngleC * 1.3 ) * w/3;
    var yC = h/2 + Math.sin( rotateAngleC ) * h/4;
    move( xC, yC, 2 );
  } else if (closestAgent == 1) {
    rotateAngle += (rotateSpeed / 1.5);
    var x = w/2 + Math.cos( rotateAngle * 1.3 ) * w/3;
    var y = h/2 + Math.sin( rotateAngle ) * h/4;
    move( x, y, 0 );
    rotateAngleC += (rotateSpeed / 1.5);
    var xC = w/2 + Math.cos( rotateAngleC * 1.3 ) * w/3;
    var yC = h/2 + Math.sin( rotateAngleC ) * h/4;
    move( xC, yC, 2 );
  } else if (closestAgent == 2) {
    rotateAngle += (rotateSpeed / 1.5);
    var x = w/2 + Math.cos( rotateAngle * 1.3 ) * w/3;
    var y = h/2 + Math.sin( rotateAngle ) * h/4;
    move( x, y, 0 );
    rotateAngleB += (rotateSpeed / 1.5);
    var xB = w/2 + Math.cos( rotateAngleB * 1.3 ) * w/3;
    var yB = h/2 + Math.sin( rotateAngleB ) * h/4;
    move( xB, yB, 1 );
  }

  // closest agent floats around if mouse is not down and not heading to target
  if ( !didMouseDown && !headingToTarget) {
    if (closestAgent == 0) {
      rotateAngle += (rotateSpeed / 1.5);
      var x = w/2 + Math.cos( rotateAngle * 1.3 ) * w/3;
      var y = h/2 + Math.sin( rotateAngle ) * h/4;
      move( x, y, 0 );
    } else if (closestAgent == 1) {
      rotateAngleB += (rotateSpeed / 1.5);
      var xB = w/2 + Math.cos( rotateAngleB * 1.3 ) * w/3;
      var yB = h/2 + Math.sin( rotateAngleB ) * h/4;
      move( xB, yB, 1 );
    } else if (closestAgent == 2) {
      rotateAngleC += (rotateSpeed / 1.5);
      var xC = w/2 + Math.cos( rotateAngleC * 1.3 ) * w/3;
      var yC = h/2 + Math.sin( rotateAngleC ) * h/4;
      move( xC, yC, 2 );
    }
  } 

  didMouseDownTimer = didMouseDownTimer + 1; 
  if (didMouseDownTimer > TIMERLIMIT && didMouseDown && !headingToTarget) {
      onMouseup();
      didMouseDown = false;
      // Head to target
      if (closestAgent == 0) {
        targetX = w/2 + Math.cos( rotateAngle * 1.3 ) * w/3;
        targetY = h/2 + Math.sin( rotateAngle ) * h/4;
      } else if (closestAgent == 1) {
        targetXB = w/2 + Math.cos( rotateAngleB * 1.3 ) * w/3;
        targetYB = h/2 + Math.sin( rotateAngleB ) * h/4; 
      } else if (closestAgent == 2) {
        targetXC = w/2 + Math.cos( rotateAngleC * 1.3 ) * w/3;
        targetYC = h/2 + Math.sin( rotateAngleC ) * h/4; 
      }
      headingToTarget = true;
  }

  if (headingToTarget) {
      if (closestAgent == 0) {
        if (Math.abs(targetX - curX) > THRESHOLD) {
          if (targetX - curX > 0) {
              tempX = curX + THRESHOLD;
          } else {
              tempX = curX - THRESHOLD;
          }
        } else {
            tempX = curX;
        }
        if (Math.abs(targetY - curY) > THRESHOLD) {
          if (targetY - curY > 0) {
              tempY = curY + THRESHOLD;
          } else {
              tempY = curY - THRESHOLD;
          }
        } else {
            tempY = curY;
        }
        if (Math.abs(targetX - curX) <= THRESHOLD && Math.abs(targetY - curY) <= THRESHOLD) {
            headingToTarget = false;
        }
        move(tempX, tempY, 0);
      } else if (closestAgent == 1) {
        if (Math.abs(targetXB - curXB) > THRESHOLD) {
          if (targetXB - curXB > 0) {
              tempX = curXB + THRESHOLD;
          } else {
              tempX = curXB - THRESHOLD;
          }
        } else {
            tempX = curXB;
        }
        if (Math.abs(targetYB - curYB) > THRESHOLD) {
          if (targetYB - curYB > 0) {
              tempY = curYB + THRESHOLD;
          } else {
              tempY = curYB - THRESHOLD;
          }
        } else {
            tempY = curYB;
        }
        if (Math.abs(targetXB - curXB) <= THRESHOLD && Math.abs(targetYB - curYB) <= THRESHOLD) {
            headingToTarget = false;
        }
        move(tempX, tempY, 1);
      } else if (closestAgent == 2) {
        if (Math.abs(targetXC - curXC) > THRESHOLD) {
          if (targetXC - curXC > 0) {
              tempX = curXC + THRESHOLD;
          } else {
              tempX = curXC - THRESHOLD;
          }
        } else {
            tempX = curXC;
        }
        if (Math.abs(targetYC - curYC) > THRESHOLD) {
          if (targetYC - curYC > 0) {
              tempY = curYC + THRESHOLD;
          } else {
              tempY = curYC - THRESHOLD;
          }
        } else {
            tempY = curYC;
        }
        if (Math.abs(targetXC - curXC) <= THRESHOLD && Math.abs(targetYC - curYC) <= THRESHOLD) {
            headingToTarget = false;
        }
        move(tempX, tempY, 2);
      }
      
  }
  // console.log(didMouseDownTimer);
  // console.log("curX is " + curX + " and curY is " + curY);
}

function render() {
  ctx.clearRect( 0, 0, w, h );

  // Keep active agent on top and visible

  if (agentOrder[0] == 1 && agentOrder[1] == 0) {
    ribbon0.render( ctx );
    ribbon1.render( ctx ); 
    for ( var i=0, len = folliclesB.length; i < len; i++ ) {
      folliclesB[i].render( ctx, folliclesB[i].thickness, folliclesB[i].color );
    }
    if ( isHeadImgLoaded2 ) {
      ctx.drawImage( headImg2, headPosition2.x, headPosition2.y );
    }

    for ( var i=0, len = follicles.length; i < len; i++ ) {
      follicles[i].render( ctx, follicles[i].thickness, follicles[i].color );
    }
    if ( isHeadImgLoaded ) {
      ctx.drawImage( headImg, headPosition.x, headPosition.y );
    }
    for ( var i=0, len = front_follicles.length; i < len; i++ ) {
      front_follicles[i].render( ctx, front_follicles[i].thickness, front_follicles[i].color );
    }

    for ( var i=0, len = folliclesC.length; i < len; i++ ) {
      folliclesC[i].render( ctx, folliclesC[i].thickness, folliclesC[i].color );
    }
    if ( isHeadImgLoaded3 ) {
      ctx.drawImage( headImg3, headPosition3.x, headPosition3.y );
    }
    for ( var i=0, len = front_folliclesC.length; i < len; i++ ) {
      front_folliclesC[i].render( ctx, front_folliclesC[i].thickness, front_folliclesC[i].color );
    }
  } else if (agentOrder[0] == 1 && agentOrder[1] == 2) {
    ribbon0.render( ctx );
    ribbon1.render( ctx ); 
    for ( var i=0, len = folliclesB.length; i < len; i++ ) {
      folliclesB[i].render( ctx, folliclesB[i].thickness, folliclesB[i].color );
    }
    if ( isHeadImgLoaded2 ) {
      ctx.drawImage( headImg2, headPosition2.x, headPosition2.y );
    }

    for ( var i=0, len = folliclesC.length; i < len; i++ ) {
        folliclesC[i].render( ctx, folliclesC[i].thickness, folliclesC[i].color );
      }
      if ( isHeadImgLoaded3 ) {
        ctx.drawImage( headImg3, headPosition3.x, headPosition3.y );
      }
      for ( var i=0, len = front_folliclesC.length; i < len; i++ ) {
        front_folliclesC[i].render( ctx, front_folliclesC[i].thickness, front_folliclesC[i].color );
      }

    

    for ( var i=0, len = follicles.length; i < len; i++ ) {
        follicles[i].render( ctx, follicles[i].thickness, follicles[i].color );
      }
      if ( isHeadImgLoaded ) {
        ctx.drawImage( headImg, headPosition.x, headPosition.y );
      }
      for ( var i=0, len = front_follicles.length; i < len; i++ ) {
        front_follicles[i].render( ctx, front_follicles[i].thickness, front_follicles[i].color );
      }

    
  } else if (agentOrder[0] == 0 && agentOrder[1] == 1) {
    for ( var i=0, len = follicles.length; i < len; i++ ) {
      follicles[i].render( ctx, follicles[i].thickness, follicles[i].color );
    }
    if ( isHeadImgLoaded ) {
      ctx.drawImage( headImg, headPosition.x, headPosition.y );
    }
    for ( var i=0, len = front_follicles.length; i < len; i++ ) {
      front_follicles[i].render( ctx, front_follicles[i].thickness, front_follicles[i].color );
    }

    ribbon0.render( ctx );
    ribbon1.render( ctx ); 
    for ( var i=0, len = folliclesB.length; i < len; i++ ) {
      folliclesB[i].render( ctx, folliclesB[i].thickness, folliclesB[i].color );
    }
    if ( isHeadImgLoaded2 ) {
      ctx.drawImage( headImg2, headPosition2.x, headPosition2.y );
    }

    for ( var i=0, len = folliclesC.length; i < len; i++ ) {
      folliclesC[i].render( ctx, folliclesC[i].thickness, folliclesC[i].color );
    }
    if ( isHeadImgLoaded3 ) {
      ctx.drawImage( headImg3, headPosition3.x, headPosition3.y );
    }
    for ( var i=0, len = front_folliclesC.length; i < len; i++ ) {
      front_folliclesC[i].render( ctx, front_folliclesC[i].thickness, front_folliclesC[i].color );
    }
  } else if (agentOrder[0] == 0 && agentOrder[1] == 2) {
    for ( var i=0, len = follicles.length; i < len; i++ ) {
      follicles[i].render( ctx, follicles[i].thickness, follicles[i].color );
    }
    if ( isHeadImgLoaded ) {
      ctx.drawImage( headImg, headPosition.x, headPosition.y );
    }
    for ( var i=0, len = front_follicles.length; i < len; i++ ) {
      front_follicles[i].render( ctx, front_follicles[i].thickness, front_follicles[i].color );
    }

    for ( var i=0, len = folliclesC.length; i < len; i++ ) {
        folliclesC[i].render( ctx, folliclesC[i].thickness, folliclesC[i].color );
      }
      if ( isHeadImgLoaded3 ) {
        ctx.drawImage( headImg3, headPosition3.x, headPosition3.y );
      }
      for ( var i=0, len = front_folliclesC.length; i < len; i++ ) {
        front_folliclesC[i].render( ctx, front_folliclesC[i].thickness, front_folliclesC[i].color );
      }

    ribbon0.render( ctx );
    ribbon1.render( ctx ); 
    for ( var i=0, len = folliclesB.length; i < len; i++ ) {
      folliclesB[i].render( ctx, folliclesB[i].thickness, folliclesB[i].color );
    }
    if ( isHeadImgLoaded2 ) {
      ctx.drawImage( headImg2, headPosition2.x, headPosition2.y );
    }

    
  } else if (agentOrder[0] == 2 && agentOrder[1] == 0) {
    for ( var i=0, len = folliclesC.length; i < len; i++ ) {
      folliclesC[i].render( ctx, folliclesC[i].thickness, folliclesC[i].color );
    }
    if ( isHeadImgLoaded3 ) {
      ctx.drawImage( headImg3, headPosition3.x, headPosition3.y );
    }
    for ( var i=0, len = front_folliclesC.length; i < len; i++ ) {
      front_folliclesC[i].render( ctx, front_folliclesC[i].thickness, front_folliclesC[i].color );
    }
    
    
    for ( var i=0, len = follicles.length; i < len; i++ ) {
      follicles[i].render( ctx, follicles[i].thickness, follicles[i].color );
    }
    if ( isHeadImgLoaded ) {
      ctx.drawImage( headImg, headPosition.x, headPosition.y );
    }
    for ( var i=0, len = front_follicles.length; i < len; i++ ) {
      front_follicles[i].render( ctx, front_follicles[i].thickness, front_follicles[i].color );
    }

    

    ribbon0.render( ctx );
    ribbon1.render( ctx ); 
    for ( var i=0, len = folliclesB.length; i < len; i++ ) {
      folliclesB[i].render( ctx, folliclesB[i].thickness, folliclesB[i].color );
    }
    if ( isHeadImgLoaded2 ) {
      ctx.drawImage( headImg2, headPosition2.x, headPosition2.y );
    }

    
  } else if (agentOrder[0] == 2 && agentOrder[1] == 1) {
    for ( var i=0, len = folliclesC.length; i < len; i++ ) {
      folliclesC[i].render( ctx, folliclesC[i].thickness, folliclesC[i].color );
    }
    if ( isHeadImgLoaded3 ) {
      ctx.drawImage( headImg3, headPosition3.x, headPosition3.y );
    }
    for ( var i=0, len = front_folliclesC.length; i < len; i++ ) {
      front_folliclesC[i].render( ctx, front_folliclesC[i].thickness, front_folliclesC[i].color );
    }
    
    ribbon0.render( ctx );
    ribbon1.render( ctx ); 
    for ( var i=0, len = folliclesB.length; i < len; i++ ) {
      folliclesB[i].render( ctx, folliclesB[i].thickness, folliclesB[i].color );
    }
    if ( isHeadImgLoaded2 ) {
      ctx.drawImage( headImg2, headPosition2.x, headPosition2.y );
    }
    
    for ( var i=0, len = follicles.length; i < len; i++ ) {
      follicles[i].render( ctx, follicles[i].thickness, follicles[i].color );
    }
    if ( isHeadImgLoaded ) {
      ctx.drawImage( headImg, headPosition.x, headPosition.y );
    }
    for ( var i=0, len = front_follicles.length; i < len; i++ ) {
      front_follicles[i].render( ctx, front_follicles[i].thickness, front_follicles[i].color );
    }

  } else {
      console.log("ERROR: Something went wrong with rendering agents!")
  }
  

}

function animate() {
  update();
  render();
  requestAnimationFrame( animate );
}

animate();

// --------------------------  -------------------------- //

var canvasOffsetLeft, canvasOffsetTop;
var findingClosestAgent = false;

function findClosestAgent( xClick, yClick, x1, y1, x2, y2, x3, y3 ) {
  findingClosestAgent = false;
  var d1 = Math.sqrt(Math.pow(x1 - xClick, 2) + Math.pow(y1 - yClick, 2)); 
  var d2 = Math.sqrt(Math.pow(x2 - xClick, 2) + Math.pow(y2 - yClick, 2));
  var d3 = Math.sqrt(Math.pow(x3 - xClick, 2) + Math.pow(y3 - yClick, 2));
  var newArr = []; 
  var newArrInd = 0; 
  if (d1 < d2 && d1 < d3) {
      // Change agent order by removing 0 from array and adding it at the end
      for (var i = 0; i < agentOrder.length; i++) {
        if (agentOrder[i] != 0) {
            newArr[newArrInd] = agentOrder[i]; 
            newArrInd++; 
        }
      }
      newArr.push(0); 
      agentOrder = newArr;
      closestAgent = 0;
  } else if (d2 < d1 && d2 < d3) {
      // Change agent order by removing 1 from array and adding it at the end
      for (var i = 0; i < agentOrder.length; i++) {
        if (agentOrder[i] != 1) {
            newArr[newArrInd] = agentOrder[i]; 
            newArrInd++; 
        }
      }
      newArr.push(1); 
      agentOrder = newArr; 
      closestAgent = 1;
  } else {
      // Change agent order by removing 2 from array and adding it at the end
      for (var i = 0; i < agentOrder.length; i++) {
        if (agentOrder[i] != 2) {
            newArr[newArrInd] = agentOrder[i]; 
            newArrInd++; 
        }
      }
      newArr.push(2); 
      agentOrder = newArr; 
      closestAgent = 2;
  }
    console.log("This is the new agent order: " + agentOrder[0] + " " + agentOrder[1] + " " + agentOrder[2]);
}

function onMousedown( event ) {
  event.preventDefault();
  findingClosestAgent = true;
  moveDragPoint( event );
  didMouseDown = true;
  didMouseDownTimer = 0;
  headingToTarget = false;
  window.addEventListener( 'mousemove', moveDragPoint, false );
  window.addEventListener( 'mouseup', onMouseup, false );
}

function moveDragPoint( event ) {
    var x = parseInt( event.pageX - canvasOffsetLeft, 10 );
    var y = parseInt( event.pageY - canvasOffsetTop, 10 );
    // console.log("x is " + x + " and y is " + y);
    // Find which agent the click is closest to
    if (findingClosestAgent && !headingToTarget && !didMouseDown) {
        findClosestAgent(x, y, curX, curY, curXB, curYB, curXC, curYC);
        console.log(closestAgent);
    }
    didMouseDownTimer = 0
    headingToTarget = false;
    move( x, y, closestAgent );
}

function move( x, y, agent ) {
  if (agent == 0) { // Asian woman
    curX = x;
    curY = y;
    // console.log(curX); 
    controlPoint1.setCoords( x, y );
    var movement = Vector.subtract( controlPoint1, follicle1.particleA.position );
    controlPoint2.set( Vector.add( controlPoint1, control2Delta ) );
    controlPoint3.set( Vector.add( controlPoint1, control3Delta ) );
    controlPoint4.set( Vector.add( controlPoint1, control4Delta ) );
    controlPoint5.set( Vector.add( controlPoint1, control5Delta ) );
    controlPoint6.set( Vector.add( controlPoint1, control6Delta ) );
    controlPoint7.set( Vector.add( controlPoint1, control7Delta ) );
    controlPoint8.set( Vector.add( controlPoint1, control8Delta ) );
    controlPoint9.set( Vector.add( controlPoint1, control9Delta ) );
    controlPoint10.set( Vector.add( controlPoint1, control10Delta ) );
    controlPoint11.set( Vector.add( controlPoint1, control11Delta ) );
    controlPoint12.set( Vector.add( controlPoint1, control12Delta ) );
    controlPoint13.set( Vector.add( controlPoint1, control13Delta ) );
    controlPoint14.set( Vector.add( controlPoint1, control14Delta ) );
    controlPoint15.set( Vector.add( controlPoint1, control15Delta ) );
    controlPoint16.set( Vector.add( controlPoint1, control16Delta ) );
    controlPoint17.set( Vector.add( controlPoint1, control17Delta ) );
    controlPoint18.set( Vector.add( controlPoint1, control18Delta ) );
    headPosition.set( Vector.add( controlPoint1, headPositionDelta ) );
    for ( var i=0, len = follicles.length; i < len; i++ ) {
      follicles[i].addMovement( movement );
    }
    
    for ( var i=0, len = front_follicles.length; i < len; i++ ) {
      front_follicles[i].addMovement( movement );
    }
  } else if (agent == 1) { // Black woman
    curXB = x; 
    curYB = y;
    // console.log(curXB); 
    controlPointB1.setCoords( x, y );
    var movementB = Vector.subtract( controlPointB1, follicleB1.particleA.position );
    controlPointB0.set( Vector.add( controlPointB1, controlB0Delta ) );
    controlPointB2.set( Vector.add( controlPointB1, controlB2Delta ) );
    controlPointB3.set( Vector.add( controlPointB1, controlB3Delta ) );
    controlPointB4.set( Vector.add( controlPointB1, controlB4Delta ) );
    controlPointB5.set( Vector.add( controlPointB1, controlB5Delta ) );
    controlPointB6.set( Vector.add( controlPointB1, controlB6Delta ) );
    controlPointB7.set( Vector.add( controlPointB1, controlB7Delta ) );
    controlPointB8.set( Vector.add( controlPointB1, controlB8Delta ) );
    controlPointB9.set( Vector.add( controlPointB1, controlB9Delta ) );
    controlPointB10.set( Vector.add( controlPointB1, controlB10Delta ) );
    controlPointB11.set( Vector.add( controlPointB1, controlB11Delta ) );
    controlPointB12.set( Vector.add( controlPointB1, controlB12Delta ) );
    headPosition2.set( Vector.add( controlPointB1, headPosition2Delta ) );
    ribbon0.controlPoint.set( Vector.add( controlPointB1, ribbon0Delta ) );
    ribbon1.controlPoint.set( Vector.add( controlPointB1, ribbon1Delta ) ); 
    for ( var i=0, len = folliclesB.length; i < len; i++ ) {
      folliclesB[i].addMovement( movementB );
    }
      
    for ( var i=0, len = front_folliclesB.length; i < len; i++ ) {
      front_folliclesB[i].addMovement( movementB );
    }
  } else if (agent == 2) { // Fred
    curXC = x; 
    curYC = y;
    // console.log(curXB); 
    controlPointC1.setCoords( x, y );
    var movementC = Vector.subtract( controlPointC1, follicleC1.particleA.position );
    controlPointC2.set( Vector.add( controlPointC1, controlC2Delta ) );
    controlPointC3.set( Vector.add( controlPointC1, controlC3Delta ) );
    controlPointC4.set( Vector.add( controlPointC1, controlC4Delta ) );
    controlPointC5.set( Vector.add( controlPointC1, controlC5Delta ) );
    controlPointC6.set( Vector.add( controlPointC1, controlC6Delta ) );
    headPosition3.set( Vector.add( controlPointC1, headPosition3Delta ) );
    // ribbon0.controlPoint.set( Vector.add( controlPointB1, ribbon0Delta ) );
    // ribbon1.controlPoint.set( Vector.add( controlPointB1, ribbon1Delta ) ); 
    for ( var i=0, len = folliclesC.length; i < len; i++ ) {
      folliclesC[i].addMovement( movementC );
    }
      
    for ( var i=0, len = front_folliclesC.length; i < len; i++ ) {
      front_folliclesC[i].addMovement( movementC );
    } 
  }
}

function onMouseup() {
  window.removeEventListener( 'mousemove', moveDragPoint, false );
  window.removeEventListener( 'mouseup', onMouseup, false );
}

function resizeCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;

    // Redraw everything after resizing the window
    // drawStuff(); 
  }

window.addEventListener('resize', resizeCanvas, false);
