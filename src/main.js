import Vec2 from './Utils/Vec2';
import Enemy from './Actors/Enemy';

// Nodes
import PathNode from './Actors/PathNodes/PathNode';
import EndNode from './Actors/PathNodes/EndNode';
import RandomBranch from './Actors/PathNodes/RandomBranch';

let canvas, ctx, prevTime;

const node1 = new PathNode(new Vec2(100, 200));
const node2 = new PathNode(new Vec2(200, 200));
const branch1 = new RandomBranch(new Vec2(300, 200));
const end1 = new EndNode(new Vec2(400, 100));
const end2 = new EndNode(new Vec2(400, 300));

node1.setNext(node2);
node2.setNext(branch1);
branch1.setNext(end1, end2);

const enemies = [];

const SPAWN_TIME_MAX = 2000;
let spawnTimer = SPAWN_TIME_MAX;

function filterEnemies() {
  const enemyToRemove = enemies.findIndex(e => !e.isAlive);
  if (enemyToRemove !== -1) enemies.splice(enemyToRemove, 1);
}

function update() {
  const currTime = Date.now();
  const dt = currTime - prevTime;
  prevTime = currTime;

  if (spawnTimer <= 0) {
    spawnTimer = SPAWN_TIME_MAX;
    enemies.push(new Enemy(node1));
  }
  else spawnTimer -= dt;
  enemies.forEach(e => e.update(dt));
  filterEnemies();

  // Draw
  ctx.clearRect(-1, -1, canvas.width + 1, canvas.height + 1);

  node1.draw(ctx);
  node2.draw(ctx);
  branch1.draw(ctx);
  end1.draw(ctx);
  end2.draw(ctx);

  enemies.forEach(e => e.draw(ctx));

  window.requestAnimationFrame(update);
}

export function init() {
  prevTime = Date.now();
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');
  ctx.translate(0.5, 0.5); // dumb blurry fix

  window.requestAnimationFrame(update);
}