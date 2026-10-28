import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {DEAD_BREAKER,DEAD_ARCHIVE,deadPowerOnline,restoreDeadPower,retrieveMedicalArchive} from '../src/xr-dead.js';
import {raySphere} from '../src/xr-play.js';
const game=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
const xr=readFileSync(new URL('../src/xr.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../xr.html',import.meta.url),'utf8');
const yaw=y=>({x:0,y:Math.sin(y/2),z:0,w:Math.cos(y/2)});
const make=(flags={})=>({zone:'dead',flags:{...flags},health:82,visited:['frontier','dead'],portalCount:1,
 portalLog:['hospital-in'],positions:{dead:{x:270,y:450}}});

test('breaker requires Frontier evidence and never mutates the original save',()=>{
 const old=make();
 const denied=restoreDeadPower(old);
 assert.equal(denied.changed,false);
 assert.match(denied.reason,/FRONTIER FIRST/);
 const withCode=make({report:true});
 const powered=restoreDeadPower(withCode);
 assert.equal(powered.changed,true);
 assert.equal(powered.state.flags.deadPower,true);
 assert.equal(withCode.flags.deadPower,undefined);
 assert.equal(powered.state.health,82);
 assert.equal(powered.state.portalCount,1);
 assert.equal(restoreDeadPower(powered.state).changed,false);
});
test('medical archive requires code, breaker, and awards exactly one shard',()=>{
 assert.equal(retrieveMedicalArchive(make({})).changed,false);
 assert.equal(retrieveMedicalArchive(make({report:true})).changed,false);
 const ready=restoreDeadPower(make({report:true})).state;
 const found=retrieveMedicalArchive(ready);
 assert.equal(found.changed,true);
 assert.equal(found.state.flags.report,true);
 assert.equal(found.state.flags.deadPower,true);
 assert.equal(found.state.flags.record,true);
 assert.equal(found.state.health,92);
 assert.equal(found.state.positions.dead.x,270);
 assert.equal(found.state.portalLog[0],'hospital-in');
 assert.equal(retrieveMedicalArchive(found.state).changed,false);
});
test('legacy medical records count as restored power and remain reusable',()=>{
 const old=make({record:true,report:true});
 assert.equal(deadPowerOnline(old),true);
 assert.equal(restoreDeadPower(old).changed,false);
 assert.equal(retrieveMedicalArchive(old).changed,false);
});
test('wrong zone, invalid state, and bad health are handled safely',()=>{
 assert.equal(restoreDeadPower({zone:'frontier',flags:{report:true}}).changed,false);
 assert.equal(retrieveMedicalArchive({zone:'frontier',flags:{report:true,deadPower:true}}).changed,false);
 assert.equal(restoreDeadPower(null).changed,false);
 assert.equal(retrieveMedicalArchive(null).changed,false);
 assert.equal(retrieveMedicalArchive(make({report:true,deadPower:true})).state.health,92);
 const corrupted=make({report:true,deadPower:true});corrupted.health='oops';
 assert.equal(retrieveMedicalArchive(corrupted).state.health,100);
});
test('two separate world-space controllers rays can hit the breaker and archive',()=>{
 const origin={x:0,y:1.2,z:0};
 const right=-Math.atan2(DEAD_BREAKER.x,-DEAD_BREAKER.z);
 const left=-Math.atan2(DEAD_ARCHIVE.x,-DEAD_ARCHIVE.z);
 assert.notEqual(raySphere(origin,yaw(right),DEAD_BREAKER),null);
 assert.notEqual(raySphere(origin,yaw(left),DEAD_ARCHIVE),null);
 assert.equal(raySphere(origin,yaw(0),DEAD_ARCHIVE),null);
 assert.equal(raySphere(origin,yaw(0),DEAD_BREAKER),null);
 assert.equal(raySphere(origin,yaw(1.4),DEAD_ARCHIVE),null);
});
test('2D save migration retains deadPower, recognizes older collected medical files',()=>{
 const start=game.indexOf('const GATES=');
 assert.ok(start>0);
 // Exercise the actual game module in a mocked browser.
 const memory=new Map();
 const elements=new Map();
 const el=id=>{
  if(!elements.has(id))elements.set(id,{id,textContent:'',dataset:{},classList:{toggle(){}},
   setAttribute(){},addEventListener(){},focus(){},getContext(){return {}}});
  return elements.get(id);
 };
 const env=vm.createContext({document:{getElementById:el,querySelectorAll:()=>[]},window:{addEventListener(){}},
  navigator:{getGamepads:()=>[]},performance:{now:()=>1000},requestAnimationFrame(){},confirm:()=>true,
  localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}});
 memory.set('lenz-poc-v1',JSON.stringify({zone:'dead',flags:{report:true,record:true},health:90}));
 vm.runInContext(game,env);
 assert.equal(vm.runInContext('s.flags.deadPower',env),true);
 assert.equal(vm.runInContext('shardCount()',env),2);
 vm.runInContext('save()',env);
 const saved=JSON.parse(memory.get('lenz-poc-v1'));
 assert.equal(saved.flags.deadPower,true);
 assert.equal(saved.flags.record,true);
});
test('XR ray priority puts zone devices after portals and ahead of floor teleport',()=>{
 const gate=xr.indexOf('const which=targetGate(origin,orientation)');
 const frontier=xr.indexOf("zone==='frontier'&&raySphere(origin,orientation,TERMINAL)");
 const breaker=xr.indexOf("raySphere(origin,orientation,DEAD_BREAKER)");
 const archive=xr.indexOf("raySphere(origin,orientation,DEAD_ARCHIVE)");
 const floor=xr.indexOf('const floor=floorTarget(origin,orientation)');
 assert.ok(gate<frontier&&frontier<breaker&&breaker<archive&&archive<floor);
 for(const id of ['deadPower','deadArchive','scanTerminal'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(xr,/persistXRTravel\(localStorage,zone,index\)/);
});
