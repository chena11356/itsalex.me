/*jshint unused: false, undef: true */
/*global blockSize: false */

// ----- utils ----- //

const THICKNESS_THICK = 46; 
const THICKNESS_MEDTHICK = 34;
const THICKNESS_MEDIUM = 23; 
const THICKNESS_MEDTHIN = 17;
const THICKNESS_THIN = 10;

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

Follicle.prototype.render = function( ctx, thickness ) {

  ctx.lineWidth = thickness;
  // ctx.strokeStyle = 'hsla(0, 100%, 50%, 0.4)';
  ctx.strokeStyle = '#3c3d3d';
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

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var w = canvas.width = window.innerWidth - 0;
var h = canvas.height = window.innerHeight - 0;

canvas.addEventListener( 'mousedown', onMousedown, false );
var rect = canvas.getBoundingClientRect();
canvasOffsetLeft = rect.left;
canvasOffsetTop = rect.top;

// --------------------------  -------------------------- //

var friction = 0.75;
var gravity = new Vector( 0, 0.4 );
var movementStrength = 0.9;
var springStrength = 0.5;

var follicles = [];
var front_follicles = [];
var pins = [];

var controlPoint1 = new Vector( 146, 160 );
var follicle1 = new Follicle({
  x: controlPoint1.x,
  y: controlPoint1.y,
  thickness: THICKNESS_MEDIUM,
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

// --------------------------  -------------------------- //

/* var ribbon0 = new Ribbon({
  controlPoint: new Vector( 130, 180 ),
  sections: 40,
  width: 40,
  sectionLength: 8,
  friction: 0.95,
  gravity: new Vector( 0, 0.2 ),
  chainLinkShiftEase: 0.9
});
var ribbon0Delta = Vector.subtract( ribbon0.controlPoint, controlPoint1 );

var ribbon1 = new Ribbon({
  controlPoint: new Vector( 130, 180 ),
  sections: 40,
  width: 40,
  sectionLength: 8,
  friction: 0.9,
  gravity: new Vector( 0, 0.25 ),
  chainLinkShiftEase: 0.9
});
var ribbon1Delta = Vector.subtract( ribbon1.controlPoint, controlPoint1 ); */

// --------------------------  -------------------------- //

var headImg = new Image();
var isHeadImgLoaded;
headImg.onload = function() {
  isHeadImgLoaded = true;
};
headImg.src = './img/art/asian-woman-'+(Math.floor(Math.random() * Math.floor(9)) + 1)+'.png';
var headPosition = new Vector( 77, 87 );
var headPositionDelta = Vector.subtract( headPosition, controlPoint1 );

// --------------------------  -------------------------- //

var didMouseDown = false;
var rotateAngle = 0;
var rotateSpeed = 0.03;
var rotateLength = h/3;

function update() {
  /* ribbon0.update();
  ribbon1.update(); */
  var i, len;
  for ( i=0, len = follicles.length; i < len; i++ ) {
    follicles[i].update();
  }
  for ( i=0, len = front_follicles.length; i < len; i++ ) {
    front_follicles[i].update();
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

  // didMouseDown allows the head to initially be floating around
  if ( !didMouseDown ) {
    /* rotateAngle += rotateSpeed;
    var x = w/2 + Math.cos( rotateAngle * 1.3 ) * h/4;
    var y = h/2 + Math.sin( rotateAngle ) * h/4;
    move( x, y ); */
  } 

}

function render() {
  ctx.clearRect( 0, 0, w, h );

  /* ribbon0.render( ctx );
  ribbon1.render( ctx ); */

  for ( var i=0, len = follicles.length; i < len; i++ ) {
    follicles[i].render( ctx, follicles[i].thickness );
  }

  if ( isHeadImgLoaded ) {
    ctx.drawImage( headImg, headPosition.x, headPosition.y );
  }

  for ( var i=0, len = front_follicles.length; i < len; i++ ) {
    front_follicles[i].render( ctx, front_follicles[i].thickness );
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


function onMousedown( event ) {
  event.preventDefault();
  moveDragPoint( event );
  didMouseDown = true;
  window.addEventListener( 'mousemove', moveDragPoint, false );
  window.addEventListener( 'mouseup', onMouseup, false );
}

function moveDragPoint( event ) {
  var x = parseInt( event.pageX - canvasOffsetLeft, 10 );
  var y = parseInt( event.pageY - canvasOffsetTop, 10 );
  move( x, y );
}

function move( x, y ) {
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
  /* ribbon0.controlPoint.set( Vector.add( controlPoint1, ribbon0Delta ) );
  ribbon1.controlPoint.set( Vector.add( controlPoint1, ribbon1Delta ) ); */

  for ( var i=0, len = follicles.length; i < len; i++ ) {
    follicles[i].addMovement( movement );
  }

  for ( var i=0, len = front_follicles.length; i < len; i++ ) {
    front_follicles[i].addMovement( movement );
  }
}

function onMouseup() {
  window.removeEventListener( 'mousemove', moveDragPoint, false );
  window.removeEventListener( 'mouseup', onMouseup, false );
}
