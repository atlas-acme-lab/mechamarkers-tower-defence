export default class Tower {
  constructor(position, addProjectile) {
    this.position = position;
    this.range = 70;
    this.rangeSq = this.range * this.range;
    this.shootTimer = 0;
    this.SHOOT_MAX = 500;
    this.addProjectile = addProjectile;
  }

  inRange(target) {
    return this.position.dist2(target) < this.rangeSq;
  }

  update(dt, enemies) {
    if (this.shootTimer > 0) this.shootTimer -= dt;
    else {
      this.shootTimer = this.SHOOT_MAX;
      enemies.forEach(e => {
        if (this.inRange(e.position)) {
          this.addProjectile(this.position, e);
        }
      });
    }

  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.translate(this.position.x, this.position.y);
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
    ctx.arc(0, 0, this.range, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}