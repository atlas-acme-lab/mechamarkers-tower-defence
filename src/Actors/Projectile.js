import { COLORS } from '../Constants';
import Vec2 from '../Utils/Vec2';

export default class Projectile {
  constructor(startPos, target, sides, color) {
    this.position = startPos.clone();
    this.target = target;
    this.speed = 0.01;
    this.timeAlive = 0;
    this.speedMax = 0.10;
    this.size = 8;
    this.spin = 0;
    this.isAlive = true;

    this.sides = sides;
    this.color = color;
    this.trail = [];
  }

  update(dt) {
    // Bail if dead and wait for filter
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
      this.target.applyHit(this.sides, this.color);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = this.color;
    drawProjectile(ctx, this.trail, this.spin, 20, this.sides, this.color, 1.0);
  }
}

function drawProjectile(ctx, trail, spin, size, points, color, alpha) {
  let pointsArr = [];
  const xaxis = new Vec2(1, 0);

  for (let i=0; i<points; i++) {
    const p = Vec2.rotate(xaxis, 2 * Math.PI / points * i);
    pointsArr.push(p);
  }

  let accSize = [];
  let accOpa = [];
  for (let i=0; i<trail.length; i++) {
    accSize.push(size / 2 * Math.pow(0.96, i));
    accOpa.push(alpha * Math.pow(0.94, i))
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

    ctx.restore();
  }

}