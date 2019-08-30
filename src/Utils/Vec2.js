export default class Vec2 {
  // Static stuff
  static subtract(v1, v2) {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
  }

  static magnintude(v) {
    return Math.sqrt(v.x*v.x + v.y*v.y);
  }

  static magnintude2(v) {
    return (v.x*v.x + v.y*v.y);
  }

  // Instance methods
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  copy() {
    return new Vec2(this.x, this.y);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
  }

  addScalar(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
  }

  mag() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }

  mag2() {
    return (this.x*this.x + this.y*this.y);
  }

  dist(v) {
    return Vec2.magnintude(Vec2.subtract(this, v));
  }

  dist2(v) {
    return Vec2.magnintude2(Vec2.subtract(this, v));
  }

  normalize() {
    const m = this.mag();
    this.x /= m;
    this.y /= m;
  }
}
