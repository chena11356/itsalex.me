/*jshint unused: false, undef: true */
/*global blockSize: false */

// ----- utils ----- //

const COLOR_GRAY = '#787878'; 
const COLOR_LIGHT_GRAY = '#9e9d9d';

function triangle( ctx, x1, y1, x2, y2, x3, y3 ) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.fill();
}

// --------------------------  -------------------------- //

var canvasDesc = document.querySelector('#canvas-desc');
var body = document.querySelector('html');
var descInteractive = document.querySelector('#desc-interactive');
var ctxDesc = canvasDesc.getContext('2d');
var wDesc = canvasDesc.width = descInteractive.getBoundingClientRect().width;
var hDesc = canvasDesc.height = descInteractive.getBoundingClientRect().height;

canvasDesc.addEventListener( 'mousedown', onMousedownDesc, false );
var rectDesc = canvasDesc.getBoundingClientRect();
canvasDescOffsetLeft = rectDesc.left + body.scrollLeft;
canvasDescOffsetTop = rectDesc.top + body.scrollTop;

// --------------------------  -------------------------- //

var folliclesD = [];
var front_folliclesD = [];
var pinsDesc = [];

//#region Asian woman hair

//#region Fred hair

var controlPointD1 = new Vector( 147, 160 );
var follicleD1 = new Follicle({
  x: controlPointD1.x,
  y: controlPointD1.y,
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
folliclesD.push( follicleD1 );

var pinD1 = new PinConstraint( follicleD1.particleA, controlPointD1 );
pinsDesc.push( pinD1 );

var controlPointD2 = new Vector( 180, 110 );
var follicleD2 = new Follicle({
  x: controlPointD2.x,
  y: controlPointD2.y,
  thickness: THICKNESS_THIN,
  color: COLOR_GRAY,
  segmentLength: 23,
  angle: -2,
  curl: -1,
  friction: frictionMore,
  gravity: gravityMore,
  springStrength: springStrengthMore,
  movementStrength: movementStrengthLess
});
front_folliclesD.push( follicleD2 );
var controlD2Delta = Vector.subtract( controlPointD2, controlPointD1 );
var pinD2 = new PinConstraint( follicleD2.particleA, controlPointD2 );
pinsDesc.push( pinD2 );

var controlPointD3 = new Vector( 160, 110 );
var follicleD3 = new Follicle({
  x: controlPointD3.x,
  y: controlPointD3.y,
  thickness: THICKNESS_THIN,
  color: COLOR_GRAY,
  segmentLength: 23,
  angle: -2,
  curl: -1,
  friction: frictionMore,
  gravity: gravityMore,
  springStrength: springStrengthMore,
  movementStrength: movementStrengthLess
});
front_folliclesD.push( follicleD3 );
var controlD3Delta = Vector.subtract( controlPointD3, controlPointD1 );
var pinD3 = new PinConstraint( follicleD3.particleA, controlPointD3 );
pinsDesc.push( pinD3 );

var controlPointD4 = new Vector( 140, 110 );
var follicleD4 = new Follicle({
  x: controlPointD4.x,
  y: controlPointD4.y,
  thickness: THICKNESS_THIN,
  color: COLOR_GRAY,
  segmentLength: 23,
  angle: -2,
  curl: -1,
  friction: frictionMore,
  gravity: gravityMore,
  springStrength: springStrengthMore,
  movementStrength: movementStrengthLess
});
front_folliclesD.push( follicleD4 );
var controlD4Delta = Vector.subtract( controlPointD4, controlPointD1 );
var pinD4 = new PinConstraint( follicleD4.particleA, controlPointD4 );
pinsDesc.push( pinD4 );

var controlPointD5 = new Vector( 120, 110 );
var follicleD5 = new Follicle({
  x: controlPointD5.x,
  y: controlPointD5.y,
  thickness: THICKNESS_THIN,
  color: COLOR_GRAY,
  segmentLength: 16,
  angle: -2,
  curl: -1,
  friction: frictionMore,
  gravity: gravityMore,
  springStrength: springStrengthMore,
  movementStrength: movementStrengthLess
});
front_folliclesD.push( follicleD5 );
var controlD5Delta = Vector.subtract( controlPointD5, controlPointD1 );
var pinD5 = new PinConstraint( follicleD5.particleA, controlPointD5 );
pinsDesc.push( pinD5 );

var controlPointD6 = new Vector( 202, 120 );
var follicleD6 = new Follicle({
  x: controlPointD6.x,
  y: controlPointD6.y,
  thickness: THICKNESS_MEDIUM,
  color: COLOR_LIGHT_GRAY,
  segmentLength: 20,
  angle: 0.9,
  curl: 0.5,
  friction: friction,
  gravity: gravityMore,
  springStrength: springStrengthMore,
  movementStrength: movementStrengthLess
});
front_folliclesD.push( follicleD6 );
var controlD6Delta = Vector.subtract( controlPointD6, controlPointD1 );
var pinD6 = new PinConstraint( follicleD6.particleA, controlPointD6 );
pinsDesc.push( pinD6 );

var controlPointD7 = new Vector( 97, 120 );
var follicleD7 = new Follicle({
  x: controlPointD7.x,
  y: controlPointD7.y,
  thickness: THICKNESS_MEDIUM,
  color: COLOR_LIGHT_GRAY,
  segmentLength: 20,
  angle: 2.2,
  curl: -0.5,
  friction: friction,
  gravity: gravityMore,
  springStrength: springStrengthMore,
  movementStrength: movementStrengthLess
});
folliclesD.push( follicleD7 );
var controlD7Delta = Vector.subtract( controlPointD7, controlPointD1 );
var pinD7 = new PinConstraint( follicleD7.particleA, controlPointD7 );
pinsDesc.push( pinD7 );

//#endregion

// --------------------------  -------------------------- //

//#region Ribbons 

//#endregion

// --------------------------  -------------------------- //

//#region Head images

var headImg4 = new Image(); 
var isHeadImgLoaded4; 
headImg4.onload = function() {
    isHeadImgLoaded4 = true;
  };
headImg4.src = './img/art/axelrod-'+(Math.floor(Math.random() * Math.floor(9)) + 1)+'.png';
var headPosition4 = new Vector( 77, 87 );
var headPosition4Delta = Vector.subtract( headPosition4, controlPointD1 );

//#endregion

// --------------------------  -------------------------- //

var didMouseDownDesc = false;
var rotateSpeedDesc = 0.075;
var rotateLengthDesc = hDesc/3;
var didMouseDownDescTimer = 0;
const TIMERLIMITDESC = 100;
var tempX; 
var tempY;
var headingToTargetDesc = false;
var closestAgentDesc = 3;
var agentOrderDesc = []; 
agentOrderDesc.push(3); 
var rotateAngleDescD = 18000; 
var curXD; 
var curYD; 
var targetXD; 
var targetYD;

function updateDesc() {
  var i, len;
  for ( i=0, len = folliclesD.length; i < len; i++ ) {
    folliclesD[i].update();
  }
  for ( i=0, len = front_folliclesD.length; i < len; i++ ) {
    front_folliclesD[i].update();
  }
  for ( i=0, len = pinsDesc.length; i < len; i++ ) {
    pinsDesc[i].update();
  }
  for ( i=0, len = folliclesD.length; i < len; i++ ) {
    folliclesD[i].stick0.update();
    folliclesD[i].stick1.update();
  }
  for ( i=0, len = front_folliclesD.length; i < len; i++ ) {
    front_folliclesD[i].stick0.update();
    front_folliclesD[i].stick1.update();
  }

  // if you're not the closest agent, no matter what, just float
  // This should never happen if there's only 1 agent
  if (closestAgentDesc != 3) {
    rotateAngleDescD += (rotateSpeedDesc / 1.5);
    var xD = wDesc/2;
    var yD = hDesc/2 + Math.sin( rotateAngleDescD ) * hDesc/20;
    moveDesc( xD, yD, 3 );
  }

  // closest agent floats around if mouse is not down and not heading to target
  if ( !didMouseDownDesc && !headingToTargetDesc) {
    if (closestAgentDesc == 3) {
      rotateAngleDescD += (rotateSpeedDesc / 1.5);
      var xD = wDesc/2;
      var yD = hDesc/2 + Math.sin( rotateAngleDescD ) * hDesc/20;
      moveDesc( xD, yD, 3 );
    }
  } 

  didMouseDownDescTimer = didMouseDownDescTimer + 1; 
  if (didMouseDownDescTimer > TIMERLIMITDESC && didMouseDownDesc && !headingToTargetDesc) {
      onMouseUpDesc();
      didMouseDownDesc = false;
      // Head to target
      if (closestAgentDesc == 3) {
        targetXD = wDesc/2;
        targetYD = hDesc/2 + Math.sin( rotateAngleDescD ) * hDesc/20; 
      }
      headingToTargetDesc = true;
  }

  if (headingToTargetDesc) {
      if (closestAgentDesc == 3) {
        if (Math.abs(targetXD - curXD) > THRESHOLD) {
          if (targetXD - curXD > 0) {
              tempX = curXD + THRESHOLD;
          } else {
              tempX = curXD - THRESHOLD;
          }
        } else {
            tempX = curXD;
        }
        if (Math.abs(targetYD - curYD) > THRESHOLD) {
          if (targetYD - curYD > 0) {
              tempY = curYD + THRESHOLD;
          } else {
              tempY = curYD - THRESHOLD;
          }
        } else {
            tempY = curYD;
        }
        if (Math.abs(targetXD - curXD) <= THRESHOLD && Math.abs(targetYD - curYD) <= THRESHOLD) {
            headingToTargetDesc = false;
        }
        moveDesc(tempX, tempY, 3);
      }
      
  }
  // console.log(didMouseDownDescTimer);
  // console.log("curX is " + curX + " and curY is " + curY);
}

function renderDesc() {
  ctxDesc.clearRect( 0, 0, w, h );

  // Keep active agent on top and visible

  if (agentOrderDesc[0] == 3) {
    for ( var i=0, len = folliclesD.length; i < len; i++ ) {
      folliclesD[i].render( ctxDesc, folliclesD[i].thickness, folliclesD[i].color );
    }
    if ( isHeadImgLoaded4 ) {
      ctxDesc.drawImage( headImg4, headPosition4.x, headPosition4.y );
    }
    for ( var i=0, len = front_folliclesD.length; i < len; i++ ) {
      front_folliclesD[i].render( ctxDesc, front_folliclesD[i].thickness, front_folliclesD[i].color );
    }
  } else {
      console.log("ERROR: Something went wrong with rendering agents!")
  }
  

}

function animateDesc() {
  updateDesc();
  renderDesc();
  requestAnimationFrame( animateDesc );
}

animateDesc();

// --------------------------  -------------------------- //

var canvasDescOffsetLeft, canvasDescOffsetTop;
var findingclosestAgentDesc = false;
var adjustResizeX = 0; 
var adjustResizeY = 0; 

function findclosestAgentDesc( xClick, yClick, x4, y4 ) {
  findingclosestAgentDesc = false;
  var d4 = Math.sqrt(Math.pow(x4 - xClick, 2) + Math.pow(y4 - yClick, 2));
  // Don't do anything because there's only one agent here anyway
}

function onMousedownDesc( event ) {
  event.preventDefault();
  findingclosestAgentDesc = true;
  moveDragPointDesc( event );
  didMouseDownDesc = true;
  didMouseDownDescTimer = 0;
  headingToTargetDesc = false;
  window.addEventListener( 'mousemove', moveDragPointDesc, false );
  window.addEventListener( 'mouseup', onMouseUpDesc, false );
}

function moveDragPointDesc( event ) {
    var x = parseInt( event.pageX - canvasDescOffsetLeft, 10 ) - 3 * adjustResizeX;
    var y = parseInt( event.pageY - canvasDescOffsetTop, 10 ) - 0.6 * adjustResizeY;
    // console.log(adjustResizeX+","+adjustResizeY);
    // console.log("x is " + x + " and y is " + y);
    // Find which agent the click is closest to
    if (findingclosestAgentDesc && !headingToTargetDesc && !didMouseDownDesc) {
        findclosestAgentDesc(x, y, curXD, curYD);
        console.log(closestAgentDesc);
    }
    didMouseDownDescTimer = 0
    headingToTargetDesc = false;
    moveDesc( x, y, closestAgentDesc );
}

function moveDesc( x, y, agent ) {
  if (agent == 3) { // Fred
    curXD = x; 
    curYD = y;
    // console.log(curXB); 
    controlPointD1.setCoords( x, y );
    var movementD = Vector.subtract( controlPointD1, follicleD1.particleA.position );
    controlPointD2.set( Vector.add( controlPointD1, controlD2Delta ) );
    controlPointD3.set( Vector.add( controlPointD1, controlD3Delta ) );
    controlPointD4.set( Vector.add( controlPointD1, controlD4Delta ) );
    controlPointD5.set( Vector.add( controlPointD1, controlD5Delta ) );
    controlPointD6.set( Vector.add( controlPointD1, controlD6Delta ) );
    controlPointD7.set( Vector.add( controlPointD1, controlD7Delta ) );
    headPosition4.set( Vector.add( controlPointD1, headPosition4Delta ) );
    // ribbon0.controlPoint.set( Vector.add( controlPointB1, ribbon0Delta ) );
    // ribbon1.controlPoint.set( Vector.add( controlPointB1, ribbon1Delta ) ); 
    for ( var i=0, len = folliclesD.length; i < len; i++ ) {
      folliclesD[i].addMovement( movementD );
    }
      
    for ( var i=0, len = front_folliclesD.length; i < len; i++ ) {
      front_folliclesD[i].addMovement( movementD );
    } 
  }
}

function onMouseUpDesc() {
  window.removeEventListener( 'mousemove', moveDragPointDesc, false );
  window.removeEventListener( 'mouseup', onMouseUpDesc, false );
}

function resizeCanvasDesc() {
  var wDescNew = descInteractive.getBoundingClientRect().width;
  var hDescNew =  descInteractive.getBoundingClientRect().height;
  adjustResizeX += wDescNew - wDesc; 
  adjustResizeY += hDescNew - hDesc; 
  wDesc = canvasDesc.width = wDescNew;
  hDesc = canvasDesc.height = hDescNew;


  /* var controlPointD1 = new Vector( 147 + adjustResizeX, 160 + adjustResizeY );
  var follicleD1 = new Follicle({
    x: controlPointD1.x,
    y: controlPointD1.y,
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
  folliclesD.push( follicleD1 );

  var pinD1 = new PinConstraint( follicleD1.particleA, controlPointD1 );
  pinsDesc.push( pinD1 ); */

  // Redraw everything after resizing the window
  // drawStuff(); 

  // console.log(adjustResizeX+","+adjustResizeY);
}

window.addEventListener('resize', resizeCanvasDesc, false);