import Vec2 from '../Utils/Vec2';

export default class Enemy {
  constructor(startNode) {
    this.position = startNode.position.clone();
    this.speed = 0.03;
    this.size = 15;
    this.setHeading(startNode.getNextNode());
    this.hp = 1;
    this.shape = 'TRI';
    this.color = '#0000ff';
    this.isAlive = true;

    const triAngle = 120 / 180 * Math.PI;
    // Shape stuff
    this.triPoints = [
      new Vec2(this.size, 0),
      new Vec2(this.size * Math.cos(triAngle), this.size * Math.sin(triAngle)),
      new Vec2(this.size * Math.cos(2 * triAngle), this.size * Math.sin(2 * triAngle)),
    ];

    this.quadPoints = [
      new Vec2(0, 1),
      new Vec2(1, 0),
      new Vec2(0, -1),
      new Vec2(-1, 0),
    ];
    this.quadPoints.forEach(v => v.scale(this.size));

    const pentAngle = 72 / 180 * Math.PI;
    this.pentPoints = [
      new Vec2(this.size, 0),
      new Vec2(this.size * Math.cos(pentAngle), this.size * Math.sin(pentAngle)),
      new Vec2(this.size * Math.cos(2 *pentAngle), this.size * Math.sin(2 *pentAngle)),
      new Vec2(this.size * Math.cos(3 *pentAngle), this.size * Math.sin(3 *pentAngle)),
      new Vec2(this.size * Math.cos(4 *pentAngle), this.size * Math.sin(4 *pentAngle)),
    ];
  }

  applyHit(shape, color) {
    if (shape === this.shape && color === this.color) this.hp -= 1;

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
    // ctx.save();
    // ctx.fillStyle = this.color;
    // ctx.translate(this.position.x, this.position.y);
    // ctx.beginPath();
    switch (this.shape) {
      case 'TRI':
        // ctx.moveTo(this.triPoints[2].x, this.triPoints[2].y);
        // this.triPoints.forEach(tp => ctx.lineTo(tp.x, tp.y));
        drawEnemy(ctx, this.position, this.forward, 30, 3, {r:0, g:255, b:150, a:0.8});
        break;
      case 'QUAD':
        ctx.moveTo(this.quadPoints[3].x, this.quadPoints[3].y);
        this.quadPoints.forEach(qp => ctx.lineTo(qp.x, qp.y));
        break;
      case 'PENT':
        ctx.moveTo(this.pentPoints[4].x, this.pentPoints[4].y);
        this.pentPoints.forEach(pp => ctx.lineTo(pp.x, pp.y));
        break;
      default:
        ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
        break;
    }
    // ctx.fill();
    // ctx.closePath();
    // ctx.restore();
  }
}

// NOTE TO PETER
// color is an object: {r:R, g:G, b:B, a:A}
// r/g/b: 0-255, a: 0-1
function drawEnemy(ctx, pos, forward, size, points, color) {
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
  ctx.strokeStyle = 'rgba('+color.r+', '+color.g+', '+color.b+', '+color.a*0.6+')';
  ctx.beginPath();
  ctx.moveTo(pointsArr[points - 1].x + randRange(randFactor), pointsArr[points - 1].y + randRange(randFactor));
  pointsArr.forEach(p => ctx.lineTo(p.x + randRange(randFactor), p.y + randRange(randFactor)));
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = 'rgba('+color.r+', '+color.g+', '+color.b+', '+color.a+')';
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