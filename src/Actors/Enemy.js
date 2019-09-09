import { COLORS } from '../Constants';
import Vec2 from '../Utils/Vec2';

export default class Enemy {
  constructor(startNode, sides, color) {
    this.position = startNode.position.clone();
    this.speed = 0.03;
    this.size = 15;
    this.setHeading(startNode.getNextNode());
    this.hp = 1;
    this.sides = sides;
    this.color = color;
    this.isAlive = true;
  }

  applyHit(sides, color) {
    if (sides == this.sides && color == this.color) this.hp -= 1;
    if (this.hp <= 0) this.isAlive = false;
  }

  setHeading(target) {
    this.target = target;
    this.forward = Vec2.sub(this.position, this.target.position);
    this.forward.normalize();
  }

  update(dt) {
    if (!this.isAlive) return;

    this.position.addScalar(this.forward, this.speed * dt);

    if (this.target.hasArrived(this.position)) {
      const nextNode = this.target.getNextNode();

      if (nextNode) this.setHeading(nextNode);
      else {
        this.isAlive = false;
      }
    }
  }

  draw(ctx) {
    drawEnemy(ctx, this.position, this.forward, 27, this.sides, this.color, 0.8);
  }
}

// NOTE TO PETER
// color is an object: {r:R, g:G, b:B, a:A}
// r/g/b: 0-255, a: 0-1
function drawEnemy(ctx, pos, forward, size, points, color, alpha) {
  const randFactor = 3;
  let pointsArr = [];
  for (let i=0; i<points; i++) {
    const p = Vec2.scale(forward.rotate(2 * Math.PI / points * i), size/2);
    pointsArr.push(p);
  }

  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.lineJoin = "round";

  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba('+color.r+', '+color.g+', '+color.b+', '+alpha*0.6+')';
  ctx.beginPath();
  ctx.moveTo(pointsArr[points - 1].x + randRange(randFactor), pointsArr[points - 1].y + randRange(randFactor));
  pointsArr.forEach(p => ctx.lineTo(p.x + randRange(randFactor), p.y + randRange(randFactor)));
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = 'rgba('+color.r+', '+color.g+', '+color.b+', '+alpha+')';
  ctx.beginPath();
  ctx.moveTo(pointsArr[points - 1].x, pointsArr[points - 1].y);
  pointsArr.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.fill();

  ctx.restore();
}

function randRange(r) {
  const val = Math.random()*r;
  return val - r/2;
}