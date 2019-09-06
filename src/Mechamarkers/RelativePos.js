import { vecMag, vecSub, vecAngleBetween } from './Utils/Vec2';
import { calDistortionMatrices, matrixTransform } from './Utils/Distortion';
import { inv } from 'mathjs';

export function checkPerspective(anchor, actor, edgeThres, perimeterThres) {
  return true;
}

export function relativePosition(anchor, actor, markerSize) {
  const ms = markerSize;
  const mc = [
    { x: -ms/2, y: -ms/2 },
    { x: ms/2, y: -ms/2 },
    { x: ms/2, y: ms/2 },
    { x: -ms/2, y: ms/2 }
  ];
  const r2q = calDistortionMatrices(
    anchor.allCorners[0], anchor.allCorners[1], anchor.allCorners[2], anchor.allCorners[3],
    mc[0], mc[1], mc[2], mc[3]
  );
  const q2r = inv(r2q);
  const ac = matrixTransform(q2r, actor.center);
  console.timeLog(ms, ac);
  return {
    distance: vecMag(ac),
    angle: vecAngleBetween(vecSub({x:0, y:0}, mc[0]), vecSub({x:0, y:0}, ac)),
  };
}
