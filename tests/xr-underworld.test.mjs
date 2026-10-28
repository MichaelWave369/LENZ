import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {CONDUITS,CORE,PULSE_ORDER,phaseOf,activeConduit,pulseConduit,recoverDungeonCore} from '../src/xr-underworld.js';
import {raySphere} from '../src/xr-play.js';
const game=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
const xr=readFileSync(new URL('../src/xr.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../xr.html',import.meta.url),'utf8');
const base=()=>({zone:'underworld',health:88,flags:{report:true,deadPower:true,record:true},
 visited:['frontier','dead','underworld'],positions:{underworld:{x:8,y:3}},portalLog:['hospital-in','sublevel-in'],portalCount:2,
 enemyDown:false,sentinelPhase:0});
const yaw=n=>({x:0,y:Math.sin(n/2),z:0,w:Math.cos(n/2)});
function aim(from,to){
 const dx=to.x-from.x,dy=to.y-from.y,dz=to.z-from.z;
 const y=-Math.atan2(dx,-dz)/2,p=Math.atan2(dy,Math.hypot(dx,dz))/2;
 const cy=Math.cos(y),sy=Math.sin(y),cp=Math.cos(p),sp=Math.sin(p);
 return {x:cy*sp,y:sy*cp,z:-sy*sp,w:cy*cp};
}
function harness(memory=new Map()){
 const els=new Map();
 const get=id=>{
  if(!els.has(id))els.set(id,{id,textContent:'',dataset:{},classList:{toggle(){}},setAttribute(){},addEventListener(){},focus(){},getContext(){return {}}});
  return els.get(id);
 };
 const env=vm.createContext({
  document:{getElementById:get,querySelectorAll:()=>[]},
  window:{addEventListener(){}},navigator:{getGamepads:()=>[]},performance:{now:()=>1000},
  requestAnimationFrame(){},confirm:()=>true,
  localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}
 });
 vm.runInContext(game,env,{filename:'game.js'});
 return {evalGame:src=>vm.runInContext(src,env),memory,els};
}
test('the countercode is required before any Underworld shield damage',()=>{
 const start=base();delete start.flags.record;
 assert.equal(activeConduit(start),1);
 const result=pulseConduit(start,1);
 assert.equal(result.changed,false);
 assert.match(result.reason,/MEDICAL COUNTERCODE/);
 assert.equal(start.sentinelPhase,0);
 assert.equal(start.health,88);
});
test('three correctly ordered pulses defeat sentinel and preserve story state',()=>{
 let state=base();
 for(const [index,target] of PULSE_ORDER.entries()){
  assert.equal(activeConduit(state),target);
  const result=pulseConduit(state,target);
  assert.equal(result.changed,true);
  state=result.state;
  assert.equal(state.sentinelPhase,index+1);
  assert.equal(state.enemyDown,index===2);
  assert.equal(state.health,88);
 }
 assert.equal(activeConduit(state),-1);
 assert.equal(pulseConduit(state,0).changed,false);
 assert.equal(state.flags.record,true);
 assert.deepEqual(state.portalLog,['hospital-in','sublevel-in']);
});
test('wrong targeted conduit imposes a small bounded cost but does not advance',()=>{
 const start=base();
 const wrong=pulseConduit(start,0);
 assert.equal(wrong.changed,true);
 assert.equal(wrong.state.health,84);
 assert.equal(wrong.state.sentinelPhase,0);
 assert.equal(start.health,88);
 let low={...start,health:1};
 const penalty=pulseConduit(low,2);
 assert.equal(penalty.state.health,1);
 assert.equal(penalty.state.sentinelPhase,0);
});
test('the core is inaccessible until defeat, collectible once, with capped health reward',()=>{
 const start=base();
 assert.equal(recoverDungeonCore(start).changed,false);
 let done={...start,enemyDown:true,sentinelPhase:3,health:95};
 const reward=recoverDungeonCore(done);
 assert.equal(reward.changed,true);
 assert.equal(reward.state.flags.crystal,true);
 assert.equal(reward.state.health,100);
 assert.equal(recoverDungeonCore(reward.state).changed,false);
 assert.equal(done.flags.crystal,undefined);
});
test('wrong zones and invalid targets never change combat state',()=>{
 assert.equal(pulseConduit({...base(),zone:'frontier'},1).changed,false);
 assert.equal(recoverDungeonCore({...base(),zone:'dead'}).changed,false);
 assert.equal(pulseConduit(base(),-1).changed,false);
 assert.equal(pulseConduit(base(),3).changed,false);
 assert.equal(pulseConduit(null,1).changed,false);
 assert.equal(recoverDungeonCore(null).changed,false);
});
test('independent controller rays can aim at left, center and right nodes',()=>{
 const origin={x:0,y:1.2,z:0};
 assert.equal(CONDUITS.length,3);
 for(const node of CONDUITS){
  assert.notEqual(raySphere(origin,aim(origin,node),node),null,'must hit '+node.id);
 }
 assert.equal(raySphere(origin,yaw(1.4),CONDUITS[0]),null);
 assert.notEqual(raySphere({x:0,y:.79,z:0},yaw(0),CORE),null);
 assert.equal(raySphere({x:0,y:.79,z:0},yaw(1.4),CORE),null);
});
test('2D game saves the completed VR encounter, and legacy sentinel defeats persist',()=>{
 const memory=new Map();
 const legacy={...base(),zone:'underworld',enemyDown:false,sentinelPhase:2,health:72};
 memory.set('lenz-poc-v1',JSON.stringify(legacy));
 const app=harness(memory);
 assert.equal(app.evalGame('s.sentinelPhase'),2);
 assert.equal(app.evalGame('s.enemyDown'),false);
 app.evalGame('s.enemyDown=true;s.sentinelPhase=3;s.flags.crystal=true;save()');
 const reopened=harness(memory);
 assert.equal(reopened.evalGame('s.enemyDown'),true);
 assert.equal(reopened.evalGame('s.sentinelPhase'),3);
 assert.equal(reopened.evalGame("has('crystal')"),true);
 const old=base();delete old.sentinelPhase;old.enemyDown=true;
 memory.set('lenz-poc-v1',JSON.stringify(old));
 const migrated=harness(memory);
 assert.equal(migrated.evalGame('s.sentinelPhase'),3);
});
test('XR exposes all tactical buttons and the controller prioritizes targets over teleport',()=>{
 for(const id of ['sentinelStatus','sentinelNode0','sentinelNode1','sentinelNode2','underworldCore']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(xr,/raySphere\(origin,orientation,CONDUITS\[i\]\)/);
 assert.match(xr,/raySphere\(origin,orientation,CORE\)/);
 const ray=xr.indexOf('const which=targetGate(origin,orientation)');
 const target=xr.indexOf("if(zone==='underworld'){",ray);
 const floor=xr.indexOf('const floor=floorTarget(origin,orientation)',ray);
 assert.ok(ray>0&&target>ray&&floor>target);
 assert.match(xr,/pulseConduit\(s,index\)/);
 assert.match(xr,/recoverDungeonCore/);
});
