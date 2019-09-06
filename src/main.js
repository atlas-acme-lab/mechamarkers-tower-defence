import Vec2 from './Utils/Vec2';
import Enemy from './Actors/Enemy';

// Nodes
import PathNode from './Actors/PathNodes/PathNode';
import EndNode from './Actors/PathNodes/EndNode';
import RandomBranch from './Actors/PathNodes/RandomBranch';
import SwitchBranch from './Actors/PathNodes/SwitchBranch';

import Tower from './Actors/Tower';
import Projectile from './Actors/Projectile';

import * as Mechamarkers from './Mechamarkers';

let dragTarget;
let grabberWasPressed;
let secondGrabPress;

let canvas, ctx, prevTime;

const node1 = new PathNode(new Vec2(100, 200));
const node2 = new PathNode(new Vec2(200, 200));
const branch1 = new SwitchBranch(new Vec2(300, 200));
const end1 = new EndNode(new Vec2(400, 100));
const end2 = new EndNode(new Vec2(400, 300));

node1.setNext(node2);
node2.setNext(branch1);
branch1.setNext(end1, end2);

const enemies = [];
const towers = [];
const projectiles = [];

const SPAWN_TIME_MAX = 2000;
let spawnTimer = SPAWN_TIME_MAX;

const SCREEN = {
  rx: (4+14/16)*25.4, // mm (real world dimensions)
  ry: (3+14/16)*25.4, // mm (real world dimensions)
  rw: (35+12/16)*25.4, // mm (real world dimensions)
  rh: (22+0/16)*25.4, // mm (real world dimensions)
  w: window.innerWidth, // px (screen resolution)
  h: window.innerHeight, // px (screen resolution)
};


function mapToScreen(pt) {
  if (pt.x >= SCREEN.rx && pt.x <= SCREEN.rx + SCREEN.rw && pt.y >= SCREEN.ry && pt.y <= SCREEN.ry + SCREEN.rh) {
      var px = pt.x - SCREEN.rx;
      var py = pt.y - SCREEN.ry;
      px = (px / SCREEN.rw) * SCREEN.w;
      py = (py / SCREEN.rh) * SCREEN.h;
      return {x:px, y:py};
  }
  // Don't return undefined
  return { x: 0, y: 0};
}

function unitToScreen(val) {
  return (val / SCREEN.rw * SCREEN.w);
}

function addProjectile(start, target, shape, color) {
  projectiles.push(new Projectile(start, target, shape, color));
}

function filterActors() {
  const enemyToRemove = enemies.findIndex(e => !e.isAlive);
  if (enemyToRemove !== -1) enemies.splice(enemyToRemove, 1);

  const projToRemove = projectiles.findIndex(p => !p.isAlive);
  if (projToRemove !== -1) projectiles.splice(projToRemove, 1);
}

function drawGrabber(grabber) {
  const grabPos = mapToScreen(Mechamarkers.mapPointToCanvas(grabber.pos));
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(grabPos.x, grabPos.y, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function update() {
  const currTime = Date.now();
  const dt = currTime - prevTime;
  prevTime = currTime;

  Mechamarkers.update(currTime);

  if (spawnTimer <= 0) {
    spawnTimer = SPAWN_TIME_MAX;
    enemies.push(new Enemy(node1));
  }
  else spawnTimer -= dt;

  enemies.forEach(e => e.update(dt));
  towers.forEach(t => t.update(dt, enemies));
  projectiles.forEach(p => p.update(dt));

  // Switch Gate
  const gateSwitch = Mechamarkers.getGroup('Gate Switch');
  const towerSetter = Mechamarkers.getGroup('Tower Setter');
  const towerGrabber = Mechamarkers.getGroup('Tower Grabber');
  // gateSwitch.getInput('switch').val;

  // Switch logic
  if (gateSwitch && gateSwitch.isPresent()) {
    // const gatePoint = Mechamarkers.mapPointToCanvas(grabber.pos, window.innerWidth, window.innerHeight);


  }

  // Grabber logic, this if is bc some code run before stuff is loaded, should have a stuff is loaded callback
  if (towerGrabber) {
    const currGrabberPress = towerGrabber.isPresent();
    if (currGrabberPress) {
      const grabPoint = Vec2.copy(Mechamarkers.mapPointToCanvas(towerGrabber.pos, window.innerWidth, window.innerHeight));
      // Essentially mouse down event
      if (!grabberWasPressed && currGrabberPress) {
        // find tower if no tower grabbed, otherwise 
        if (!dragTarget) dragTarget = towers.find(t => t.isClick(grabPoint));
        else {
          dragTarget.position.x = grabPoint.x;
          dragTarget.position.y = grabPoint.y;
          dragTarget = null;
        }
      }

      if (dragTarget && grabberWasPressed && currGrabberPress) {
        dragTarget.position.x = grabPoint.x;
        dragTarget.position.y = grabPoint.y;
      }
    }

    // Grabber up
    // if (grabberWasPressed && !currGrabberPress) {

    // }
    
    grabberWasPressed = currGrabberPress;
  }

  filterActors();

  // Draw
  ctx.clearRect(-1, -1, canvas.width + 1, canvas.height + 1);

  // Temp draw grabber
  if (towerGrabber && towerGrabber.isPresent()) drawGrabber(towerGrabber);

  node1.draw(ctx);
  node2.draw(ctx);
  branch1.draw(ctx);
  end1.draw(ctx);
  end2.draw(ctx);

  enemies.forEach(e => e.draw(ctx));
  towers.forEach(t => t.draw(ctx));
  projectiles.forEach(p => p.draw(ctx));

  window.requestAnimationFrame(update);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

export function init() {
  prevTime = Date.now();
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');
  ctx.translate(0.5, 0.5); // dumb blurry fix

  Mechamarkers.init(canvas, ctx);

  // Put towers in
  towers.push(new Tower(new Vec2(200, 240), addProjectile));

  canvas.addEventListener('mousedown', e => {
    const mouseVec = new Vec2(e.x, e.y);
    dragTarget = towers.find(t => t.isClick(mouseVec));

    if (!dragTarget) branch1.flip();
  });

  canvas.addEventListener('mousemove', e => {
    const mouseVec = new Vec2(e.x, e.y);
    if (dragTarget) {
      dragTarget.setPosition(mouseVec);
    }
  });

  canvas.addEventListener('mouseup', () => dragTarget = null);

  resize();
  window.onresize = resize;
  window.requestAnimationFrame(update);
}
