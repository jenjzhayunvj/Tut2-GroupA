function setup() {
  createCanvas(1200, 1000);
  background("#0b0b0b");
  noLoop();

  push();
  translate(600, 900);
  drawStemUniform();                   // stem 来自 bmushroom.js
  drawCapReplica(0, -650, 880, 360);   // cap 来自 bmushroom.js
  pop();
}
