let imgArray = []; // Array to store your images
let img2Array = []; // Array to store your second set of images
let selectedImg;
let selectedImg2;
let buffer; // Graphics buffer for drawing
let inverted = false;
let scrolling = true; // Variable to control scrolling
let scrollSpeed = 2; // Initial scrolling speed
let blendModeName; // Variable to store the selected blend mode
let angle = 0;

// Define the aspect ratio of your images
const imageAspectRatio = 1 / 1; // Example aspect ratio (adjust as needed)

// Define an array of blend mode names
const blendModes = [
  "EXCLUSION",
  "SCREEN",
  "DIFFERENCE",
  "LIGHTEST",
  "ADD",
  "BLEND",
];

let mySound;

function preload() {
  loadJSON("./data.json", function (data) {
    imgArray = data.imgArray.map((url) => loadImage(url));
    img2Array = data.img2Array.map((url) => loadImage(url));

    // Now load a random sound from the soundArray
    let soundUrls = data.soundArray;
    let randomSoundUrl = random(soundUrls); // Select a random sound URL
    mySound = loadSound(randomSoundUrl);
  });
}

function setup() {
  // Calculate the canvas size based on the aspect ratio of your images
  let canvasWidth, canvasHeight;
  if (windowWidth / windowHeight > imageAspectRatio) {
    canvasHeight = windowHeight;
    canvasWidth = canvasHeight * imageAspectRatio;
  } else {
    canvasWidth = windowWidth;
    canvasHeight = canvasWidth / imageAspectRatio;
  }

  createCanvas(canvasWidth, canvasHeight, WEBGL);
  buffer = createGraphics(canvasWidth, canvasHeight);

  selectedImg = random(imgArray);
  selectedImg2 = random(img2Array);
  blendModeName = random(blendModes); // Select a random blend mode name

  // Resize both sets of images to fit the canvas
  for (let i = 0; i < imgArray.length; i++) {
    imgArray[i].resize(canvasWidth, 0); // Resize the images to fit the canvas width
  }
  for (let i = 0; i < img2Array.length; i++) {
    img2Array[i].resize(canvasWidth, 0); // Resize the second set of images to fit the canvas width
  }
}

function draw() {
  background(0);

  translate(-selectedImg.width / 2, -selectedImg.height / 2);

  // Calculate rotation angles based on mouse position
  let rotX = map(mouseY, 0, height, -QUARTER_PI, QUARTER_PI);
  let rotY = map(mouseX, 0, width, -QUARTER_PI, QUARTER_PI);

  rotateX(rotX);
  rotateY(rotY);

  // Ensure images are loaded before trying to display them
  if (selectedImg && selectedImg2) {
    texture(selectedImg);

    // Chromatic aberration effect variables
    let shiftX = sin(frameCount * 0.01) * 20;
    let shiftY = cos(frameCount * 0.01) * 20;

    buffer.clear();
    // Calculate the position to center the image on the canvas
    let imgX = (width - selectedImg.width) / 2;
    let imgY = (height - selectedImg.height) / 2;

    // Display the selected image from imgArray consistently
    buffer.image(selectedImg, imgX, imgY);
    applyChromaticAberration(shiftX, shiftY);

    // Set the selected blend mode
    blendMode(window[blendModeName]);

    // Calculate the position to center the image on the canvas
    let img2X = (width - selectedImg2.width) / 2;
    let img2Y = (height - selectedImg2.height) / 2;

    // Apply overlay or multiply effect with a random image from img2Array
    tint(255, 255, 255, 50); // Set opacity for img2
    image(selectedImg2, img2X, img2Y); // Use a random image from img2Array

    blendMode(BLEND); // Reset blend mode

    // Invert image colors only when the mouse button is pressed
    if (mouseIsPressed || touches.length > 0) {
      if (!inverted) {
        applyInversion(selectedImg); // Invert a random image from imgArray
        inverted = true;
      }
    } else if (inverted) {
      // Revert back to the original image when the mouse button is released
      applyInversion(selectedImg); // Revert a random image from imgArray
      inverted = false;
    }
  }
  angle += 0.01;
}

function applyChromaticAberration(shiftX, shiftY) {
  // Apply chromatic aberration effect on separate channels
  push();
  blendMode(SCREEN);
  tint(255, 0, 0); // Red channel
  image(buffer, shiftX, shiftY);
  tint(0, 255, 0); // Green channel
  image(buffer, 0, 0);
  tint(0, 0, 255); // Blue channel
  image(buffer, -shiftX, -shiftY);
  pop();
  noTint(); // Reset tint
}

function applyInversion(imageToInvert) {
  imageToInvert.loadPixels();

  for (let i = 0; i < imageToInvert.pixels.length; i += 4) {
    // Invert Red, Green, and Blue channels
    imageToInvert.pixels[i] = 255 - imageToInvert.pixels[i];
    imageToInvert.pixels[i + 1] = 255 - imageToInvert.pixels[i + 1];
    imageToInvert.pixels[i + 2] = 255 - imageToInvert.pixels[i + 2];
    // Alpha channel remains the same
  }

  imageToInvert.updatePixels();
}

function toggleSound() {
  if (mySound.isPlaying()) {
    // If the sound is already playing, stop it to prevent it from stacking.
    mySound.stop();
  } else {
    // Use loop() instead of play() to start the sound looping
    mySound.loop();
  }
}

function mousePressed() {
  toggleSound();
  return false; // Prevent default
}

function touchStarted() {
  if (getAudioContext().state !== "running") {
    getAudioContext().resume();
  }
  toggleSound();
  return false; // Prevent default browser behavior and event bubbling
}
