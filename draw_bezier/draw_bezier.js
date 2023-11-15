let slider;
let addbutton;
let points = Array();
let line_segments = Array();
let dragged_index=0;
let spline_members = 3;
let selected_index;
let is_control_hidden = false;
let is_control_line_hidden = false;
let is_mirror_mode = false;
let is_velocity_hidden = false;

class Point {
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.dragging = false;
    this.joined_to = null;
  }
  
  toString() {
    return "Point x: " + this.x + " y: " + this.y; 
  }
}

class ControlPoint extends Point {
  constructor(x,y) {
    super(x,y);
  }
}

class LineSegment {
  constructor() {
    this.member_points = Array();
  }
  
  toString() {
    return "LineSegment";
  }
  
  addPoint(p) {
    this.member_points.push(p);
  }
  
  getPoints() {
    return this.member_points;
  }
}

function calculatePoint(pts, t) {
  let p0 = pts[0];
  let p1 = pts[1];
  let p2 = pts[2];
  let p3 = pts[3];
  let px = p0.x * (1 -3*t + 3*t**2 - t**3) + p1.x *( 3*t - 6*t**2 +3*t**3 ) + p2.x * (3*t**2 - 3*t**3) + p3.x * t**3;
  let py = p0.y * (1 -3*t + 3*t**2 - t**3) + p1.y *( 3*t - 6*t**2 +3*t**3 ) + p2.y * (3*t**2 - 3*t**3) + p3.y * t**3;
  tmp = new Point(px, py);
  return tmp;
}

function firstDerivative(pts, t) {
  let p0 = pts[0];
  let p1 = pts[1];
  let p2 = pts[2];
  let p3 = pts[3];
  let px = p0.x * (-3 + 6*t - 3*t**2) + p1.x *( 3 - 12*t +9*t**2 ) + p2.x * (6*t - 9*t**2) + p3.x * 3*t**2;
  let py = p0.y * (-3 + 6*t - 3*t**2) + p1.y *( 3 - 12*t +9*t**2 ) + p2.y * (6*t - 9*t**2) + p3.y * 3*t**2;
  tmp = new Point(px, py);
  return tmp;
}


function calculateHermite(pts, t) {
  let p0 = pts[0];
  let p1 = pts[1];
  let p2 = pts[3];
  let p3 = pts[2];
  let px = p0.x*(1 -3*t**2 +2*t**3)+p1.x*(t-2*t**2 +t**3)+p2.x*(3*t**2-2*t**3)+p3.x*(-1*t**2+t**3);
  let py = p0.y*(1-3*t**2+2*t**3)+p1.y*(t-2*t**2+t**3)+p2.y*(3*t**2-2*t**3)+p3.y*(-1*t**2+t**3);
  tmp = new Point(px, py);
  return tmp;
}

function drawControllines(pts) {
    stroke(255,0,0);
    line(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
    stroke(255,0,180);
    line(pts[3].x, pts[3].y, pts[2].x, pts[2].y);
}

function mousePressed() {
  console.log(mouseX, mouseY);
  if (points.length < 4*spline_members) { //4
    if (points.length % 4 == 1 || points.length % 4 == 2) {
      points.push(new ControlPoint(mouseX, mouseY));
    }
    else {
    points.push(new Point(mouseX, mouseY));
    }
  }
  else {
    for (let index in points) {
      let tmp_point = points[index];
      //console.log("drag check");
      if (dist(tmp_point.x, tmp_point.y, mouseX, mouseY) < 12.5) {
        dragged_index = index;
        points[index].dragging = true;
        //console.log("Draggin: " + dragged_index);
      }
    }
  }
}

function snapPoint() {
  for (let p in points) {
    if (dist(points[dragged_index].x, 
             points[dragged_index].y, 
             points[p].x,
             points[p].y) < 10) {
               points[dragged_index].x = points[p].x;
               points[dragged_index].y = points[p].y;
               if (points[dragged_index].joined_to === null && 
                   points[dragged_index] != points[p]) {
                 points[dragged_index].joined_to = points[p];
                 points[p].joined_to = points[dragged_index];
               }
             }
  }
}


function mouseReleased() {
  //console.log("release" + points[dragged_index].dragging + " x:"+ points[dragged_index].x);
  snapPoint();
  points[dragged_index].dragging = false;
}

function mouseClicked() {
  for (let p in points) {
    if(dist(points[p].x, points[p].y, mouseX, mouseY) < 12) {
      //console.log("selected: "+p);
      if (is_mirror_mode) {
        let mirror_to = points[p];
        points[int(selected_index)+1].x = points[selected_index].x + (points[selected_index].x - mirror_to.x); 
        points[int(selected_index)+1].y = points[selected_index].y + (points[selected_index].y - mirror_to.y);
        is_mirror_mode = false;
      }
      else {
      selected_index = p;
      }
    }
  }
}

function disjoint() {
  if (points[selected_index].joined_to !== null) {
    joined_node = points[selected_index].joined_to;
    joined_node.x+=50;
    joined_node.joined_to = null;
    points[selected_index].x-=50;
    points[selected_index].joined_to = null;
  }
}

function toggleHideControl() {
  is_control_hidden = !is_control_hidden;
}

function toggleHideControlLine() {
  is_control_line_hidden = !is_control_line_hidden;
}

function toggleVelocity() {
  is_velocity_hidden = !is_velocity_hidden;
}

function enterMirrorMode() {
  if (selected_index !== null && !(points[selected_index] instanceof ControlPoint)) {
    is_mirror_mode = true;
  }
}

function keyPressed() {
  if (key == 'd' ) {
    disjoint();
  }
  else if (key == 'h') {
    toggleHideControl();
  }
  else if (key == 'c') {
    toggleHideControlLine();
  }
  else if (key == 'm') {
    enterMirrorMode();
  }
  else if (key == 'v') {
    toggleVelocity();
  }
  else if (keyCode === ESCAPE) {
    selected_index = null;
  }
}

function setup() {
  createCanvas(1024, 768);
  background(20,20,20);
  slider = createSlider(0, spline_members-0.01, 0, 0.01);
  addbutton = createButton('add new segment');
  addbutton.mouseClicked(addLineSegment);
}

function addLineSegment() {
  spline_members++;
  slider.value(spline_members);
}

function drawPoints(subpoints) {
   let prev = subpoints[0];
   for (let t = 0; t<= 1.01 ; t+=0.01) { //2
     if (!is_control_line_hidden) {
       drawControllines(sub_points);
     }
     let pt = calculatePoint(sub_points, t); // points, t
      
     stroke(120,0,0);
     strokeWeight(3);
     line(prev.x, prev.y, pt.x, pt.y);
     prev = pt;
     //circle(pt.x, pt.y, 1);
     strokeWeight(1);
   }
}

function draw() {
   background(20,20,20);
  if (points.length !=0 && !is_control_hidden) {
    for (let p in points) {
      stroke(0,0,200);
      
      
      if (points[p] == points[selected_index]) {
        fill(200,200,200);
      }
      else if (points[p] instanceof ControlPoint) {
        fill(100,100,250);
      }
      else {
      fill(0,255,0);
      }
      circle(points[p].x, points[p].y, 25);
      //console.log("p:" +p);
    }
    //console.log("draw");
  }
  if (points.length % 4 == 0 && points.length != 0) { //
    //console.log("update");
    if (points[dragged_index].dragging == true) {
      //console.log("dr_IN " + dragged_index);
      points[dragged_index].x = mouseX;
      points[dragged_index].y = mouseY;
      if (points[dragged_index].joined_to !== null) {
        //console.log("joined: " + points[dragged_index].joined_to);
        points[dragged_index].joined_to.x = mouseX;
        points[dragged_index].joined_to.y = mouseY;
      }
    }
  
    stroke(0,0,255);
    
    integral_part = Math.floor(slider.value());
    remainder_part = slider.value() - integral_part;
    sub_points = points.slice(4* integral_part, 4* (integral_part+1));
    let bpt = calculatePoint(sub_points, remainder_part); // points, slider.value()
    fill(255);
    circle(bpt.x, bpt.y, 10);
    // show velocity through first derivative
    if (!is_velocity_hidden) {
    let der = firstDerivative(sub_points, remainder_part);
    let der_len = Math.sqrt(der.x**2 + der.y**2);
    // make it unit length then scale by 100 to be visible
    der.x = 100*(der.x / der_len);
    der.y = 100*(der.y / der_len);
    // calcuate normal vector
    let normal = new Point(der.y, -der.x);
    line(bpt.x, bpt.y, bpt.x +der.x, bpt.y +der.y);
    line(bpt.x, bpt.y, bpt.x +normal.x, bpt.y +normal.y);
    stroke(100,50, 10);
    circle(bpt.x+ 0.2*normal.x, bpt.y+ 0.2*normal.y, 4);
    circle(bpt.x- 0.2*normal.x, bpt.y- 0.2*normal.y, 4);
    }
    
    let prev = points[0];
    for (let integral_part = 0; integral_part <points.length/4 ; integral_part++) {
      sub_points = points.slice(4* integral_part, 4* (integral_part+1));
      drawPoints(sub_points);
    }
  }
}
