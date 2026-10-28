import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');

function run(memory=new Map()){
 const elements=new Map();
 function el(id){
  if(!elements.has(id))elements.set(id,{
   id,textContent:'',dataset:{},classList:{toggle(){}},setAttribute(){},addEventListener(){},
   focus(){},getContext(){return {}}
  });
  return elements.get(id);
 }
 const zones=['frontier','dead','underworld','fracture'].map(zone=>({
  dataset:{zone},classList:{toggle(){}},setAttribute(){},addEventListener(){}
 }));
 const env=vm.createContext({
  document:{getElementById:el,querySelectorAll:()=>zones},
  window:{addEventListener(){}},navigator:{getGamepads:()=>[]},
  performance:{now:()=>1000},requestAnimationFrame(){},confirm:()=>true,
  localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}
 });
 vm.runInContext(source,env,{filename:'game.js'});
 return {evalGame:code=>vm.runInContext(code,env),memory,elements};
}
test('physical hospital portal shifts reality, maps arrival, and persists history',()=>{
 const t=run();
 t.evalGame('s.positions.frontier={x:210,y:349};interact()');
 assert.equal(t.evalGame('s.zone'),'dead');
 assert.equal(t.evalGame('s.positions.dead.x'),270);
 assert.equal(t.evalGame('s.portalCount'),1);
 assert.equal(t.evalGame('s.portalLog[0]'),'hospital-in');
 assert.match(t.elements.get('portalLog').textContent,/HOSPITAL/);
 const second=run(t.memory);
 assert.equal(second.evalGame('s.zone'),'dead');
 assert.equal(second.evalGame('s.portalCount'),1);
});
test('four zones can be crossed solely through physical portals, and never auto-re-enter',()=>{
 const t=run();
 t.evalGame('s.positions.frontier={x:210,y:349};interact()');
 t.evalGame('s.positions.dead={x:510,y:350};interact()');
 assert.equal(t.evalGame('s.zone'),'underworld');
 t.evalGame('s.positions.underworld={x:10,y:7};interact()');
 assert.equal(t.evalGame('s.zone'),'fracture');
 t.evalGame('s.positions.fracture={x:1060,y:560};interact()');
 assert.equal(t.evalGame('s.zone'),'frontier');
 assert.equal(t.evalGame('s.portalCount'),4);
 assert.equal(t.evalGame('s.visited.length'),4);
 t.evalGame('update(0.016,2000)');
 assert.equal(t.evalGame('s.zone'),'frontier','entering a portal must not auto-transition the player');
});
test('each portal is paired with a return threshold',()=>{
 const t=run();
 const gates=JSON.parse(t.evalGame('JSON.stringify(GATES)'));
 const reverseLocations=new Set(Object.values(gates).flat().map(g=>g.site+':'+g.to));
 for(const [from,group] of Object.entries(gates)){
  for(const gate of group){
   assert.ok(reverseLocations.has(gate.site+':'+from),from+' → '+gate.to+' has no site-matched return portal');
  }
 }
});
test('the new save file round-trips flags, progress, and portal journal',()=>{
 const t=run();
 t.evalGame('s.flags.report=true;s.flags.record=true;s.portalCount=3;s.portalLog=["hospital-in","sublevel-in","fault-in"];s.zone="fracture";s.positions.fracture.x=341');
 const exported=t.evalGame('portableSave()');
 const parsed=JSON.parse(exported);
 assert.equal(parsed.kind,'LENZ_CASE_SAVE');
 assert.equal(parsed.version,1);
 const imported=JSON.parse(t.evalGame('JSON.stringify(parsePortableSave('+JSON.stringify(exported)+'))'));
 assert.equal(imported.zone,'fracture');
 assert.equal(imported.flags.report,true);
 assert.equal(imported.portalCount,3);
 assert.equal(imported.portalLog.length,3);
 assert.equal(imported.positions.fracture.x,341);
});
test('malformed, mismatched, and oversized saves are rejected',()=>{
 const t=run();
 for(const payload of ['not json','{}',JSON.stringify({kind:'LENZ_CASE_SAVE',version:7,state:{zone:'frontier'}}),
 JSON.stringify({kind:'LENZ_CASE_SAVE',version:1,state:{zone:'unknown'}}),'a'.repeat(131073)]){
  assert.equal(t.evalGame('(()=>{try{parsePortableSave('+JSON.stringify(payload)+');return "ACCEPTED"}catch{return "REJECTED"}})()'),'REJECTED');
 }
});
test('imports sanitize out-of-bounds points, unknown flags and arbitrary portal IDs',()=>{
 const t=run();
 const payload={kind:'LENZ_CASE_SAVE',version:1,state:{
  zone:'underworld',health:999,flags:{report:true,totallyInvented:true},
  visited:['frontier','bogus','underworld'],enemyDown:true,
  positions:{underworld:{x:9999,y:-123}},portalCount:90000000,
  portalLog:['bogus','hospital-in']
 }};
 const imported=JSON.parse(t.evalGame('JSON.stringify(parsePortableSave('+JSON.stringify(JSON.stringify(payload))+'))'));
 assert.equal(imported.health,100);
 assert.equal(imported.positions.underworld.x,11);
 assert.equal(imported.positions.underworld.y,0);
 assert.equal(imported.flags.report,true);
 assert.equal(imported.flags.totallyInvented,undefined);
 assert.deepEqual(imported.portalLog,['hospital-in']);
 assert.equal(imported.portalCount,999999);
});
test('old Case 001 save remains compatible, without crossing count migration corruption',()=>{
 const memory=new Map();
 memory.set('lenz-poc-v1',JSON.stringify({
  zone:'dead',health:88,flags:{report:true},
  positions:{dead:{x:333,y:340}},
  visited:['frontier','dead'],enemyDown:false
 }));
 const t=run(memory);
 assert.equal(t.evalGame('s.zone'),'dead');
 assert.equal(t.evalGame('s.portalCount'),0);
 assert.equal(t.evalGame('s.positions.dead.x'),333);
 assert.equal(t.evalGame('has("report")'),true);
});
