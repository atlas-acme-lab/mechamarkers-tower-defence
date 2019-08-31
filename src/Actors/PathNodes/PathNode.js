import * as Vec2 from '../../Utils/Vec2';

const NODE_DIST = 1;
const NODE_DIST_SQ = NODE_DIST * NODE_DIST;

class PathNode {
  constructor(position) {
    this.position = position;
  }

  setNext(nextNode) {
    this.nextNode = nextNode;
  }

  hasArrived(pos) {
    if (this.position.dist2(pos) < NODE_DIST_SQ) {
      return true;
    } 
    return false;
  }

  getNextNode() {
    return this.nextNode;
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.nextNode.position.x, this.nextNode.position.y);
    ctx.stroke();
    ctx.restore();
  }
}

export default PathNode;
