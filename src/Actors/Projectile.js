import Vec2 from '../Utils/Vec2';

export default class Enemy {
  constructor(startPos, target, shape, color) {
    this.position = startPos.clone();
    this.target = target;
    this.speed = 0.01;
    this.timeAlive = 0;
    this.speedMax = 0.10;
    this.size = 8;
    this.spin = 0;
    this.isAlive = true;

    this.shape = shape;
    this.color = color;

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

    this.trail = [];
  }

  update(dt) {
    if (!this.isAlive) return;
    this.timeAlive += dt;
    this.speed = this.speedMax;
    this.speed = this.speed > this.speedMax ? this.speedMax : this.speed;
    this.isAlive = this.target.isAlive; // Kill when bullet dies

    const heading = Vec2.sub(this.position, this.target.position);
    heading.normalize();
    this.position.addScalar(heading, this.speed * dt);
    this.spin += dt * 0.005;

    this.trail.push(this.position.clone());
    if (this.trail.length > 38) this.trail.splice(0, 1);

    if (this.position.dist2(this.target.position) < 5) {
      this.isAlive = false;
      this.target.applyHit(this.shape, this.color);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = this.color;

    // trail
    // ctx.beginPath();
    // ctx.moveTo(this.trail[0].x, this.trail[0].y);
    // this.trail.forEach(t => ctx.lineTo(t.x, t.y));
    // ctx.stroke();
    // ctx.closePath();

    // shape
    // ctx.translate(this.position.x, this.position.y);
    // ctx.rotate(this.spin);
    // ctx.beginPath();
    switch (this.shape) {
      case 'TRI':
        // ctx.moveTo(this.triPoints[2].x, this.triPoints[2].y);
        // this.triPoints.forEach(tp => ctx.lineTo(tp.x, tp.y));
        drawProjectile(ctx, this.trail, this.spin, 20, 7, {r:255, g:255, b:100, a:1.0});
        break;
      case 'QUAD':
        // ctx.moveTo(this.quadPoints[3].x, this.quadPoints[3].y);
        // this.quadPoints.forEach(qp => ctx.lineTo(qp.x, qp.y));
        break;
      case 'PENT':
        // ctx.moveTo(this.pentPoints[4].x, this.pentPoints[4].y);
        // this.pentPoints.forEach(pp => ctx.lineTo(pp.x, pp.y));
        break;
      default:
        // ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
      break;
    }
    // ctx.fill();
    // ctx.stroke();
    // ctx.closePath();
    // ctx.restore();
  }
}

function drawProjectile(ctx, trail, spin, size, points, color) {
  let pointsArr = [];
  const xaxis = new Vec2(1, 0);

  for (let i=0; i<points; i++) {
    const p = xaxis.rotate(2 * Math.PI / points * i);
    pointsArr.push(p);
  }

  let accSize = [];
  let accOpa = [];
  for (let i=0; i<trail.length; i++) {
    accSize.push(size / 2 * Math.pow(0.96, i));
    accOpa.push(color.a * Math.pow(0.94, i))
  }
  accSize.sort((a, b) => (a - b));
  accOpa.sort((a, b) => (a - b));

  for (let i=0; i<trail.length; i++) {
    if (i % 4 === 3) {
      ctx.save();
      ctx.translate(trail[i].x, trail[i].y);
      ctx.rotate(spin);
      ctx.strokeStyle = 'rgba('+color.r+', '+color.g+', '+color.b+', '+accOpa[i]+')';
      ctx.beginPath();
      ctx.moveTo(pointsArr[points - 1].x * accSize[i], pointsArr[points - 1].y * accSize[i]);
      pointsArr.forEach(p => ctx.lineTo(p.x * accSize[i], p.y * accSize[i]));
      ctx.stroke();
    }
    
    // if (i === trail.length-1) {
    //   ctx.strokeStyle = 'black';
    //   ctx.stroke();
    // }

    ctx.restore();
  }

}