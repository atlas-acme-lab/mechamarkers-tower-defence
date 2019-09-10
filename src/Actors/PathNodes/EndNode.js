import * as Vec2 from '../../Utils/Vec2';

const NODE_DIST = 5;
const NODE_DIST_SQ = NODE_DIST * NODE_DIST;

class EndNode {
  constructor(position) {
    this.position = position;
    this.nodeType = 'END_NODE';
  }

  setActive() {
    this.active = true;
  }

  setInactive() {
    this.active = false;
  }

  getFullPath() {
    return [this.position];
  }

  hasArrived(pos) {
    if (this.position.dist2(pos) < NODE_DIST_SQ) {
      return true;
    } 
    return false;
  }

  getNextNode() {
    return false;
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = this.active ? 'white' : 'grey';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 15, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}

export default EndNode;
