// LENZ XR v0.5: bounded teleport + first player-interactable 3D clue.
// Pure helpers keep the VR movement and story conditions separately testable.
import {currentZone} from './xr-gates.js';
export const TELEPORT_BOUNDS={xmin:-4.3,xmax:4.3,zmin:-11.8,zmax:1};
export const TERMINAL={x:0,y:1.15,z:-5.15,radius:.62};

export function rayDirection(q){
 if(!q||![q.x,q.y,q.z,q.w].every(Number.isFinite))return null;
 return {
  x:-2*(q.x*q.z+q.w*q.y),
  y:2*(q.x*q.w-q.y*q.z),
  z:-1+2*(q.x*q.x+q.y*q.y)
 };
}
export function raySphere(position,orientation,sphere=TERMINAL,maxDistance=10){
 if(!position||![position.x,position.y,position.z].every(Number.isFinite))return null;
 const d=rayDirection(orientation);
 if(!d)return null;
 const ox=position.x-sphere.x,oy=position.y-sphere.y,oz=position.z-sphere.z;
 const b=ox*d.x+oy*d.y+oz*d.z;
 const c=ox*ox+oy*oy+oz*oz-sphere.radius*sphere.radius;
 const disc=b*b-c;
 if(disc<0)return null;
 const hit=-b-Math.sqrt(disc);
 return hit>0.2&&hit<=maxDistance?hit:null;
}
export function floorTarget(position,orientation){
 if(!position||![position.x,position.y,position.z].every(Number.isFinite))return null;
 const d=rayDirection(orientation);
 if(!d||d.y>=-.08||position.y<=0)return null;
 const depth=-position.y/d.y;
 if(depth<.5||depth>9)return null;
 const x=position.x+d.x*depth,z=position.z+d.z*depth;
 if(x<TELEPORT_BOUNDS.xmin||x>TELEPORT_BOUNDS.xmax||z<TELEPORT_BOUNDS.zmin||z>TELEPORT_BOUNDS.zmax)return null;
 return {x,z,distance:depth};
}
// An XR clue is earned via a targetable 3D terminal in Frontier.
// It uses the existing report flag, so Case 001 works across modes.
export function scanFrontierReport(saved){
 if(currentZone(saved)!=='frontier')return {state:saved,changed:false,reason:'WRONG ZONE'};
 if(!saved||typeof saved!=='object'||Array.isArray(saved))return {state:saved,changed:false,reason:'INVALID SAVE'};
 const flags=saved.flags&&typeof saved.flags==='object'&&!Array.isArray(saved.flags)?saved.flags:{};
 if(flags.report===true)return {state:saved,changed:false,reason:'REPORT ALREADY RECOVERED'};
 const health=Number.isFinite(saved.health)?Math.min(100,Math.max(1,saved.health)+10):100;
 return {state:{...saved,zone:'frontier',health,flags:{...flags,report:true}},changed:true,reason:'FRONTIER ACCESS CODE RECOVERED'};
}
// Reference-space offsets are intentionally controlled: no camera pose override.
// A player at (viewerX, viewerZ) should arrive at (targetX, targetZ), so
// the new reference-space origin must shift by (viewer - target).
export function teleportOffset(viewer,target){
 if(!viewer||!target||![viewer.x,viewer.z,target.x,target.z].every(Number.isFinite))return null;
 const x=viewer.x-target.x,z=viewer.z-target.z;
 if(Math.hypot(x,z)>9.2)return null;
 return {x,y:0,z};
}
