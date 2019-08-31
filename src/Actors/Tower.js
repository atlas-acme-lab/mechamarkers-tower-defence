export default class Tower {
  constructor(position) {
    this.position = position;
    this.range = 30;
    this.rangeSq = this.range * this.range;
    this.shootTimer = 0;
    this.SHOOT_MAX = 500;
  }

  inRange(target) {
    return this.position.dist2(target) < this.rangeSq;
  }

  update(dt, enemies) {
    if (this.shootTimer > 0) this.shootTimer -= dt;
    else {
      enemies.forEach(e => {

      });
    }

  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.translate(this.position.x, this.position.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}