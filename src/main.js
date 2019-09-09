import Vec2 from './Utils/Vec2';
import Enemy from './Actors/Enemy';
import { COLORS } from './Constants';

// Nodes
import PathNode from './Actors/PathNodes/PathNode';
import EndNode from './Actors/PathNodes/EndNode';
import RandomBranch from './Actors/PathNodes/RandomBranch';
import SwitchBranch from './Actors/PathNodes/SwitchBranch';

import Tower from './Actors/Tower';
import Projectile from './Actors/Projectile';

import * as Mechamarkers from './Mechamarkers';

let dragTarget;
let towerWasGrabbed = false;
let grabberWasPressed = false;

let canvas, ctx, prevTime;

const w = window.innerWidth;
const h = window.innerHeight;

// col 1
const startNode = new PathNode(new Vec2(w * 0.1, h / 2), true);
// col 2
const node1 = new SwitchBranch(new Vec2(w * 0.26, h / 2));
// col 3
const node2 = new PathNode(new Vec2(w * 0.42, h / 3), false);
const node3 = new PathNode(new Vec2(w * 0.42, h * 2 / 3), false);
// col 4
const node4 = new SwitchBranch(new Vec2(w * 0.58, h / 3));
const node5 = new SwitchBranch(new Vec2(w * 0.58, h * 2 / 3));
// col 5
const node6 = new PathNode(new Vec2(w * 0.74, h * 0.15), false);
const node7 = new PathNode(new Vec2(w * 0.74, h / 2), false);
const node8 = new PathNode(new Vec2(w * 0.74, h * 0.85), false);
// col 6
const node9 = new EndNode(new Vec2(w * 0.9, h * 0.15));
const node10 = new EndNode(new Vec2(w * 0.9, h / 2));
const node11 = new EndNode(new Vec2(w * 0.9, h * 0.85));

startNode.setNext(node1);
node1.setNext(node2, node3);
node2.setNext(node4);
node3.setNext(node5);
node4.setNext(node6, node7);
node5.setNext(node7, node8);
node6.setNext(node9);
node7.setNext(node10);
node8.setNext(node11);

const enemies = [];
const towers = [];
const projectiles = [];
const gates = [node1, node4, node5];

const SPAWN_TIME_MAX = 1700;
let spawnTimer = SPAWN_TIME_MAX;

let spawnTypeTimer = 8000;
let spawnSides = 3;
let spawnColor = COLORS.GOLD;

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
  const grabPoint = Vec2.copy(Mechamarkers.mapPointToCanvas(grabber.pos, window.innerWidth, window.innerHeight));
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(grabPoint.x, grabPoint.y, 40, 0, Math.PI * 2);
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
    enemies.push(new Enemy(startNode, spawnSides, spawnColor));
  }
  else spawnTimer -= dt;

  if (spawnTypeTimer <= 0) {
    spawnTypeTimer = 8000;
    spawnSides = Math.floor(Math.random() * 4 + 3);
    spawnSides = spawnSides > 6 ? 6 : spawnSides;
    spawnColor = Object.values(COLORS)[Math.floor(Math.random() * Object.values(COLORS).length)]
  }
  spawnTypeTimer -= dt;

  enemies.forEach(e => e.update(dt));
  towers.forEach(t => t.update(dt, enemies));
  projectiles.forEach(p => p.update(dt));

  // Switch Gate
  const gateSwitch = Mechamarkers.getGroup('Gate Switch');
  const towerSetter = Mechamarkers.getGroup('Tower Setter');
  const towerGrabber = Mechamarkers.getGroup('Tower Grabber');

  // Switch logic
  if (gateSwitch && gateSwitch.isPresent()) {
    const gatePoint = Vec2.copy(Mechamarkers.mapPointToCanvas(gateSwitch.pos, window.innerWidth, window.innerHeight));
    const targetGate = gates.find(g => g.position.dist(gatePoint) < 30);
    if (targetGate) targetGate.flipped = (gateSwitch.getInput('switch').val > 0.5);
  }

  if (towerSetter && towerSetter.isPresent()) {
    const setterPoint = Vec2.copy(Mechamarkers.mapPointToCanvas(towerSetter.pos, window.innerWidth, window.innerHeight));
    const targetTower = towers.find(t => {
      return t.position.dist(setterPoint) < 100
    });

    if (targetTower) {
      if (towerSetter.getInput('Shape').val < 0.2) {
        targetTower.sides = 3;
      } else if (towerSetter.getInput('Shape').val < 0.5) {
        targetTower.sides = 4;
      } else if (towerSetter.getInput('Shape').val < 0.8) {
        targetTower.sides = 5;
      } else {
        targetTower.sides = 6;
      }

      console.log(towerSetter.getInput('Color').val);
    }
  }

  // Grabber logic, this if is bc some code run before stuff is loaded, should have a stuff is loaded callback
  if (towerGrabber) {
    const currGrabberPress = towerGrabber.isPresent();
    if (currGrabberPress) {
      const grabPoint = Vec2.copy(Mechamarkers.mapPointToCanvas(towerGrabber.pos, window.innerWidth, window.innerHeight));
      // Essentially mouse down event
      if (!grabberWasPressed && currGrabberPress) {

        if (!towerWasGrabbed) dragTarget = towers.find(t => t.isClick(grabPoint, 50));
        if (dragTarget) dragTarget.isHeld = true;
      }

      if (dragTarget) {
        dragTarget.position.x = grabPoint.x;
        dragTarget.position.y = grabPoint.y;
      }
    }

    // Grabber up
    if (grabberWasPressed && !currGrabberPress) {
      if (towerWasGrabbed) {
        const grabPoint = Vec2.copy(Mechamarkers.mapPointToCanvas(towerGrabber.pos, window.innerWidth, window.innerHeight));
        dragTarget.position.x = grabPoint.x;
        dragTarget.position.y = grabPoint.y;
        dragTarget.isHeld = false;
        dragTarget = null;
        towerWasGrabbed = false;
      } else if (dragTarget) {
        towerWasGrabbed = true;
      }
    }
    
    grabberWasPressed = currGrabberPress;
  }

  filterActors();

  // Draw
  ctx.clearRect(-1, -1, canvas.width + 1, canvas.height + 1);

  // Temp draw grabber
  if (towerGrabber && towerGrabber.isPresent()) drawGrabber(towerGrabber);

  startNode.draw(ctx);
  node1.draw(ctx);
  node2.draw(ctx);
  node3.draw(ctx);
  node4.draw(ctx);
  node5.draw(ctx);
  node6.draw(ctx);
  node7.draw(ctx);
  node8.draw(ctx);
  node9.draw(ctx);
  node10.draw(ctx);
  node11.draw(ctx);

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
  towers.push(new Tower(new Vec2(400, 300), addProjectile));

  resize();
  window.onresize = resize;
  window.requestAnimationFrame(update);
}
