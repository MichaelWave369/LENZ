import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {ANCHORS,COORDINATES,STABILIZATION_ORDER,fracturePhase,activeAnchor,stabilizeAnchor,collectVaultCoordinates} from '../src/xr-fracture.js';
import {raySphere} from '../src/xr-play.js';
const game=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
const xr=readFileSync(new URL('../src/xr.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../xr.html',import.meta.url),'utf8');

function saved(extra={}) {
 return {zone:'fracture',health:77,flags:{report:true,record:true,crystal:true},
  visited:['frontier','dead','underworld','fracture'],positions:{fracture:{x:135,y:560,vy:0}},
  portalCount:3,portalLog:['hospital-in','sublevel-in','fault-in'],fracturePhase:0,...extra};
}
function runGame(save){
 const db=new Map([['lenz-poc-v1',JSON.stringify(save)]]);
 const elMap=new Map();
 function el(id){
  if(!elMap.has(id))elMap.set(id,{id,textContent:'',dataset:{},classList:{toggle(){}},setAttribute(){},addEventListener(){},focus(){},getContext(){return {}}});
  return elMap.get(id);
 }
 const env=vm.createContext({
  document:{getElementById:el,querySelectorAll:()=>[]},
  window:{addEventListener(){}},navigator:{getGamepads:()=>[]},
  performance:{now:()=>1000},requestAnimationFrame(){},confirm:()=>true,
  localStorage:{getItem:key=>db.get(key)||null,setItem:(key,value)=>db.set(key,value)}
 });
 vm.runInContext(game,env);
 return {query:expr=>vm.runInContext(expr,env),db};
}
function aim(from,to){
 // A controller target ray looks down -Z before rotation.
 const dx=to.x-from.x,dy=to.y-from.y,dz=to.z-from.z;
 const yaw=-Math.atan2(dx,-dz)/2,pitch=Math.atan2(dy,Math.hypot(dx,dz))/2;
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 return {x:cy*sp,y:sy*cp,z:-sy*sp,w:cy*cp};
}
test('stabilizer core is required before anchors can be repaired',()=>{
 const state=saved({flags:{report:true,record:true}});
 assert.equal(stabilizeAnchor(state,0).changed,false);
 assert.match(stabilizeAnchor(state,0).reason,/UNDERWORLD/);
 assert.equal(collectVaultCoordinates(state).changed,false);
 assert.equal(state.fracturePhase,0);
});
test('each of three anchors must be activated in sequence',()=>{
 let state=saved();
 assert.deepEqual(STABILIZATION_ORDER,[0,2,1]);
 for(const [stage,index] of STABILIZATION_ORDER.entries()){
  assert.equal(activeAnchor(state),index);
  const r=stabilizeAnchor(state,index);
  assert.equal(r.changed,true);
  state=r.state;
  assert.equal(state.fracturePhase,stage+1);
  assert.equal(state.health,77);
  assert.equal(state.flags.crystal,true);
  assert.equal(state.portalCount,3);
 }
 assert.equal(fracturePhase(state),3);
 assert.equal(activeAnchor(state),-1);
 assert.equal(stabilizeAnchor(state,1).changed,false);
});
test('incorrect targets cannot damage the player or skip the puzzle',()=>{
 const original=saved();
 const wrong=stabilizeAnchor(original,2);
 assert.equal(wrong.changed,false);
 assert.equal(wrong.state,original);
 assert.equal(original.fracturePhase,0);
 assert.equal(original.health,77);
 assert.equal(stabilizeAnchor(original,-1).changed,false);
 assert.equal(stabilizeAnchor(original,3).changed,false);
 assert.equal(stabilizeAnchor(original,1.1).changed,false);
 assert.equal(stabilizeAnchor({...original,zone:'dead'},0).changed,false);
 assert.equal(stabilizeAnchor(null,0).changed,false);
});
test('coordinates are awarded only after bridge repair, once, with saved world consequence',()=>{
 let state=saved();
 assert.equal(collectVaultCoordinates(state).changed,false);
 for(const index of STABILIZATION_ORDER)state=stabilizeAnchor(state,index).state;
 const result=collectVaultCoordinates(state);
 assert.equal(result.changed,true);
 assert.equal(result.state.flags.platform,true);
 assert.equal(result.state.health,87);
 assert.equal(result.state.fracturePhase,3);
 assert.equal(result.state.positions.fracture.x,135);
 assert.equal(result.state.portalLog.length,3);
 assert.equal(collectVaultCoordinates(result.state).changed,false);
 assert.equal(state.flags.platform,undefined);
});
test('legacy 2D Fracture shard means completed 3D stabilization',()=>{
 const old=saved({flags:{crystal:true,platform:true}});
 delete old.fracturePhase;
 assert.equal(fracturePhase(old),3);
 assert.equal(activeAnchor(old),-1);
 assert.equal(collectVaultCoordinates(old).changed,false);
 const app=runGame(old);
 assert.equal(app.query('s.fracturePhase'),3);
 assert.equal(app.query("has('platform')"),true);
});
test('partial VR anchor progress persists when the 2D game loads and resaves',()=>{
 const partial=saved({fracturePhase:2});
 const app=runGame(partial);
 assert.equal(app.query('s.fracturePhase'),2);
 app.query('save()');
 const dbSaved=JSON.parse(app.db.get('lenz-poc-v1'));
 assert.equal(dbSaved.fracturePhase,2);
 assert.equal(dbSaved.flags.crystal,true);
 const reloaded=runGame(dbSaved);
 assert.equal(reloaded.query('s.fracturePhase'),2);
});
test('the 2D game collecting coordinates completes the VR anchor puzzle',()=>{
 const app=runGame(saved());
 app.query("gain('platform','SHARD RECOVERED')");
 assert.equal(app.query('s.fracturePhase'),3);
 assert.equal(app.query("has('platform')"),true);
});
test('the three different 3D anchors and coordinates can each be aimed at',()=>{
 const origin={x:0,y:1.4,z:0};
 for(const [i,node] of ANCHORS.entries())
  assert.notEqual(raySphere(origin,aim(origin,node),node),null,'missed anchor '+i);
 assert.notEqual(raySphere(origin,aim(origin,COORDINATES),COORDINATES),null);
 const sideways={x:0,y:Math.sin(.7),z:0,w:Math.cos(.7)};
 for(const node of ANCHORS)assert.equal(raySphere(origin,sideways,node),null);
});
test('all fourth-reality controls and safe controller priority are wired',()=>{
 for(const id of ['fractureAnchor0','fractureAnchor1','fractureAnchor2','fractureCoordinates','fractureStatus'])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(xr,/stabilizeAnchor\(state,index\)/);
 assert.match(xr,/collectVaultCoordinates/);
 assert.match(xr,/raySphere\(origin,orientation,ANCHORS\[i\]\)/);
 assert.match(xr,/raySphere\(origin,orientation,COORDINATES\)/);
 const gameRay=xr.indexOf('const which=targetGate(origin,orientation)');
 const fracture=xr.indexOf("if(zone==='fracture'){",gameRay);
 const teleport=xr.indexOf('const floor=floorTarget(origin,orientation)',gameRay);
 assert.ok(gameRay>=0&&fracture>gameRay&&teleport>fracture);
});
