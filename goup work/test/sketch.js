function setup() {
  createCanvas(560, 2000);
  noLoop();
}

function draw() {
  background(250);

  // 上小下大；上下用“椭圆弧”；侧边全程外凸（bulge 控制外鼓）
  frustumConvexFit({
    topW: 130,        // 上底宽
    bottomW: 200,     // 下底宽（≈ 2.46x）
    h: 300,           // 总高
    ryTop: 20,        // 顶部椭圆弧的竖向半径（越小越扁、越钝）
    ryBottom: 5,    // 底部椭圆弧的竖向半径
    bulge: 0.22,      // 侧边外鼓程度 0~0.40
    col: color(120, 200, 120)
  });
}

/* —— 自动适配画布（保证完整可见）—— */
function frustumConvexFit(opts) {
  var pad = 40;
  var cx = width / 2;
  var top = pad, bottom = height - pad;
  var maxH = bottom - top;

  var H = (opts && typeof opts.h === 'number') ? opts.h : 600;
  var scale = Math.min(1, maxH / H);

  var params = {
    h: H * scale,
    topW: ((opts && opts.topW) || 120) * scale,
    bottomW: ((opts && opts.bottomW) || 280) * scale,
    // 注意：这里传的是 ryTop / ryBottom
    ryTop: ((opts && opts.ryTop) || ((opts && opts.topW) ? opts.topW : 120) * 0.45) * scale,
    ryBottom: ((opts && opts.ryBottom) || ((opts && opts.bottomW) ? opts.bottomW : 280) * 0.45) * scale,
    bulge: (opts && typeof opts.bulge === 'number') ? constrain(opts.bulge, 0.08, 0.40) : 0.18,
    col: (opts && opts.col) || color(120, 200, 120)
  };

  var cy = (top + bottom) / 2;
  frustumConvex(cx, cy, params);
}

/* —— 椭圆弧顶 + 椭圆弧底 + 侧边单段三次（全程外凸、左右对称）—— */
function frustumConvex(cx, cy, o) {
  var h = o.h;
  var topW = o.topW;
  var bottomW = o.bottomW;
  var ryTop = o.ryTop;       // 椭圆弧竖向半径（顶部）
  var ryBottom = o.ryBottom; // 椭圆弧竖向半径（底部）
  var bulge = o.bulge;
  var col = o.col;

  var topY = cy - h / 2, botY = cy + h / 2;
  var halfT = topW / 2, halfB = bottomW / 2;

  // 椭圆弧圆心（使顶点/底点恰好落在 topY / botY）
  var topC = topY + ryTop;
  var botC = botY - ryBottom;

  var K = 0.5522847498; // 贝塞尔近似系数

  // 与上下弧的切点
  var LT = [-halfT, topC], RT = [halfT, topC];
  var LB = [-halfB, botC], RB = [halfB, botC];

  // 侧边单段三次（两端竖直相切 → 全程外凸）
  var len = (botC - topC);
  var k1 = len * (0.44 + bulge * 0.18);
  var k2 = len * (0.46 + bulge * 0.25);

  var X = function (x) { return cx + x; };

  noStroke();
  fill(col);

  beginShape();
  // 顶部：半个椭圆（左→右）
  vertex(X(LT[0]), LT[1]);
  // 左 1/4 椭圆：L -> 顶点
  bezierVertex(X(-halfT), topC - K * ryTop,
               X(-K * halfT), topC - ryTop,
               X(0), topC - ryTop);
  // 右 1/4 椭圆：顶点 -> R
  bezierVertex(X(K * halfT), topC - ryTop,
               X(halfT), topC - K * ryTop,
               X(RT[0]), RT[1]);

  // 右侧：单段三次（外凸，竖直相切）
  bezierVertex(X(halfT), topC + k1,
               X(halfB), botC - k2,
               X(RB[0]), RB[1]);

  // 底部：半个椭圆（右→左）
  // 右 1/4 椭圆：R -> 底点
  bezierVertex(X(halfB), botC + K * ryBottom,
               X(K * halfB), botC + ryBottom,
               X(0), botC + ryBottom);
  // 左 1/4 椭圆：底点 -> L
  bezierVertex(X(-K * halfB), botC + ryBottom,
               X(-halfB), botC + K * ryBottom,
               X(LB[0]), LB[1]);

  // 左侧（镜像）
  bezierVertex(X(-halfB), botC - k2,
               X(-halfT), topC + k1,
               X(LT[0]), LT[1]);
  endShape(CLOSE);
}
