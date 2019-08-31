import Vec2 from '../Utils/Vec2';

export default class Enemy {
  constructor(startPos, target) {
    this.position = startPos.copy();
    this.target = target;
    this.speed = 0.06;
    this.size = 5;

    this.isAlive = true;
  }

  hasHitTarget() {

  }

  update(dt) {
    const heading = Vec2.sub(this.position, this.target.position);
    heading.normalize();
    this.position.addScalar(heading, this.speed * dt);
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}