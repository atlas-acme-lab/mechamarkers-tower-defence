export default class Tower {
  constructor(position, addProjectile) {
    this.position = position;
    this.range = 90;
    this.center = 10;
    this.rangeSq = this.range * this.range;
    this.shootTimer = 0;
    this.SHOOT_MAX = 3000;
    this.addProjectile = addProjectile;

    this.shape = 'TRI';
    this.color = '#0000ff';
  }

  inRange(target) {
    return this.position.dist2(target) < this.rangeSq;
  }

  isClick(mouseVec) {
    return mouseVec.dist(this.position) < this.center;
  }

  setPosition(newPos) {
    this.position.copy(newPos);
  }

  update(dt, enemies) {
    if (this.shootTimer > 0) this.shootTimer -= dt;
    else {
      this.shootTimer = this.SHOOT_MAX;
      enemies.forEach(e => {
        if (this.inRange(e.position)) {
          this.addProjectile(this.position, e, this.shape, this.color);
        }
      });
    }

  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.translate(this.position.x, this.position.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.center, 0, 2 * Math.PI);
    ctx.arc(0, 0, this.range, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
}