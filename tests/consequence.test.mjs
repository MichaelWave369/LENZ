import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const gameCode=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');

function harness(memory=new Map()){
 const elements=new Map();
 function el(id){
  if(!elements.has(id)){
   elements.set(id,{
    id,textContent:'',dataset:{},classList:{toggle(){}},setAttribute(){},addEventListener(){},focus(){},
    getContext(){return {}}
   });
  }
  return elements.get(id);
 }
 const buttons=['frontier','dead','underworld','fracture'].map(id=>({
  dataset:{zone:id},classList:{toggle(){}},setAttribute(){},addEventListener(){}
 }));
 const context=vm.createContext({
  document:{getElementById:el,querySelectorAll:()=>buttons},
  window:{addEventListener(){}},
  navigator:{getGamepads:()=>[]},
  performance:{now:()=>1000},
  localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},
  requestAnimationFrame(){},
  confirm:()=>true,
  Math,JSON,Number,String,Array,Object,Set,Map,
 });
 vm.runInContext(gameCode,context,{filename:'game.js'});
 const evalGame=code=>vm.runInContext(code,context);
 return {evalGame,memory,elements};
}
test('first clue unlocks the next reality rather than granting unrelated collectibles',()=>{
 const {evalGame}=harness();
 evalGame("shift('dead');s.positions.dead={x:887,y:204};interact()");
 assert.equal(evalGame("has('record')"),false,'medical archive must initially be locked');
 evalGame("shift('frontier');s.positions.frontier={x:738,y:292};interact()");
 assert.equal(evalGame("has('report')"),true);
 evalGame("shift('dead');interact()");
 assert.equal(evalGame("has('record')"),true,'Frontier code unlocks medical record');
});
test('countercode enables the dungeon sentinel, whose death enables the core',()=>{
 const {evalGame}=harness();
 evalGame("shift('underworld');s.positions.underworld={x:8,y:3};action()");
 assert.equal(evalGame('s.enemyDown'),false,'sentinel must resist an uninformed strike');
 evalGame("s.positions.underworld={x:8,y:6};interact()");
 assert.equal(evalGame("has('crystal')"),false,'core must remain shielded');
 evalGame("s.flags.record=true;s.positions.underworld={x:8,y:3};action()");
 assert.equal(evalGame('s.enemyDown'),true);
 evalGame("s.positions.underworld={x:8,y:6};interact()");
 assert.equal(evalGame("has('crystal')"),true);
});
test('core restores final platform and recovered coordinates unlock the corporate vault',()=>{
 const {evalGame}=harness();
 evalGame("shift('fracture');s.positions.fracture={x:822,y:318};interact()");
 assert.equal(evalGame("has('platform')"),false,'shard inaccessible without stabilizer');
 evalGame("s.flags.crystal=true;interact()");
 assert.equal(evalGame("has('platform')"),true);
 evalGame("shift('frontier');s.positions.frontier={x:1009,y:336};interact()");
 assert.equal(evalGame("has('vault')"),true);
 assert.match(evalGame('nextDirective()'),/CASE CLOSED/);
});
test('vault is locked until the platform clue is recovered',()=>{
 const {evalGame}=harness();
 evalGame("s.positions.frontier={x:1009,y:336};interact()");
 assert.equal(evalGame("has('vault')"),false);
});
test('all cross-reality flags, ending, and player state survive reload',()=>{
 const memory=new Map(),first=harness(memory);
 first.evalGame("s.flags={report:true,record:true,crystal:true,platform:true,vault:true};s.enemyDown=true;s.health=72;s.zone='dead';save()");
 const reloaded=harness(memory);
 assert.equal(reloaded.evalGame("has('vault')"),true);
 assert.equal(reloaded.evalGame("has('record')"),true);
 assert.equal(reloaded.evalGame("s.enemyDown"),true);
 assert.equal(reloaded.evalGame("s.health"),72);
 assert.equal(reloaded.evalGame("s.zone"),'dead');
 assert.equal(reloaded.evalGame('shardCount()'),4);
});
