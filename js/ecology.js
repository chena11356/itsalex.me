
var canvas, stage;

var mouseTarget;	// the display object currently under the mouse, or being dragged
var dragStarted;	// indicates whether we are currently in a drag operation
var offset;
var updateDemo = true;

function init() {
	// create stage and point it to the canvas:
	canvas = document.getElementById("demoCanvas");
	stage = new createjs.Stage(canvas);

	// enable touch interactions if supported on the current device:
	createjs.Touch.enable(stage);

	// enabled mouse over / out events
	stage.enableMouseOver(10);
	stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

	// load the source image:
	var image = new Image();
  // image.src = './img/art/black-woman-'+(Math.floor(Math.random() * Math.floor(9)) + 1)+'.png';
  image.src = "https://raw.githubusercontent.com/CreateJS/EaselJS/master/_assets/art/daisy.png";
	image.onload = handleImageLoad;
}

function stop() {
	createjs.Ticker.removeEventListener("tick", tick);
}

function handleImageLoad(event) {
	var image = event.target;
	var bitmap;
	var container = new createjs.Container();
	stage.addChild(container);

	// create and populate the screen with random daisies:
	for (var i = 0; i < 100; i++) {
		bitmap = new createjs.Bitmap(image);
		container.addChild(bitmap);
		bitmap.x = canvas.width * Math.random() | 0;
		bitmap.y = canvas.height * Math.random() | 0;
		bitmap.rotation = 360 * Math.random() | 0;
		bitmap.regX = bitmap.image.width / 2 | 0;
		bitmap.regY = bitmap.image.height / 2 | 0;
        bitmap.scale = bitmap.originalScale = Math.random() * 0.4 + 0.6;
        bitmap.name = "bmp_" + i;
		bitmap.cursor = "pointer";

		// using "on" binds the listener to the scope of the currentTarget by default
		// in this case that means it executes in the scope of the button.
		bitmap.on("mousedown", function (evt) {
			this.parent.addChild(this);
			this.offset = {x: this.x - evt.stageX, y: this.y - evt.stageY};
		});

		// the pressmove event is dispatched when the mouse moves after a mousedown on the target until the mouse is released.
		bitmap.on("pressmove", function (evt) {
			this.x = evt.stageX + this.offset.x;
			this.y = evt.stageY + this.offset.y;
			// indicate that the stage should be updateDemod on the next tick:
			updateDemo = true;
		});

		bitmap.on("rollover", function (evt) {
			this.scale = this.originalScale * 1.2;
			updateDemo = true;
		});

		bitmap.on("rollout", function (evt) {
			this.scale = this.originalScale;
			updateDemo = true;
		});

	}
	createjs.Ticker.addEventListener("tick", tick);
}

function tick(event) {
	// this set makes it so the stage only re-renders when an event handler indicates a change has happened.
	if (updateDemo) {
		updateDemo = false; // only updateDemo once
		stage.update(event);
	}
}
