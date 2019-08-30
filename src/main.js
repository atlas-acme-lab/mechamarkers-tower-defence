import Vec2 from './Utils/Vec2';
import Enemy from './Actors/Enemy';
import PathNode from './Actors/PathNode';

let canvas, ctx, prevTime;

const node1 = new PathNode(new Vec2(100, 100));
const node2 = new PathNode(new Vec2(300, 100));
const node3 = new PathNode(new Vec2(200, 200));
node1.setNext(node2);
node2.setNext(node3);
node3.setNext(node1);

const e = new Enemy(node1);

function update() {
  const currTime = Date.now();
  const dt = currTime - prevTime;
  prevTime = currTime;

  e.update(dt);

  // Draw
  ctx.clearRect(-1, -1, canvas.width + 1, canvas.height + 1);

  node1.draw(ctx);
  node2.draw(ctx);
  node3.draw(ctx);

  e.draw(ctx);

  window.requestAnimationFrame(update);
}

export function init() {
  prevTime = Date.now();
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');
  ctx.translate(0.5, 0.5); // dumb blurry fix

  window.requestAnimationFrame(update);
}