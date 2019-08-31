import Vec2 from '../Utils/Vec2';

export default class Enemy {
  constructor(startNode) {
    this.position = startNode.position.copy();
    this.speed = 0.03;
    this.size = 10;
    this.setHeading(startNode.getNextNode());

    this.isAlive = true;
  }

  setHeading(target) {
    this.target = target;
    this.forward = Vec2.sub(this.position, this.target.position);
    this.forward.normalize();
  }

  update(dt) {
    this.position.addScalar(this.forward, this.speed * dt);

    if (this.target.hasArrived(this.position)) {
      const nextNode = this.target.getNextNode();

      if (nextNode) this.setHeading(nextNode);
      else {
        this.isAlive = false;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.translate(this.position.x, this.position.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}