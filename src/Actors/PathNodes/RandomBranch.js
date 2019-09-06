import * as Vec2 from '../../Utils/Vec2';

const NODE_DIST = 5;
const NODE_DIST_SQ = NODE_DIST * NODE_DIST;

class RandomBranch {
  constructor(position) {
    this.position = position;
    this.nodeType = 'RANDOM_BRANCH';
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
    return Math.random() > 0.5 ? this.next1 : this.next2;
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(this.next1.position.x, this.next1.position.y);
    ctx.lineTo(this.position.x, this.position.y);
    ctx.lineTo(this.next2.position.x, this.next2.position.y);
    ctx.stroke();
    ctx.restore();
  }
}

export default RandomBranch;
