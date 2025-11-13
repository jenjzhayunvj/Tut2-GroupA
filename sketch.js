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
  
  // Rows of points generated
  const density = 40;
  
  // Spacing of points
  const gap = max(max_width, max_height) / density;
  
  // An array to store the rows (where each row is an array of points)
  const lines = [];

  // Offset logic to create a staggered arrangement of points
  let odd = false;

  background("#070C08");

  // Iterates vertically to create rows of points
  for(let y = 0; y <= max_height + gap; y += gap) {
    
    // Flips odd (false -> true -> false) which flips the orientation of the triangles
    odd = !odd;

    // Array to hold all the point objects for one row
    const rowPoints = [];
    
    // Pushes the every other row over by half a gap so it starts off upside down
    const oddFactor = odd ? gap/2 : 0;

    // Iterates horizontally to create rows of points
    for(let x = 0; x <= max_width + gap; x += gap) {

      // Creates a point object with x and y coordinates and adds it to the 'rowPoints' array
      rowPoints.push({

        // Using random() to create unstructured positions for rows and columns
        x: x + (random()* 0.8 - 0.4) * gap + oddFactor,
        y: y + (random()* 0.8 - 0.4) * gap
      });
    }

    // Adds the entire 'rowPoints' to the bigger 'lines' array
    lines.push(rowPoints);
  }

  // Reset off for triangle construction
  odd = true;

  // Iterates through pairs of adjacent rows
  for(let y = 0; y < lines.length - 1; y++) {
    odd = !odd;
    const dotLine = [];

    // Alternates triangle orientation
    for(let i = 0; i < lines[y].length; i++) {

      // If odd skip to the next line (right side) and take that first x point
      // It's pushed over because of the odd offset
      // Creates a zigzag pattern
      dotLine.push(odd ? lines[y][i] : lines[y+1][i]);
      dotLine.push(odd ? lines[y+1][i] : lines[y][i]);
    }

    // Iterates through dotLine in blocks of 3 to draw triangles
    for(let i = 0; i < dotLine.length - 2; i++) {
      drawTriangle(dotLine[i], dotLine[i+1], dotLine[i+2]);
    }
  }
}

// Triangle drawing function
const drawTriangle = (a, b, c) => {

  // Using bezier curves to draw filled triangles to create varying thickness of triangle edges
  fill("#BC7653");
  stroke("#BC7653"); // outline color
  bezier(a.x, a.y,
         (a.x+b.x)/2 + random(-2,2), (a.y+b.y)/2 + random(-5,5),
         (a.x+b.x)/2 + random(-2,2), (a.y+b.y)/2 + random(-5,5),
         b.x, b.y);
  bezier(b.x, b.y,
         (b.x+c.x)/2 + random(-2,2), (b.y+c.y)/2 + random(-5,5),
         (b.x+c.x)/2 + random(-2,2), (b.y+c.y)/2 + random(-5,5),
         c.x, c.y);
  bezier(c.x, c.y,
         (c.x+a.x)/2 + random(-2,2), (c.y+a.y)/2 + random(-5,5),
         (c.x+a.x)/2 + random(-2,2), (c.y+a.y)/2 + random(-5,5),
         a.x, a.y);

  // Then draw triangles on top to bring back the outlined-triangle look
  fill("#070C08");
  stroke("#BC7653");
  beginShape();
  vertex(a.x, a.y);
  vertex(b.x, b.y);
  vertex(c.x, c.y);
  endShape(CLOSE);
}

// Function to create responsive design
function windowResized () {
  resizeCanvas(windowWidth, windowHeight);
}
