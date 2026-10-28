// LENZ immersive XR ↔ desktop world contract.
// Pure functions for headset ray selection and additive, non-destructive Case 001 save updates.
export const KEY='lenz-poc-v1';
export const IDS=['frontier','dead','underworld','fracture'];
export const NAMES={frontier:'FRONTIER',dead:'DEAD SECTOR',underworld:'UNDERWORLD',fracture:'THE FRACTURE'};
export const ROUTES={
 frontier:[
  {id:'hospital-in',site:'HOSPITAL',to:'dead',arrival:{x:270,y:450}},
  {id:'fracture-out',site:'BREACH',to:'fracture',arrival:{x:1000,y:560}}
 ],
 dead:[
  {id:'hospital-out',site:'HOSPITAL',to:'frontier',arrival:{x:265,y:349}},
  {id:'sublevel-in',site:'SUBLEVEL',to:'underworld',arrival:{x:1,y:6}}
 ],
 underworld:[
  {id:'sublevel-out',site:'SUBLEVEL',to:'dead',arrival:{x:445,y:350}},
  {id:'fault-in',site:'FAULT LINE',to:'fracture',arrival:{x:135,y:560}}
 ],
 fracture:[
  {id:'fault-out',site:'FAULT LINE',to:'underworld',arrival:{x:9,y:7}},
  {id:'breach-in',site:'BREACH',to:'frontier',arrival:{x:180,y:492}}
 ]
};
export const GATE_Z=-3.7;
export const GATE_CENTERS=[-1.3,1.3];
const isObject=o=>!!o&&typeof o==='object'&&!Array.isArray(o);

export function readXRSave(storage){
 try{
  const saved=JSON.parse(storage.getItem(KEY));
  return isObject(saved)?saved:{};
 }catch{return {}}
}
export function currentZone(saved){
 return IDS.includes(saved?.zone)?saved.zone:'frontier';
}
export function travelXRSave(saved,origin,gateIndex){
 const route=ROUTES[origin]?.[gateIndex];
 if(!route)return null;
 const base=isObject(saved)?saved:{};
 const knownVisits=Array.isArray(base.visited)?base.visited.filter(x=>IDS.includes(x)):[];
 const visited=[...new Set([...knownVisits,origin,route.to])];
 const positions=isObject(base.positions)?{...base.positions}:{};
 const prior=isObject(positions[route.to])?positions[route.to]:{};
 positions[route.to]={...prior,...route.arrival};
 if(route.to==='fracture')positions.fracture={...positions.fracture,vy:0};
 const priorLog=Array.isArray(base.portalLog)?base.portalLog.filter(x=>
  Object.values(ROUTES).some(group=>group.some(g=>g.id===x))
 ):[];
 const count=Number.isSafeInteger(base.portalCount)&&base.portalCount>=0?base.portalCount:0;
 return {
  ...base,
  zone:route.to,
  visited,
  positions,
  portalCount:Math.min(999999,count+1),
  portalLog:[...priorLog,route.id].slice(-12)
 };
}
export function persistXRTravel(storage,origin,gateIndex){
 const existing=readXRSave(storage);
 const next=travelXRSave(existing,origin,gateIndex);
 if(!next)return null;
 storage.setItem(KEY,JSON.stringify(next));
 return next;
}
// World-space controller aim: shoot an infinitely thin ray through the fixed portal plane.
// Only a deliberate, actual hit counts. The headset pose/camera is never moved.
export function forwardFromQuaternion(q){
 if(!q||![q.x,q.y,q.z,q.w].every(Number.isFinite))return null;
 return {
  x:-2*(q.x*q.z+q.w*q.y),
  y:2*(q.x*q.w-q.y*q.z),
  z:-1+2*(q.x*q.x+q.y*q.y)
 };
}
export function targetGate(position,orientation){
 if(!position||![position.x,position.y,position.z].every(Number.isFinite))return -1;
 const dir=forwardFromQuaternion(orientation);
 if(!dir||dir.z>=-0.0001)return -1;
 const depth=(GATE_Z-position.z)/dir.z;
 if(depth<=0||depth>12)return -1;
 const x=position.x+dir.x*depth,y=position.y+dir.y*depth;
 if(y<0.18||y>2.55)return -1;
 for(let i=0;i<GATE_CENTERS.length;i++)
  if(Math.abs(x-GATE_CENTERS[i])<0.72)return i;
 return -1;
}
