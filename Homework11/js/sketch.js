let stars = [];
let player;
let bullets = [];
let asteroids = [];
let explosions = [];
let gameOver = false;

const DENSITY = 1 / 6400;
const MIN_R = 0.4;
const MAX_R = 2.6;
const ASTEROID_COUNT = 14;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  document.body.style.overflow = "hidden";

  player = {
    pos: createVector(width / 2, height / 2),
    vel: createVector(0, 0),
    speed: 3,
    size: 30,
    angle: 0
  };

  generateStars();
  generateAsteroids();
}

function draw() {
  background(0);

  // Draw stars
  for (let s of stars) {
    fill(255);
    ellipse(s.x, s.y, s.r * 2);
  }

  if (!gameOver) {
    // Update and draw game objects
    updateAsteroids();
    drawAsteroids();

    movePlayer();
    drawPlayer();

    updateBullets();
    drawBullets();

    updateExplosions();
    drawExplosions();

    checkCollisions();
    checkBulletHits();
  } else {
    drawGameOver();
  }
}

// ---------------------- PLAYER MOVEMENT ----------------------
function movePlayer() {
  player.vel.set(0, 0);

  if (keyIsDown(LEFT_ARROW)) {
    player.vel.x = -player.speed;
  } else if (keyIsDown(RIGHT_ARROW)) {
    player.vel.x = player.speed;
  }

  if (keyIsDown(UP_ARROW)) {
    player.vel.y = -player.speed;
  } else if (keyIsDown(DOWN_ARROW)) {
    player.vel.y = player.speed;
  }
  // Player orientation
  player.pos.add(player.vel);

  if (player.vel.mag() > 0) {
    player.angle = player.vel.heading();
  }

  player.pos.x = constrain(player.pos.x, 0, width);
  player.pos.y = constrain(player.pos.y, 0, height);
}

function drawPlayer() {
  push();
  translate(player.pos.x, player.pos.y);
  rotate(player.angle + HALF_PI);
  fill(100, 200, 255);
  const s = player.size;
  triangle(0, -s / 1.5, -s / 2, s / 2, s / 2, s / 2);
  pop();
}

// ---------------------- SHOOTING ----------------------
function keyPressed() {
  if (key === ' ' && !gameOver) {
    shoot();
  }
  if (key === ' ' && gameOver) {
    restartGame();
  }
}

function shoot() {
  let bullet = {
    pos: createVector(player.pos.x, player.pos.y),
    vel: p5.Vector.fromAngle(player.angle).mult(7),
    r: 5
  };
  bullets.push(bullet);
}

// ---------------------- BULLETS ----------------------
function updateBullets() {
  for (let b of bullets) {
    b.pos.add(b.vel);
  }
  bullets = bullets.filter(
    (b) => b.pos.x > 0 && b.pos.x < width && b.pos.y > 0 && b.pos.y < height
  );
}

function drawBullets() {
  fill(255, 200, 50);
  for (let b of bullets) {
    ellipse(b.pos.x, b.pos.y, b.r * 2);
  }
}

// ---------------------- ASTEROIDS ----------------------
function generateAsteroids() {
  asteroids = [];
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    let a = new Asteroid(
      random(width),
      random(height),
      random(30, 80),
      random(0.5, 2)
    );
    asteroids.push(a);
  }
}

function updateAsteroids() {
  for (let a of asteroids) a.update();
}

function drawAsteroids() {
  for (let a of asteroids) a.display();
}

class Asteroid {
  constructor(x, y, size, speed) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(speed);
    this.size = size;
    this.vertices = [];
    this.createShape();
  }

  createShape() {
    let vertexCount = int(random(8, 15));
    for (let i = 0; i < vertexCount; i++) {
      let angle = map(i, 0, vertexCount, 0, TWO_PI);
      let r = this.size / 2 + random(-this.size * 0.3, this.size * 0.3);
      this.vertices.push(createVector(cos(angle) * r, sin(angle) * r));
    }
  }

  update() {
    this.pos.add(this.vel);

    // wrap around screen
    if (this.pos.x < -this.size) this.pos.x = width + this.size;
    if (this.pos.x > width + this.size) this.pos.x = -this.size;
    if (this.pos.y < -this.size) this.pos.y = height + this.size;
    if (this.pos.y > height + this.size) this.pos.y = -this.size;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    fill(100);
    stroke(40);
    strokeWeight(1);
    beginShape();
    for (let v of this.vertices) vertex(v.x, v.y);
    endShape(CLOSE);
    pop();
  }
}

// ---------------------- EXPLOSIONS ----------------------
function createExplosion(x, y, size) {
  for (let i = 0; i < 20; i++) {
    let p = {
      pos: createVector(x, y),
      vel: p5.Vector.random2D().mult(random(1, 3)),
      life: 255,
      size: random(2, 6)
    };
    explosions.push(p);
  }
}

function updateExplosions() {
  for (let e of explosions) {
    e.pos.add(e.vel);
    e.life -= 4;
  }
  explosions = explosions.filter((e) => e.life > 0);
}

function drawExplosions() {
  noStroke();
  for (let e of explosions) {
    fill(255, 150, 50, e.life);
    ellipse(e.pos.x, e.pos.y, e.size);
  }
}

// ---------------------- COLLISION DETECTION ----------------------
function checkCollisions() {
  for (let a of asteroids) {
    let distance = dist(player.pos.x, player.pos.y, a.pos.x, a.pos.y);
    if (distance < (player.size / 2 + a.size / 2)) {
      gameOver = true;
      break;
    }
  }
}

function checkBulletHits() {
  let remainingAsteroids = [];
  for (let a of asteroids) {
    let hit = false;
    for (let b of bullets) {
      let distance = dist(b.pos.x, b.pos.y, a.pos.x, a.pos.y);
      if (distance < a.size / 2) {
        // asteroid hit -> explosion + remove both
        createExplosion(a.pos.x, a.pos.y, a.size);
        hit = true;
        b.hit = true;
        break;
      }
    }
    if (!hit) remainingAsteroids.push(a);
  }

  // remove hit bullets and asteroids
  bullets = bullets.filter((b) => !b.hit);
  asteroids = remainingAsteroids;
}

function drawGameOver() {
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(80);
  text("GAME OVER", width / 2, height / 2);
  textSize(24);
  fill(255);
  text("Press SPACE to restart", width / 2, height / 2 + 60);
}

function restartGame() {
  gameOver = false;
  player.pos.set(width / 2, height / 2);
  bullets = [];
  explosions = [];
  generateAsteroids();
}

// ---------------------- STARS ----------------------
function generateStars() {
  stars = [];
  const count = max(50, floor(windowWidth * windowHeight * DENSITY));
  for (let i = 0; i < count; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      r: random(MIN_R, MAX_R)
    });
  }
}

// ---------------------- RESIZE ----------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateStars();
  generateAsteroids();
}
