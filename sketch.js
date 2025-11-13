// Reference: https://editor.p5js.org/yetiblue/sketches/2LuMOM0bl
// To add detail

let max_height, max_width;

function setup() {
  // Setting max height and width for responsive design
  max_height = windowHeight;
  max_width = windowWidth;
  createCanvas(max_width, max_height);

  stroke("#BC7653");
  strokeWeight(1);
  noLoop();
  randomSeed(1);
}

function draw() {  
  // ================= 背景三角形 =================
  const density = 40;
  const gap = max(max_width, max_height) / density;
  const lines = [];
  let odd = false;

  background("#070C08");   // 背景底色

  // 生成随机抖动的点阵
  for (let y = 0; y <= max_height + gap; y += gap) {
    odd = !odd;
    const rowPoints = [];
    const oddFactor = odd ? gap / 2 : 0;

    for (let x = 0; x <= max_width + gap; x += gap) {
      rowPoints.push({
        x: x + (random() * 0.8 - 0.4) * gap + oddFactor,
        y: y + (random() * 0.8 - 0.4) * gap
      });
    }
    lines.push(rowPoints);
  }

  // 用点阵连成三角网格
  odd = true;
  for (let y = 0; y < lines.length - 1; y++) {
    odd = !odd;
    const dotLine = [];
    for (let i = 0; i < lines[y].length; i++) {
      dotLine.push(odd ? lines[y][i] : lines[y + 1][i]);
      dotLine.push(odd ? lines[y + 1][i] : lines[y][i]);
    }
    for (let i = 0; i < dotLine.length - 2; i++) {
      drawTriangle(dotLine[i], dotLine[i + 1], dotLine[i + 2]);
    }
  }

  // ================= 叠加绘制大蘑菇 =================
  push();

  // 让蘑菇大致贴合不同屏幕尺寸：
  // 以 1200 为基准，等比例缩放
  const s = min(width, height) / 1200;
  translate(width / 2, height * 0.9);  // 移到画布底部中间
  scale(s);                            // 尺寸随屏幕缩放

  drawStemUniform();                   // 伞柄
  drawCapReplica(0, -650, 880, 360);   // 伞盖：cx, cy, W, H

  pop();
}

// Triangle drawing function
const drawTriangle = (a, b, c) => {
  // Using bezier curves to draw filled triangles to create varying thickness of triangle edges
  fill("#BC7653");
  stroke("#BC7653"); // outline color
  bezier(a.x, a.y,
         (a.x + b.x) / 2 + random(-2, 2), (a.y + b.y) / 2 + random(-5, 5),
         (a.x + b.x) / 2 + random(-2, 2), (a.y + b.y) / 2 + random(-5, 5),
         b.x, b.y);
  bezier(b.x, b.y,
         (b.x + c.x) / 2 + random(-2, 2), (b.y + c.y) / 2 + random(-5, 5),
         (b.x + c.x) / 2 + random(-2, 2), (b.y + c.y) / 2 + random(-5, 5),
         c.x, c.y);
  bezier(c.x, c.y,
         (c.x + a.x) / 2 + random(-2, 2), (c.y + a.y) / 2 + random(-5, 5),
         (c.x + a.x) / 2 + random(-2, 2), (c.y + a.y) / 2 + random(-5, 5),
         a.x, a.y);

  // Then draw triangles on top to bring back the outlined-triangle look
  fill("#070C08");
  stroke("#BC7653");
  beginShape();
  vertex(a.x, a.y);
  vertex(b.x, b.y);
  vertex(c.x, c.y);
  endShape(CLOSE);
};

// Function to create responsive design
function windowResized () {
  max_height = windowHeight;
  max_width = windowWidth;
  resizeCanvas(windowWidth, windowHeight);
}

/* ================== 伞盖：更像原画的大蘑菇 ================== */
function drawCapReplica(cx, cy, W, H) {
  const rimThk = 54;
  const topW = W * 1.05, topH = H * 0.95;      // 红边外椭圆
  const innerW = topW - rimThk * 2, innerH = topH - rimThk * 2; // 红边内椭圆

  const aStart = PI + 0.04;
  const aEnd   = TWO_PI - 0.04;
  const step   = 0.012;

  // 黄色伞盖的整体厚度与贴合
  const offsetDown = 56;    // 整体下垂
  const bumpAmp    = 105;   // 中间鼓起量
  const upperLift  = -16;   // 黄色上缘整体上移
  const joinDip    = 55;    // 中间额外下垂
  const joinSigma  = 0.20;  // 下垂影响范围

  const edgeWin = 0.14;     // 两侧羽化，防止黄三角
  const len = aEnd - aStart;
  const smooth = t => t * t * (3 - 2 * t);

  // 整体弯曲（两端略上扬，比之前更平一点）
  const bendAmp  = 18;
  const bendTilt = 0;
  function yBend(a) {
    const u = (a - aStart) / (aEnd - aStart);
    const t = u * 2 - 1;
    return -bendAmp * (1 - t * t) + bendTilt * t;
  }

  // 红色顶边波浪：左右两个大包，中间略凹 + 一点小噪音
  function rimWave(a) {
    const u = (a - aStart) / (aEnd - aStart); // 0..1
    const t = u * 2 - 1;                       // -1..1

    let bigWave   = -20 * sin(u * PI * 1.1);                 // 主波：两侧鼓起
    let centerDip =  8 * exp(-(t * t) / (2 * 0.35 * 0.35));  // 中间轻微压下
    let tinyNoise =  3 * sin(u * PI * 6.0);                  // 小细节

    return bigWave - centerDip + tinyNoise;
  }

  // ---------- 黄色上缘（红边内弧） ----------
  let upper = [];
  for (let a = aStart; a <= aEnd; a += step) {
    upper.push(createVector(
      cx + (innerW * 0.5) * cos(a),
      cy + upperLift + (innerH * 0.5) * sin(a) + yBend(a)
    ));
  }

  // ---------- 黄色下缘：中间下垂，两侧上翘、无尖角 ----------
  let lower = [];
  const loW = W * 0.52;   // 黄伞底水平宽度
  const loH = H * 0.44;   // 黄伞底垂直半径（稍扁一点）

  const wave1 = 32, wave2 = 14, bumpSharp = 2.6, sideTuck = -6;

  for (let a = aEnd; a >= aStart; a -= step) {
    const tMid = (a - aStart) / len;                 // 0 左端，0.5 中，1 右端

    const wL = smooth(constrain(tMid / edgeWin, 0, 1));
    const wR = smooth(constrain((1 - tMid) / edgeWin, 0, 1));
    const w  = min(wL, wR);

    const tt = map(a, PI, TWO_PI, -1, 1);
    const base  = loH * sin(a);
    const droop = (
      wave1 * sin(a * 5.0) +
      wave2 * sin(a * 9.0) +
      offsetDown +
      bumpAmp * exp(-bumpSharp * tt * tt) +
      sideTuck * cos(2 * a) +
      joinDip * exp(-(tt * tt) / (2 * joinSigma * joinSigma))
    );

    // 两侧轻轻上翘：中间 lift=0，两端 lift≈20
    const edgeLift = 20 * (1 - sin(tMid * PI));

    const x = cx + loW * cos(a);
    const y = cy + base + w * droop + yBend(a) - edgeLift;

    lower.push(createVector(x, y));
  }

  // 1) 黄色底面形状
  noStroke();
  fill("#F3D225");
  beginShape();
  for (const p of upper) vertex(p.x, p.y);
  for (const p of lower) vertex(p.x, p.y);
  endShape(CLOSE);

  // === 用黄色伞盖形状裁剪内部纹理 ===
  const ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(upper[0].x, upper[0].y);
  for (let i = 1; i < upper.length; i++) ctx.lineTo(upper[i].x, upper[i].y);
  for (let i = 0; i < lower.length; i++) ctx.lineTo(lower[i].x, lower[i].y);
  ctx.closePath();
  ctx.clip();

  // 2) 黄色放射线（缝线感）
  stroke("#E7BA0E");
  strokeWeight(3);
  for (let i = 0; i < 17; i++) {
    let a = lerp(aStart, aEnd, i / 16), prev = null;
    for (let s = 0; s < 32; s++) {
      let r = lerp(H * 0.02, H * 0.90, s / 31);
      let x = cx + (r * cos(a)) * (W / H) * 0.46;
      let y = cy + r * sin(a) * 0.46 + 3 * sin(s * 0.6 + i * 0.4) + yBend(a);
      if (prev) line(prev.x, prev.y, x, y);
      prev = createVector(x, y);
    }
  }

   // 3) 紫色圆点圈 —— 弧线 + 底边补点，彻底盖住黄色伞盖
  noStroke();
  fill("#7C3A6B");

  // 3.1 弧形紫点圈：强行画得很大，靠 clip 裁掉
  const rings = 20;  // 多几圈，让整体更密
  for (let r = 0; r < rings; r++) {
    let t = r / (rings - 1);

    // 半径：从很靠里的位置一直延伸到很大的半径
    // （反正多出来的都被黄色伞盖裁掉）
    let rr = lerp(H * 0.2, H * 1.6, t);

    // 外圈点更密一些
    let dots = int(lerp(22, 56, t));

    for (let k = 0; k < dots; k++) {
      // 略微超出左右边界，防止侧边漏黄
      let a = lerp(aStart - 0.04, aEnd + 0.04, k / dots);

      let x = cx + (rr * cos(a)) * (W / H) * 0.46;
      // 垂直方向放大到 0.9，让底部能伸得更低
      let y = cy + rr * sin(a) * 0.95
                + 2.2 * sin(k * 0.7 + r * 0.95)
                + yBend(a);

      let d = lerp(16, 7.5, t) * (0.92 + 0.14 * noise(r * 0.3, k * 0.6));
      circle(x, y, d);
    }
  }

  // 3.2 沿黄色伞盖底边再补一圈紫点，专门填满最下缘
  noStroke();
  fill("#7C3A6B");
  const fringeStep = 8;      // 每隔几个点取一个，控制密度
  for (let i = 0; i < lower.length; i += fringeStep) {
    const p = lower[i];
    // 稍微往上挪一点点，避免刚好落在边缘外
    circle(p.x, p.y - 3, 1);
  }

  // 顶沿补一圈紫点
  {
    let rr = H * 0.16, dots = 14;
    for (let k = 0; k < dots; k++) {
      let a = lerp(aStart + 0.02, aEnd - 0.02, k / dots);
      let x = cx + (rr * cos(a)) * (W / H) * 0.46;
      let y = cy + rr * sin(a) * 0.46 + yBend(a);
      circle(x, y, 10);
    }
  }
  ctx.restore();

  // 4) 红色伞盖顶边：外弧有波浪，内弧跟黄色上缘贴合
  noStroke();
  fill("#D81E25");
  beginShape();
  for (let a = aStart - 0.02; a <= aEnd + 0.02; a += step) {
    vertex(
      cx + (topW * 0.5) * cos(a),
      cy - 6 + (topH * 0.5) * sin(a) + yBend(a) + rimWave(a)
    );
  }
  for (let a = aEnd; a >= aStart; a -= step) {
    vertex(
      cx + (innerW * 0.5) * cos(a),
      cy - 6 + (innerH * 0.5) * sin(a) + yBend(a)
    );
  }
  endShape(CLOSE);

  // 5) 红边里的白色豆点
  ctx.save();
  ctx.beginPath();
  for (let a = aStart; a <= aEnd; a += step) {
    ctx.lineTo(
      cx + (topW * 0.5) * cos(a),
      cy - 6 + (topH * 0.5) * sin(a) + yBend(a) + rimWave(a)
    );
  }
  for (let a = aEnd; a >= aStart; a -= step) {
    ctx.lineTo(
      cx + (innerW * 0.5) * cos(a),
      cy - 6 + (innerH * 0.5) * sin(a) + yBend(a)
    );
  }
  ctx.closePath();
  ctx.clip();

  fill(255);
  const beans = 22;
  for (let i = 0; i < beans; i++) {
    const a  = lerp(aStart + 0.03, aEnd - 0.03, i / (beans - 1));
    const rx = ((topW + innerW) / 4) * cos(a);
    const ry = ((topH + innerH) / 4) * sin(a);
    const midWave = rimWave(a) * 0.5;
    push();
    translate(
      cx + rx,
      cy - 6 + ry + yBend(a) + midWave
    );
    rotate(random(-0.35, 0.35));
    ellipse(0, 0, random(26, 44), random(16, 26));
    pop();
  }
  ctx.restore();
}

/* ====================== 伞柄 ====================== */
function drawStemUniform() {
  const H = 680, topW = 120, botW = 230, bulge = 0.12;
  const bottomExtra = 40;

  // 白色柄体
  noStroke();
  fill("#FFF7F4");
  beginShape();
  vertex(-botW * 0.52, 0);
  bezierVertex(-botW * 0.72, -H * 0.36, -topW * 0.70, -H * 0.73, -topW * 0.60, -H);
  bezierVertex(-topW * 0.30, -H - 18,  topW * 0.30, -H - 18,  topW * 0.60, -H);
  bezierVertex( topW * 0.70, -H * 0.73,  botW * 0.72, -H * 0.36,  botW * 0.52, 0);
  bezierVertex( botW * 0.45, bottomExtra, -botW * 0.45, bottomExtra, -botW * 0.52, 0);
  endShape(CLOSE);

  // 裁剪伞柄轮廓
  const ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-botW * 0.52, 0);
  ctx.bezierCurveTo(-botW * 0.72, -H * 0.36, -topW * 0.70, -H * 0.73, -topW * 0.60, -H);
  ctx.bezierCurveTo(-topW * 0.30, -H - 18,  topW * 0.30, -H - 18,  topW * 0.60, -H);
  ctx.bezierCurveTo( topW * 0.70, -H * 0.73,  botW * 0.72, -H * 0.36,  botW * 0.52, 0);
  ctx.bezierCurveTo( botW * 0.45, bottomExtra, -botW * 0.45, bottomExtra, -botW * 0.52, 0);
  ctx.closePath();
  ctx.clip();

  function halfWidthAt(t) {
    const w = lerp(topW * 0.5, botW * 0.5, t);
    return w + sin(t * PI) * botW * bulge;
  }

  const baseDot = 5.5, centerBoost = 7;
  const rows = 56, sideCols = 8, stepX = 22, edgeBand = 18;
  let colXs = [0];
  for (let i = 1; i <= sideCols; i++) colXs.push(i * stepX, -i * stepX);

  // 规则竖列
  noStroke();
  fill("#C4162B");
  for (let c = 0; c < colXs.length; c++) {
    const x0 = colXs[c], isCenter = (x0 === 0);
    for (let j = 0; j < rows; j++) {
      const y  = map(j, 0, rows - 1, -H, bottomExtra - 2);
      const tW = constrain((y + H) / H, 0, 1);
      const half = halfWidthAt(tW);
      const follow = 4 * sin(tW * PI) * map(x0, -200, 200, -1, 1);
      const x = constrain(x0 + follow, -half + edgeBand, half - edgeBand);
      const d = baseDot + lerp(2, 7, tW) + (isCenter ? centerBoost : 0);
      circle(x, y, d);
    }
  }

  // 边缘补点
  const edgeRows = rows + 10;
  for (let side of [-1, 1]) {
    for (let j = 0; j < edgeRows; j++) {
      const y  = map(j, 0, edgeRows - 1, -H, bottomExtra - 2);
      const tW = constrain((y + H) / H, 0, 1);
      const half = halfWidthAt(tW);
      for (let k = 0; k < 3; k++) {
        const x = side * (half - random(2, edgeBand - 2));
        const d = random(2.2, 4.2) + 2.5 * tW;
        circle(x + random(-0.6, 0.6), y + random(-1, 1), d);
      }
    }
  }
  ctx.restore();
}
