import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {
 KEY,IDS,NAMES,ROUTES,currentZone,readXRSave,persistXRTravel,travelXRSave,targetGate
} from '../src/xr-gates.js';

const gameCode=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
const xrCode=readFileSync(new URL('../src/xr.js',import.meta.url),'utf8');
const xrHtml=readFileSync(new URL('../xr.html',import.meta.url),'utf8');
const yaw=y=>({x:0,y:Math.sin(y/2),z:0,w:Math.cos(y/2)});
const pos={x:0,y:1.5,z:0};

test('XR portal pair IDs, destinations and arrival coordinates match the 2D game exactly',()=>{
 const start=gameCode.indexOf('const GATES={'),end=gameCode.indexOf('const ALL_GATES=',start);
 assert.ok(start>=0&&end>start,'2D source must define physical gates');
 const expression=gameCode.slice(start+'const GATES='.length,end).trim().replace(/;\s*$/,'');
 const gameGates=JSON.parse(vm.runInNewContext('JSON.stringify('+expression+')'));
 assert.deepEqual(Object.keys(ROUTES),IDS);
 for(const origin of IDS){
  assert.equal(ROUTES[origin].length,2);
  for(const g of ROUTES[origin]){
   const match=gameGates[origin].find(x=>x.id===g.id);
   assert.ok(match,origin+' missing '+g.id);
   assert.equal(g.to,match.to);
   assert.equal(g.site,match.site);
   assert.deepEqual(g.arrival,match.arrival);
  }
 }
});
test('world-space controller targeting hits precisely the selected portal, not empty air',()=>{
 const angle=Math.atan2(1.3,3.7);
 assert.equal(targetGate(pos,yaw(angle)),0,'aiming left must select left gate');
 assert.equal(targetGate(pos,yaw(-angle)),1,'aiming right must select right gate');
 assert.equal(targetGate(pos,yaw(0)),-1,'empty space between gates must not select one');
 assert.equal(targetGate({x:0,y:3.5,z:0},yaw(angle)),-1,'above gate is a miss');
 assert.equal(targetGate({x:0,y:1.5,z:15},yaw(angle)),-1,'excessively distant ray is a miss');
 assert.equal(targetGate(pos,{x:NaN,y:0,z:0,w:1}),-1,'invalid quaternion is not targetable');
});
test('the headset cannot skip an unselected portal or mutate the original save',()=>{
 const saved={zone:'frontier',health:72,flags:{report:true,record:true},enemyDown:true,
  visited:['frontier'],positions:{frontier:{x:777,y:300},dead:{x:100,y:410}},
  portalCount:3,portalLog:['hospital-in'],customConfig:{textSize:'large'}};
 assert.equal(travelXRSave(saved,'frontier',9),null);
 const next=travelXRSave(saved,'frontier',0);
 assert.equal(next.zone,'dead');
 assert.equal(next.portalCount,4);
 assert.deepEqual(next.visited,['frontier','dead']);
 assert.deepEqual(next.portalLog,['hospital-in','hospital-in']);
 assert.equal(next.positions.dead.x,270);
 assert.equal(next.positions.dead.y,450);
 assert.equal(next.positions.frontier.x,777);
 assert.equal(next.health,72);
 assert.equal(next.flags.report,true);
 assert.equal(next.enemyDown,true);
 assert.deepEqual(next.customConfig,{textSize:'large'});
 assert.equal(saved.zone,'frontier');
 assert.equal(saved.portalCount,3);
});
test('each XR gate updates the same durable key and travel journal as the 2D game',()=>{
 const memory=new Map();
 const storage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
 const initial={zone:'underworld',health:88,flags:{record:true,crystal:true},
  positions:{underworld:{x:8,y:6}},visited:['frontier','dead','underworld']};
 memory.set(KEY,JSON.stringify(initial));
 const moved=persistXRTravel(storage,'underworld',1);
 assert.equal(moved.zone,'fracture');
 assert.equal(moved.portalCount,1);
 assert.equal(moved.portalLog[0],'fault-in');
 assert.equal(moved.positions.fracture.x,135);
 assert.equal(currentZone(readXRSave(storage)),'fracture');
 assert.equal(readXRSave(storage).flags.crystal,true);
});
test('legacy, corrupt and absent saves are handled conservatively',()=>{
 const memory=new Map();
 const storage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
 assert.equal(currentZone(readXRSave(storage)),'frontier');
 memory.set(KEY,'{');
 assert.equal(currentZone(readXRSave(storage)),'frontier');
 memory.set(KEY,JSON.stringify({zone:'not-a-zone',flags:{report:true}}));
 assert.equal(currentZone(readXRSave(storage)),'frontier');
 const changed=persistXRTravel(storage,'frontier',0);
 assert.equal(changed.flags.report,true);
 assert.equal(changed.zone,'dead');
});
test('XR interaction is intentional and linked to the shared case display',()=>{
 assert.match(xrCode,/session\.addEventListener\('select',changeZone\)/);
 assert.match(xrCode,/targetGate\(pose\.transform\.position,pose\.transform\.orientation\)/);
 assert.match(xrCode,/persistXRTravel\(localStorage,zone,index\)/);
 assert.doesNotMatch(xrCode,/session\.addEventListener\('select',\s*\(\)\s*=>\s*next/);
 for(const id of ['leftGate','rightGate','caseState','xrJournal'])assert.ok(xrHtml.includes('id="'+id+'"'),id+' missing');
 assert.ok(xrHtml.includes('src/xr.js'));
});
