// ==================== VARIABLES ====================
let stars = [];
let player;
let bullets = [];
let asteroids = [];
let explosions = [];
let borderColors = [];

// Game state
let gameOver = false;
let score = 0;
let gameTime = 0;
const TUTORIAL_DURATION = 7;

// Asteroid spawning
const ASTEROID_COUNT = 14;
let currentAsteroidCount = ASTEROID_COUNT;
let lastAsteroidIncreaseTime = 0;

// Constants
const BORDER_SIZE = 7;
const DENSITY = 1 / 6400;
const MIN_R = 0.4;
const MAX_R = 2.6;

// ==================== SETUP & DRAW ====================
function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  document.body.style.overflow = "hidden";
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  
  generateBorderColors();
  function generateBorderColors() {
  borderColors = [];
  const totalBoxes = ceil((width + height) * 2 / BORDER_SIZE);
  for (let i = 0; i < totalBoxes; i++) {
    borderColors.push(color(random(0, 255), random(0, 255), random(0, 255)));
  }
}
  initPlayer();
  generateStars();
  generateAsteroids();
}

function draw() {
  background(0);
  drawStars();

  if (!gameOver) {
    updateGameTime();
    increaseAsteroidCount();
    updateAndDraw();
  } else {
    drawGameOver();
  }
  
  drawCheckerboardBorder();
}

// ==================== BORDER ====================
function generateBorderColors() {
  borderColors = [];
  const totalBoxes = ceil((width + height) * 2 / BORDER_SIZE);
  for (let i = 0; i < totalBoxes; i++) {
    borderColors.push(color(random(100, 255), random(100, 255), random(100, 255)));
  }
}

function drawCheckerboardBorder() {
  noStroke();
  let colorIndex = 0;

  // Top border
  for (let x = 0; x < width; x += BORDER_SIZE) {
    for (let y = 0; y < BORDER_SIZE * 2; y += BORDER_SIZE) {
      fill(borderColors[colorIndex % borderColors.length]);
      rect(x, y, BORDER_SIZE, BORDER_SIZE);
      colorIndex++;
    }
  }

  // Bottom border
  for (let x = 0; x < width; x += BORDER_SIZE) {
    for (let y = height - BORDER_SIZE * 2; y < height; y += BORDER_SIZE) {
      fill(borderColors[colorIndex % borderColors.length]);
      rect(x, y, BORDER_SIZE, BORDER_SIZE);
      colorIndex++;
    }
  }

  // Left border
  for (let y = BORDER_SIZE * 2; y < height - BORDER_SIZE * 2; y += BORDER_SIZE) {
    for (let x = 0; x < BORDER_SIZE * 2; x += BORDER_SIZE) {
      fill(borderColors[colorIndex % borderColors.length]);
      rect(x, y, BORDER_SIZE, BORDER_SIZE);
      colorIndex++;
    }
  }

  // Right border
  for (let y = BORDER_SIZE * 2; y < height - BORDER_SIZE * 2; y += BORDER_SIZE) {
    for (let x = width - BORDER_SIZE * 2; x < width; x += BORDER_SIZE) {
      fill(borderColors[colorIndex % borderColors.length]);
      rect(x, y, BORDER_SIZE, BORDER_SIZE);
      colorIndex++;
    }
  }
}

// ==================== INITIALIZATION ====================
function initPlayer() {
  player = {
    pos: createVector(width / 2, height / 2),
    vel: createVector(0, 0),
    speed: 3,
    size: 30,
    angle: 0
  };
}

// ==================== GAME LOOP ====================
function updateGameTime() {
  gameTime += deltaTime / 1000;
}

function increaseAsteroidCount() {
  while (gameTime - lastAsteroidIncreaseTime >= 3) {
    lastAsteroidIncreaseTime += 3;
    currentAsteroidCount++;
    spawnAsteroid();
  }
}

function updateAndDraw() {
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

  drawHUD();
}

// ==================== PLAYER ====================
function movePlayer() {
  let accel = createVector(0, 0);
  const thrust = 0.25;
  const friction = 0.97;

  if (keyIsDown(LEFT_ARROW))  accel.x = -thrust;
  if (keyIsDown(RIGHT_ARROW)) accel.x = thrust;
  if (keyIsDown(UP_ARROW))    accel.y = -thrust;
  if (keyIsDown(DOWN_ARROW))  accel.y = thrust;

  player.vel.add(accel);
  player.vel.mult(friction);
  player.vel.limit(player.speed * 1.5);
  player.pos.add(player.vel);

  if (player.vel.mag() > 0.1) {
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

// ==================== SHOOTING ====================
function keyPressed() {
  if (keyCode === 32) {
    if (gameOver) {
      restartGame();
    } else {
      shoot();
    }
  }
  return false;
}

function shoot() {
  let bullet = {
    pos: createVector(player.pos.x, player.pos.y),
    vel: p5.Vector.fromAngle(player.angle).mult(7),
    r: 5
  };
  bullets.push(bullet);
}

// ==================== BULLETS ====================
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

// ==================== ASTEROIDS ====================
function generateAsteroids() {
  asteroids = [];
  for (let i = 0; i < currentAsteroidCount; i++) {
    spawnAsteroid();
  }
}

function spawnAsteroid() {
  asteroids.push(new Asteroid(
    random(width),
    random(height),
    random(30, 80),
    random(0.5, 2)
  ));
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

// ==================== EXPLOSIONS ====================
function createExplosion(x, y, size) {
  score += 10;
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

// ==================== COLLISION ====================
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
        createExplosion(a.pos.x, a.pos.y, a.size);
        hit = true;
        b.hit = true;
        break;
      }
    }
    
    if (!hit) remainingAsteroids.push(a);
    if (hit) spawnAsteroid();
  }

  bullets = bullets.filter((b) => !b.hit);
  asteroids = remainingAsteroids;
}

// ==================== UI ====================
function drawGameOver() {
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(80);
  text("GAME OVER", width / 2, height / 2 - 100);
  
  textSize(32);
  fill(255);
  text("Score: " + score, width / 2, height / 2);
  text("Time: " + gameTime.toFixed(2) + "s", width / 2, height / 2 + 50);
  
  textSize(24);
  text("Press SPACE to restart", width / 2, height / 2 + 120);
}

function drawHUD() {
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text("Score: " + score, 20, 20);
  text("Time: " + gameTime.toFixed(2) + "s", 20, 50);

  if (gameTime < TUTORIAL_DURATION) {
    textSize(24);
    text("CONTROLS", 20, 90);
    text("Use arrows to move", 20, 115);
    text("SPACE to Shoot", 20, 135);
  }
}

function restartGame() {
  gameOver = false;
  player.pos.set(width / 2, height / 2);
  player.vel.set(0, 0);
  bullets = [];
  explosions = [];
  currentAsteroidCount = ASTEROID_COUNT;
  lastAsteroidIncreaseTime = 0;
  generateBorderColors();
  function generateBorderColors() {
  borderColors = [];
  const totalBoxes = ceil((width + height) * 2 / BORDER_SIZE);
  for (let i = 0; i < totalBoxes; i++) {
    borderColors.push(color(random(0, 255), random(0, 255), random(0, 255)));
  }
}
  generateAsteroids();
  generateStars();
  score = 0;
  gameTime = 0;
}

// ==================== GRAPHICS ====================
function drawStars() {
  fill(255);
  for (let s of stars) {
    ellipse(s.x, s.y, s.r * 2);
  }
}

function generateStars() {
  stars = [];
  const count = max(50, floor(width * height * DENSITY));
  for (let i = 0; i < count; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      r: random(MIN_R, MAX_R)
    });
  }
}

// ==================== WINDOW ====================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateStars();
}