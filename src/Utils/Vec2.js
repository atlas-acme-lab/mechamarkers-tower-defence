export default class Vec2 {
  // Static stuff
  static sub(v1, v2) {
    return new Vec2(v2.x - v1.x, v2.y - v1.y);
  }

  static add(v1, v2) {
    return new Vec2(v2.x + v1.x, v2.y + v1.y);
  }

  static scale(v, s) {
    return new Vec2(v.x * s, v.y * s);
  }

  static dist(v1, v2) {
    return Vec2.sub(v1, v2).mag();
  }

  static dist2(v1, v2) {
    return Vec2.sub(v1, v2).mag2();
  }

  static normalize(v) {
    const m = v.mag();
    return new Vec2(v.x / m, v.y / m);
  }

  static copy(v) {
    return new Vec2(v.x, v.y);
  }

  // Instance methods
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  addScalar(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;

    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;

    return this;
  }

  mag() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }

  mag2() {
    return (this.x*this.x + this.y*this.y);
  }

  dist(v) {
    return Vec2.sub(this, v).mag();
  }

  dist2(v) {
    return Vec2.sub(this, v).mag2();
  }

  normalize() {
    const m = this.mag();
    this.x /= m;
    this.y /= m;

    return this;
  }

  rotate(angle) {
    const x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    const y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
    return {x:x, y:y};
  }


}
