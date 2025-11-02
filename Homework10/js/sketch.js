let shards = [];

//Title animation variables
var titleSize = 48; 
var titleSizeDirection = 2; 
var titleCount = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  makeShards();
}

function draw() {
  background(220);

  // Draw & update all shards first so they appear in background
  for (let s of shards) {
    s.update();
    s.display();
  }
  
  // Title animation
  titleSize += titleSizeDirection;
  titleCount++;
  if (titleCount > 5) {
      titleSizeDirection *= -1; 
      titleCount = 0; 
  }

  // Title
  fill(0);
  textAlign(CENTER, TOP);
  textSize(titleSize); // Title animation
  text("Me", width / 2, 20);

  // Signature
  textAlign(RIGHT, BOTTOM);
  textSize(24);
  text("Adam Jackson", width - 20, height - 20);
}

 // Create "shards" initially
function makeShards() {
  shards = [];
  for (let i = 0; i < 40; i++) {
    shards.push(new Shard());
  }
}

 // Re-draw "shards"
function mousePressed() {
  makeShards();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  makeShards();
}

  // Define "shards"
class Shard {
  constructor() {
    this.color = color(random(255), random(255), random(255));
    this.points = [];
    this.numPoints = int(random(3, 6));
    for (let i = 0; i < this.numPoints; i++) {
      this.points.push(createVector(random(width), random(height)));
    }

    // "shard" motion with 2D vectors
    this.moving = random() < 0.3;
    this.speed = p5.Vector.random2D().mult(random(0.1, 2));
    this.offset = random(TWO_PI);
  }

   // Smoother slower "shard" motion
  update() {
    let wrapped = false; // No color change
    if (this.moving) {
      let dx = sin(frameCount * 0.01 + this.offset) * this.speed.x;
      let dy = cos(frameCount * 0.01 + this.offset) * this.speed.y;

      for (let p of this.points) {
        let newX = p.x + dx;
        let newY = p.y + dy;
        if (newX < 0 || newX > width || newY < 0 || newY > height) {
          wrapped = true
        }
        p.x = (newX + width) % width;
        p.y = (newY + height) % height;
      }
      if (wrapped) {
        this.color = color(random(255), random(255), random(255)); // Color change
      }
    }
  }

  //"Shards" cont.
  display() {
    fill(this.color);
    stroke(0, 175);
    strokeWeight(1);
    beginShape();
    for (let p of this.points) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }
}
