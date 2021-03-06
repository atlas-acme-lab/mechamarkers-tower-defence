import Vec2 from '../../Utils/Vec2';

const NODE_DIST = 5;
const NODE_DIST_SQ = NODE_DIST * NODE_DIST;

class SwitchBranch {
  constructor(position) {
    this.position = position;
    this.nodeType = 'SWITCH_BRANCH';
    this.flipped = false
  }

  setNext(n1, n2) {
    this.next1 = n1;
    this.next2 = n2;
  }

  hasArrived(pos) {
    if (this.position.dist2(pos) < NODE_DIST_SQ) {
      return true;
    } 
    return false;
  }

  getNextNode() {
    return this.flipped ? this.next2 : this.next1;
  }

  setActive() {
    this.active = true;

    // Always do inactive first so that
    // active things get set last and not overwritten
    if (this.flipped) {
      this.next1.setInactive();
      this.next2.setActive();
    } else {
      this.next2.setInactive();
      this.next1.setActive();
    }
  }

  setInactive() {
    this.active = false;
    this.next1.setInactive();
    this.next2.setInactive();
  }

  getFullPath() {
    const path = this.flipped ? this.next2.getFullPath() : this.next1.getFullPath();
    return [this.position, ...path];
  }

  flip() {
    this.flipped = !this.flipped;
  }

  draw(ctx) {
    const direction = !this.flipped ? Vec2.sub(this.position, this.next1.position) : Vec2.sub(this.position, this.next2.position);
    direction.normalize();
    direction.scale(30);
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.translate(this.position.x, this.position.y);
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(direction.x, direction.y);
    ctx.stroke();

    ctx.restore();

    ctx.save();
    // path 1
    ctx.strokeStyle = this.active && !this.flipped ? 'white' : 'white';
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.next1.position.x, this.next1.position.y);
    ctx.stroke();

    ctx.strokeStyle = this.active && this.flipped ? 'white' : 'white';
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.next2.position.x, this.next2.position.y);
    ctx.stroke();

    ctx.restore();
  }
}

export default SwitchBranch;
