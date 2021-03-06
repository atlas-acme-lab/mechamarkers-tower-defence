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

let pause = false;
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
node1.flipped = true;
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

let spawnTypeTimer = 5000;
let SPAWN_TYPE_MAX = 5000;
let spawnSides = 3;
let spawnColor = COLORS.GOLD;
let canSpawn = true;
let SPAWN_BUFFER_MAX = 1200;
let spawnBuffer = SPAWN_BUFFER_MAX;

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
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(grabPoint.x, grabPoint.y, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function drawSetter(setter) {
  const pos = Vec2.copy(Mechamarkers.mapPointToCanvas(setter.pos, window.innerWidth, window.innerHeight));
  const colorVal = setter.getInput('Color').val;

  ctx.save();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.translate(pos.x, pos.y);
  ctx.rotate(-setter.angle);
  ctx.translate(90, 35);
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.stroke();

  let wheelAlpha = 0.5;

  ctx.beginPath();
  wheelAlpha = (colorVal < -1.5 && colorVal < 3.1) ? 1 : 0.5;
  ctx.strokeStyle = `rgba(${COLORS.BLUE.r}, ${COLORS.BLUE.g}, ${COLORS.BLUE.b}, ${wheelAlpha})`;
  ctx.lineWidth = (colorVal < -1.5 && colorVal < 3.1) ? 16 : 12;
  ctx.arc(0, 0, 50, -0.1, -1.5,true);
  ctx.stroke();

  ctx.beginPath();
  wheelAlpha = (colorVal < -0.1 && colorVal > -1.4) ? 1 : 0.5;
  ctx.strokeStyle = `rgba(${COLORS.PINK.r}, ${COLORS.PINK.g}, ${COLORS.PINK.b}, ${wheelAlpha})`;
  ctx.lineWidth = (colorVal < -0.1 && colorVal > -1.4) ? 16 : 12;
  ctx.arc(0, 0, 50, 1.4, 0, true);
  ctx.stroke();

  ctx.beginPath();
  wheelAlpha = (colorVal < 1.4 && colorVal > 0) ? 1 : 0.5;
  ctx.strokeStyle = `rgba(${COLORS.GREEN.r}, ${COLORS.GREEN.g}, ${COLORS.GREEN.b}, ${wheelAlpha})`;
  ctx.lineWidth = (colorVal < 1.4 && colorVal > 0) ? 16 : 12;
  ctx.arc(0, 0, 50, 3.1, 1.5, true);
  ctx.stroke();

  ctx.beginPath();
  wheelAlpha = (colorVal < 2.9 && colorVal > 1.5) ? 1 : 0.5;
  ctx.strokeStyle = `rgba(${COLORS.GOLD.r}, ${COLORS.GOLD.g}, ${COLORS.GOLD.b}, ${wheelAlpha})`;
  ctx.lineWidth = (colorVal < 2.9 && colorVal > 1.5) ? 16 : 12;
  ctx.arc(0, 0, 50, -1.6, -3.1, true);
  ctx.stroke();
  ctx.restore();
}

function drawSwitch(gateSwitch) {
  const pos = Vec2.copy(Mechamarkers.mapPointToCanvas(gateSwitch.pos, window.innerWidth, window.innerHeight));
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function update() {
  if (pause) {
    prevTime = Date.now();
    window.requestAnimationFrame(update);
    return;
  }
  const currTime = Date.now();
  const dt = (currTime - prevTime);
  prevTime = currTime;

  Mechamarkers.update(currTime);
  // trigger active state on all nodes
  startNode.setActive();

  if (canSpawn) {
    if (spawnTimer <= 0) {
      spawnTimer = SPAWN_TIME_MAX;
      enemies.push(new Enemy(startNode, spawnSides, spawnColor));
    }
    else spawnTimer -= dt;
    
    if (spawnTypeTimer <= 0) {
      spawnTypeTimer = SPAWN_TYPE_MAX;
      spawnSides = Math.floor(Math.random() * 4 + 3);
      spawnSides = spawnSides > 6 ? 6 : spawnSides;
      spawnColor = Object.values(COLORS)[Math.floor(Math.random() * Object.values(COLORS).length)]
  
      // spawn buffer
      canSpawn = false;
      spawnBuffer = SPAWN_BUFFER_MAX;
    }
    spawnTypeTimer -= dt;
  } else {
    spawnBuffer -= dt;
    if (spawnBuffer <= 0) {
      canSpawn = true;
    }
  }

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
    const targetGate = gates.find(g => g.position.dist(gatePoint) < 50);
    if (targetGate) targetGate.flipped = !(gateSwitch.getInput('switch').val > 0.5);
  }

  if (towerSetter && towerSetter.isPresent()) {
    const setterPoint = Vec2.copy(Mechamarkers.mapPointToCanvas(towerSetter.pos, window.innerWidth, window.innerHeight));
    // 85, 25
    const center = new Vec2(85, 25);
    center.rotate(-towerSetter.angle);
    center.add(setterPoint);
    const targetTower = towers.find(t => t.position.dist(center) < 50);

    if (targetTower) {
      const shapeVal = towerSetter.getInput('Shape').val;

      if (shapeVal < 0.2) {
        targetTower.sides = 3;
      } else if (shapeVal < 0.65) {
        targetTower.sides = 4;
      } else if (shapeVal < 0.80) {
        targetTower.sides = 5;
      } else if (shapeVal > 0.80) {
        targetTower.sides = 6;
      }

      const colorVal = towerSetter.getInput('Color').val;
      if (colorVal < 2.9 && colorVal > 1.5) {
        targetTower.color = COLORS.GOLD;
      } else if (colorVal < 1.4 && colorVal > 0) {
        targetTower.color = COLORS.GREEN;
      } else if (colorVal < -1.5 && colorVal < 3.1) {
        targetTower.color = COLORS.BLUE;
      } else if (colorVal < -0.1 && colorVal > -1.4) {
        targetTower.color = COLORS.PINK;
      }
    }
  }

  // Grabber logic, this if is bc some code run before stuff is loaded, should have a stuff is loaded callback
  if (towerGrabber) {
    const currGrabberPress = towerGrabber.isPresent();
    if (currGrabberPress) {
      const grabPoint = Vec2.copy(Mechamarkers.mapPointToCanvas(towerGrabber.pos, window.innerWidth, window.innerHeight));

      if (dragTarget) {
        dragTarget.position.x = grabPoint.x;
        dragTarget.position.y = grabPoint.y;
      }
    }

    // Grabber up
    if (grabberWasPressed && !currGrabberPress) {
      const grabPoint = Vec2.copy(Mechamarkers.mapPointToCanvas(towerGrabber.pos, window.innerWidth, window.innerHeight));
      if (towerWasGrabbed) {
        dragTarget.position.x = grabPoint.x;
        dragTarget.position.y = grabPoint.y;
        dragTarget.isHeld = false;
        dragTarget = null;
        towerWasGrabbed = false;
      } else if (!towerWasGrabbed && !dragTarget) {
        if (!towerWasGrabbed) dragTarget = towers.find(t => t.isClick(grabPoint, 50));
        if (dragTarget) {
          dragTarget.isHeld = true;
          towerWasGrabbed = true;
        }
      }
    }
    
    grabberWasPressed = currGrabberPress;
  }

  filterActors();

  // Draw
  ctx.clearRect(-1, -1, canvas.width + 1, canvas.height + 1);

  // Temp draw grabber
  if (towerGrabber && towerGrabber.isPresent()) drawGrabber(towerGrabber);
  if (towerSetter && towerSetter.isPresent()) drawSetter(towerSetter);
  if (gateSwitch && gateSwitch.isPresent()) drawSwitch(gateSwitch);

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

  const pathPts = startNode.getFullPath();
  
  const pathSeg = 12;
  let interpPts = [];

  for (let i = 1; i < pathPts.length; i++) {
    const start = Vec2.copy(pathPts[i - 1]);
    const end = Vec2.copy(pathPts[i]);
    const traj = Vec2.sub(start, end);
    for (let j = 0; j < pathSeg; j++) {
      const trajAdd = Vec2.scale(traj, j/pathSeg);
      interpPts.push(Vec2.add(start, trajAdd));
    }
  }
  interpPts.push(pathPts[pathPts.length-1]);

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(pathPts[0].x, pathPts[0].y);
  pathPts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.stroke();

  const randFactor = 11;
  ctx.strokeStyle = 'rgba('+Math.floor(100+Math.random()*155)+', '+Math.floor(100+Math.random()*155)+', '+Math.floor(100+Math.random()*155)+', 1.0)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(interpPts[0].x, interpPts[0].y);
  interpPts.forEach(p => {
    const randX = (Math.random() * randFactor) - (randFactor / 2);
    const randY = (Math.random() * randFactor) - (randFactor / 2);
    ctx.lineTo(p.x + randX, p.y + randY)
  });
  ctx.stroke();

  ctx.restore();

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

  document.addEventListener('keypress', (e) => {
    if (e.key === 'p') pause = !pause; 
  });

  Mechamarkers.init(canvas, ctx);

  // Put towers in
  const towerY = window.innerHeight / 4 * 3;
  const towerX = window.innerWidth / 2;
  towers.push(new Tower(new Vec2(towerX - 400, towerY), addProjectile));
  towers.push(new Tower(new Vec2(towerX - 200, towerY), addProjectile));
  towers.push(new Tower(new Vec2(towerX, towerY), addProjectile));
  towers.push(new Tower(new Vec2(towerX + 200, towerY), addProjectile));
  towers.push(new Tower(new Vec2(towerX + 400, towerY), addProjectile));

  resize();
  window.onresize = resize;
  window.requestAnimationFrame(update);
}
