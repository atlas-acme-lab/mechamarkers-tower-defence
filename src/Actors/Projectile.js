import Vec2 from '../Utils/Vec2';

export default class Enemy {
  constructor(startPos, target, shape, color) {
    this.position = startPos.clone();
    this.target = target;
    this.speed = 0.04;
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
    this.isAlive = this.target.isAlive; // Kill when bullet dies

    const heading = Vec2.sub(this.position, this.target.position);
    heading.normalize();
    this.position.addScalar(heading, this.speed * dt);
    this.spin += dt * 0.005;

    this.trail.push(this.position.clone());
    if (this.trail.length > 30) this.trail.splice(0, 1);

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
    ctx.beginPath();
    ctx.moveTo(this.trail[0].x, this.trail[0].y);
    this.trail.forEach(t => ctx.lineTo(t.x, t.y));
    ctx.stroke();
    ctx.closePath();

    // shape
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.spin);
    ctx.beginPath();
    switch (this.shape) {
      case 'TRI':
        ctx.moveTo(this.triPoints[2].x, this.triPoints[2].y);
        this.triPoints.forEach(tp => ctx.lineTo(tp.x, tp.y));
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
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
}