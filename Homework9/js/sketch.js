function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  noLoop();
  noStroke();
  drawShatteredGlass();
}

function drawShatteredGlass() {
  background(220);

  for (let i = 0; i < 40; i++) {
    fill(random(255), random(255), random(255));
    beginShape();
    let numPoints = int(random(3, 6));
    for (let j = 0; j < numPoints; j++) {
      vertex(random(width), random(height));
    }
    endShape(CLOSE);
  }
  fill(0);
  push();
  textSize(32);
  textStyle(BOLD);
  textAlign(CENTER,TOP,);
  text('Me', width/ 2, 10);
  let textW = textWidth('Me');
  stroke(0);
  strokeWeight(2);
  line(width/2-textW/2, 10+32+5, width/2+textW/2, 10+32+5);
  pop();
  push();
  textSize(20);
  textAlign(RIGHT, BOTTOM);
  text('Adam Jackson', width-30, height -30);
  pop();
}
function mousePressed() {
  redraw();
  drawShatteredGlass();
}
