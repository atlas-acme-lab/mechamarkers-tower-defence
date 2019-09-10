import * as Vec2 from '../../Utils/Vec2';

const NODE_DIST = 5;
const NODE_DIST_SQ = NODE_DIST * NODE_DIST;

class PathNode {
  constructor(position, isStart) {
    this.position = position;
    this.nodeType = 'PATH_NODE';
    this.isStart = isStart;
  }

  setNext(nextNode) {
    this.nextNode = nextNode;
  }

  setActive() {
    this.active = true;
    this.nextNode.setActive();
  }

  setInactive() {
    this.active = false;
    this.nextNode.setInactive();
  }

  getFullPath() {
    return [this.position, ...this.nextNode.getFullPath()];
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
    
    ctx.strokeStyle = this.active ? 'white' : 'white';
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.nextNode.position.x, this.nextNode.position.y);
    ctx.stroke();

    ctx.restore();
  }
}

export default PathNode;
