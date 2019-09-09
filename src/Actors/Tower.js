import { COLORS } from '../Constants';
import Vec2 from '../Utils/Vec2';

export default class Tower {
  constructor(position, addProjectile) {
    this.position = position;
    this.range = 90;
    this.center = 10;
    this.rangeSq = this.range * this.range;
    this.shootTimer = 0;
    this.shootRotate = 0;
    this.timeStamp = 0;
    this.SHOOT_MAX = 3000;
    this.addProjectile = addProjectile;

    this.sides = 5;
    this.color = COLORS.GOLD;
  }

  inRange(target) {
    return this.position.dist2(target) < this.rangeSq;
  }

  isClick(mouseVec, d) {
    return mouseVec.dist(this.position) < this.center + d;
  }

  setPosition(newPos) {
    this.position.copy(newPos);
  }

  update(dt, enemies) {
    const delta = Date.now() - this.timeStamp;
    this.timeStamp = Date.now();
    this.shootRotate = this.shootRotate + delta/1000;
    
    let enemyCount = 0;
    enemies.forEach(e => {
      if (this.inRange(e.position)) {
        enemyCount++;
      }
    });

    if (enemyCount > 0) {
      if (this.shootTimer < 1000) this.shootRotate = this.shootRotate + Math.pow((1000 - this.shootTimer)/1000, 2) * 0.3;
      if (this.shootTimer > this.SHOOT_MAX - 700) this.shootRotate = this.shootRotate + Math.pow((700 - this.SHOOT_MAX + this.shootTimer)/700, 2) * 0.3;
    }

    this.shootRotate = this.shootRotate % (2*Math.PI);

    if (this.shootTimer > 0) this.shootTimer -= dt;
    else {
      this.shootTimer = this.SHOOT_MAX;
      enemies.forEach(e => {
        if (this.inRange(e.position)) {
          this.addProjectile(this.position, e, this.sides, this.color);
        }
      });
    }
  }

  draw(ctx) {
    if (this.isHeld)
      drawTower(ctx, this.position, this.range / 2, 20, this.sides, this.color, 0.3, this.shootRotate)
    else 
      drawTower(ctx, this.position, this.range, 20, this.sides, this.color, 1.0, this.shootRotate)
  }
}

function drawTower(ctx, pos, range, size, points, color, alpha, rotateVal) {
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

  ctx.strokeStyle = 'rgba('+color.r+', '+color.g+', '+color.b+', '+alpha+')';
  ctx.beginPath();
  ctx.moveTo(randBoundaryA[0].x, randBoundaryA[0].y);
  randBoundaryA.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.stroke();

  ctx.rotate(rotateVal);

  ctx.fillStyle = 'rgba('+color.r+', '+color.g+', '+color.b+', '+alpha+')';
  ctx.beginPath();
  ctx.moveTo(pointsArr[points - 1].x, pointsArr[points - 1].y);
  pointsArr.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.fill();
  pointsArr.forEach(p => {
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, size/15, size/15, 0, 0, 2*Math.PI, false);
    ctx.fill();
  });

  ctx.restore();
}

function randRange(r) {
  const val = Math.random()*r;
  return val - r/2;
}