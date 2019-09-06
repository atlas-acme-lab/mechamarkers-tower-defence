import Vec2 from '../Utils/Vec2';

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
    // ctx.save();
    // ctx.strokeStyle = 'white';
    // ctx.translate(this.position.x, this.position.y);
    // ctx.beginPath();
    // ctx.arc(0, 0, this.center, 0, 2 * Math.PI);
    // ctx.arc(0, 0, this.range, 0, 2 * Math.PI);
    // ctx.stroke();
    // ctx.closePath();
    // ctx.restore();

    drawTower(ctx, this.position, this.range, 20, 3, {r:0, g:255, b:150, a:1.0})
  }
}

function drawTower(ctx, pos, range, size, points, color) {
  
  const xaxis = new Vec2(1, 0);
  let pointsArr = [];
  for (let i=0; i<points; i++) {
    const p = Vec2.scale(xaxis.rotate(2 * Math.PI / points * i), size/2);
    pointsArr.push(p);
  }

  const randFactor = 4;
  const randPoints = 30;
  let randBoundaryA = [];
  for (let i=0; i<randPoints; i++) {
    const p1 = Vec2.scale(xaxis.rotate(2 * Math.PI / randPoints * i), range + randRange(randFactor));
    randBoundaryA.push(p1);
  }

  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate((Date.now()/1000) % (Math.PI*2));

  ctx.strokeStyle = 'rgba('+color.r+', '+color.g+', '+color.b+', '+color.a+')';
  ctx.beginPath();
  ctx.moveTo(pointsArr[points - 1].x, pointsArr[points - 1].y);
  pointsArr.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.stroke();

  ctx.strokeStyle = 'rgba('+color.r+', '+color.g+', '+color.b+', '+color.a+')';
  ctx.beginPath();
  ctx.moveTo(randBoundaryA[0].x, randBoundaryA[0].y);
  randBoundaryA.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

function randRange(r) {
  const val = Math.random()*r;
  return val - r/2;
}