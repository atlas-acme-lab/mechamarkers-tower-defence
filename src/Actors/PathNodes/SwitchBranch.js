import * as Vec2 from '../../Utils/Vec2';

const NODE_DIST = 1;
const NODE_DIST_SQ = NODE_DIST * NODE_DIST;

class SwitchBranch {
  constructor(position) {
    this.position = position;
    this.nodeType = 'SWITCH_BRANCH';
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

  flip() {
    this.flipped = !this.flipped;
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.lineTo(this.position.x, this.position.y);
    if (this.flipped) ctx.lineTo(this.next2.position.x, this.next2.position.y);
    else ctx.lineTo(this.next1.position.x, this.next1.position.y);
    ctx.stroke();
    ctx.restore();
  }
}

export default SwitchBranch;
