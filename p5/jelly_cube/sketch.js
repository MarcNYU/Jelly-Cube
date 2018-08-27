/*

	Jelly Cube
	Files: sketch.js; index.html; boing.wav;
	By Marcus Williams

*/

var boxes = [];												//	Array of BeatBoxes
var numOfNotes = 8;											//	Lenght of the matrix side (height, width, depth)
var timer, initTime;
var size, mode;

var mic, sound;

function preload() {
	initAudioListener();	
	initSound();
}

function setup() {
    //createCanvas(windowWidth, windowHeight, WEBGL);
	var myCanvas = createCanvas(windowWidth, windowHeight, WEBGL);
    myCanvas.parent("p5canvas");
	timer = initTime = 30;									//	Initialize timer for 1 min.
	size = numOfNotes/2;									//	Initialize the loop variable.
	mode = 0;												//	Initialize color mode.
	initJellyCube();
}

function draw() {
	background(250);
	ManageTimer();
	if (mode > 8) mode = 0;									//	Reset mode if above cap
	
	rotateX(frameCount * 0.005);							//	Rotates the jellly cube
	rotateY(frameCount * 0.005);							//	on the x and y axies.
	
	var vol = mic.getLevel();								//	Get volume level of mic.

	var newVol = map(vol, 0, 1, -size, size, true);			//	Map volume to array index 
	if (newVol > -3) { 										//	Play sound when mic volume reaches minimum
		sound.rate(random(0,1));							//	and cuts out at maximum. 
		sound.play();
	}
	
	var local = new createVector(newVol, newVol, newVol);

	noStroke();
	for (var x = -size; x < size; x++) {
		for (var y = -size; y < size; y++) {
			for (var z = -size; z < size; z++) {
				var cube = createVector(x,y,z);
				SetColor(cube,numOfNotes,color(0,255,255),color(255,0,0,25),mode);
				boxes[x][y][z].DrawBeatBox(local);
			}
		}
	}	
}

/*	Setup microphone	*/
function initAudioListener() {
	mic = new p5.AudioIn();
	mic.start();
}

/*	Setup jelly cube initSound	*/
function initSound() {
	sound = loadSound("boing.wav");
}

/*	Initialize matirx of BeatBox objects	*/
function initJellyCube() {
	for (var x = -size; x < size; x++) {
		boxes[x] = [];
		for (var y = -size; y < size; y++) {
			boxes[x][y] = [];
			for (var z = -size; z < size; z++) {
				boxes[x][y][z] = new BeatBox(x,y,z,30);
				boxes[x][y][z].init();
			}
		}
	}
}

/* Sets the color patern of the jelly cube	*/
function SetColor (cube, size, color1, color2, mode) {
	var c1 = lerpColor(color1, color2, .25);
	var c2 = lerpColor(color1, color2, .50);
	var c3 = lerpColor(color1, color2, .75);
	switch (mode) {
		case 0:
			if ((cube.x >= -size/4 && cube.x < size/4) && 
				(cube.y >= -size/4 && cube.y < size/4) && 
				(cube.z >= -size/4 && cube.z < size/4)) {
				fill(color1);
			} else {
				fill(color2);
			}
			break;

		case 1:
			if ((cube.y % 2 == 0)) {
				if ((cube.x % 2 == 0) &&  
					(cube.z % 2 == 0)) {
					fill(color1);
				} else {
					fill(color2);
				}
			} else {
				if ((cube.x % 2 != 0) &&  
					(cube.z % 2 != 0)) {
					fill(color1);
				} else {
					fill(color2);
				}
			}
			break;

		case 2:
			if ((cube.y % 2)) {
				fill(color1);
			} else {
				fill(color2);
			}
			break;

		case 3:
			if ((cube.x < -2) && 
				(cube.y < -2) && 
				(cube.z < -2)) {
				fill(color1);
			} else if ((cube.x >= -2 && cube.x < 0) && 
				(cube.y >= -2 && cube.y < 0) && 
				(cube.z >= -2 && cube.z < 0)) {
				fill(c1);
			} else if ((cube.x == 0) && 
				(cube.y == 0) && 
				(cube.z == 0)) {
				fill(c2);
			} else if ((cube.x > 0 && cube.x <= 2) && 
				(cube.y > 0 && cube.y <= 2) && 
				(cube.z > 0 && cube.z <= 2)) {
				fill(c3);
			} else if ((cube.x > 2) && 
				(cube.y > 2) && 
				(cube.z > 2)) {
				fill(color2);
			}
			break;

		case 4:
			if (cube.x == cube.y) {
				fill(color1);
			} else {
				fill(color2);
			}
			break;

		case 5:
			if (cube.x == cube.y &&
				cube.x == cube.z) {
				fill(color1);
			} else {
				fill(color2);
			}
			break;

		case 6:
			if ((cube.x <= 0) && 
				(cube.y <= 0) && 
				(cube.z <= 0)) {
				fill(color1);
			} else {
				fill(color2);
			}
			break;

		case 7:
			fill(color1);
			break;

		default:
			fill(color2)
			break;
	}
}

/*	Handles count down timer for color mode shift	*/
function ManageTimer() {
	if (frameCount % 60 == 0 && timer > 0) {
    timer --;
  }
  if (timer == 0) {
    mode++;
		timer = initTime;
  }
}

function BeatBox(xCoord,yCoord,zCoord,size) {
	/*
	BeatBox class manages 3D object placement and translations.
	The cubes move by iterating through each box using the 'local' 
	parameter passed in to the draw method. Box movement is
	handled by vector manipulations.
	*/
	this.coords = new createVector(xCoord, yCoord, zCoord);
	this.speed = new createVector(0, 0, 0);
	this.origin = new createVector(xCoord, yCoord, zCoord);
	this.s = size;
	
	this.init = function() {
		this.origin = this.coords.copy();
	};
	
	this.DrawBeatBox = function(local) {
		var temp = this.origin.copy();
		temp.sub(local);
		temp.normalize();
		var target = createVector(this.origin.x+temp.x, this.origin.y+temp.y, this.origin.z+temp.z);
		temp = this.coords.copy();
		temp.sub(target);
		temp.mult(-map(local.dist(this.coords), 0, 2*width, .2, .01));
		this.speed.add(temp);
		this.speed.mult(.87);
		this.coords.add(this.speed);
		
		push();
		translate(this.coords.x*this.s, this.coords.y*this.s, this.coords.z*this.s);
		box(this.s,this.s,this.s);
		pop();
	};
}