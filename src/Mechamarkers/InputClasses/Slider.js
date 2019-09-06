import { calEMA } from '../Utils/General';
import { vecSub, vecMag, vecRot, vecScale, vecEMA, lineCP, vecUnit } from '../Utils/Vec2';
import { matrixTransform } from '../Utils/Distortion';

const CORNER_ANGLE = -3*Math.PI/4;
const xaxis = {x:1, y:0};
const yaxis = {x:0, y:1};

class Slider {
  constructor(markerData, inputData) {
      this.name = inputData.name;
      this.type = inputData.type;
      if (inputData.actorID !== '') {
        this.actor = markerData[inputData.actorID];
        this.actor.timeout = inputData.detectWindow;
        this.actor.inuse = true;
      }
      this.val = 0;
      this.relativePosition = {
          distance: inputData.relativePosition.distance,
          angle: inputData.relativePosition.angle - CORNER_ANGLE,
      }
      this.start = {
          distance: inputData.relativePosition.distance,
          angle: inputData.relativePosition.angle - CORNER_ANGLE,
      }
      this.end = {
          distance: inputData.endPosition.distance,
          angle: inputData.endPosition.angle - CORNER_ANGLE,
      }
      this.trackLength = vecMag(
          vecSub(
              vecRot(vecScale(xaxis, this.start.distance), this.start.angle), 
              vecRot(vecScale(xaxis, this.end.distance), this.end.angle)
              )
          );
      this.pos = {x:0, y:0};
      this.spos = {x:0, y:0};
      this.epos = {x:0, y:0};
      this.track = {x:0, y:0};
  }

  update(parent) {
    if(!this.actor) return;
    if (this.actor.present) {
        const rwpos = this.actor.center;
        this.pos = vecEMA(this.pos, matrixTransform(parent.matrixQuad2Rect, rwpos), 0.3);
        const as = vecRot(vecScale(xaxis, this.start.distance), -this.start.angle);
        this.spos = vecEMA(this.spos, as, 1.0);
        const ae = vecRot(vecScale(xaxis, this.end.distance), -this.end.angle);
        this.epos = vecEMA(this.spos, ae, 1.0);
        this.track = vecSub(this.spos, this.epos);
        
        let v = lineCP(this.epos, this.pos, this.spos).t;
        v = v > 1 ? 1 : v < 0 ? 0 : v; // constraining v between 0 to 1
        this.val = calEMA(v, this.val, 0.9);
    }
  }
  
  display(parent, ctx, pxpermm, w) {
    if(!this.actor) return;
    const screenpos = vecRot(vecScale(xaxis, this.relativePosition.distance*pxpermm), -this.relativePosition.angle);

    ctx.save();

    ctx.translate(parent.pos.x, parent.pos.y);
    ctx.rotate(parent.angle);
    ctx.translate(screenpos.x, screenpos.y);

    const dir = vecUnit(this.track);
    const te = vecScale(dir, w*3);
    const se = vecScale(dir, this.val * w*3);

    ctx.lineWidth = w;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(te.x, te.y);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(se.x, se.y);
    ctx.stroke();

    ctx.restore();
  }
}

export default Slider;
