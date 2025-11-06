let img;
let brushPoints = [];
let brushIndex = 0;

function preload() {
  img = loadImage('assets/vangogh.JPG'); // 确保路径正确
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  noStroke();
  background(0);

  // 生成笔触点（整幅画）
  for (let y = 0; y < 500; y += 2) {
    for (let x = 0; x < 700; x += 2) {
      brushPoints.push({ x, y });
    }
  }
  shuffle(brushPoints, true);
}

function draw() {
  // 缩放、对齐画面
  let scaleFactor = min(width / 700, height / 500);
  translate(width / 2 - 350 * scaleFactor, height / 2 - 250 * scaleFactor);
  scale(scaleFactor);

  // ✏️ 正常笔触绘制（全局）
  for (let i = 0; i < 300; i++) {
    if (brushIndex < brushPoints.length) {
      let p = brushPoints[brushIndex];
      let c = img.get(p.x * (img.width / 700), p.y * (img.height / 500));

      // 随时间调整笔触精度
      let progress = constrain(frameCount / (60 * 10), 0, 1); // 10秒
      let size = map(progress, 0, 1, 4.5, 2); // 笔触从大变小
      let alpha = map(progress, 0, 1, 180, 240); // 更饱和

      push();
      fill(red(c), green(c), blue(c), alpha);
      let angle = noise(p.x * 0.02, p.y * 0.02) * TWO_PI;
      translate(p.x, p.y);
      rotate(angle);
      ellipse(0, 0, size * 1.3, size);
      pop();

      brushIndex++;
    }
  }

  // 🎯 中心增强区：让中间逐渐清晰（人物、桌椅区域）
  enhanceCenter();

  if (brushIndex >= brushPoints.length) {
    noLoop();
    console.log("✅ 绘制完成");
  }
}

// ✨ 中心强化函数
function enhanceCenter() {
  let focusX = 350;   // 中心位置（桌椅区域）
  let focusY = 260;
  let focusRadius = 180; // 聚焦半径

  // 每一帧中间区域都会被轻轻“再描一遍”
  let density = map(frameCount, 0, 600, 100, 3000, true); // 绘制密度随时间增强

  for (let i = 0; i < density; i++) {
    let p = brushPoints[int(random(brushPoints.length))];
    let d = dist(p.x, p.y, focusX, focusY);
    if (d < focusRadius) {
      let c = img.get(p.x * (img.width / 700), p.y * (img.height / 500));
      fill(red(c), green(c), blue(c), 255); // 更亮
      ellipse(p.x, p.y, 1.2, 1.2); // 更细的笔触
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
