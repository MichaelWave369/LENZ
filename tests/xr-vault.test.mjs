import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {VAULT_DECODER,VAULT_DOOR,DIRECTIVE,REQUIRED_CLUES,clueCount,vaultUnlocked,decodeVault,openVault} from '../src/xr-vault.js';
import {REVEAL_LINES,geometryForMessage} from '../src/xr-glyphs.js';
import {raySphere} from '../src/xr-play.js';

const game=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
const xr=readFileSync(new URL('../src/xr.js',import.meta.url),'utf8');
const page=readFileSync(new URL('../xr.html',import.meta.url),'utf8');
const base=()=>({
 zone:'frontier',health:74,
 flags:{report:true,deadPower:true,record:true,crystal:true,platform:true},
 visited:['frontier','dead','underworld','fracture'],enemyDown:true,
 sentinelPhase:3,fracturePhase:3,portalCount:8,
 portalLog:['hospital-in','sublevel-in','fault-in','breach-in'],
 positions:{frontier:{x:1009,y:336},dead:{x:270,y:450}}
});
function gameHarness(raw){
 const memory=new Map([['lenz-poc-v1',JSON.stringify(raw)]]);
 const nodes=new Map();
 const byId=id=>{
  if(!nodes.has(id))nodes.set(id,{id,textContent:'',dataset:{},classList:{toggle(){}},
    setAttribute(){},addEventListener(){},focus(){},getContext(){return {}}});
  return nodes.get(id);
 };
 const ctx=vm.createContext({
  document:{getElementById:byId,querySelectorAll:()=>[]},
  window:{addEventListener(){}},navigator:{getGamepads:()=>[]},
  performance:{now:()=>1000},requestAnimationFrame(){},confirm:()=>true,
  localStorage:{getItem:key=>memory.get(key)||null,setItem:(key,val)=>memory.set(key,val)}
 });
 vm.runInContext(game,ctx);
 return {run:code=>vm.runInContext(code,ctx),memory};
}
function aim(from,to){
 const dx=to.x-from.x,dy=to.y-from.y,dz=to.z-from.z;
 const yaw=-Math.atan2(dx,-dz)/2,pitch=Math.atan2(dy,Math.hypot(dx,dz))/2;
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 return {x:cy*sp,y:sy*cp,z:-sy*sp,w:cy*cp};
}

test('four preexisting genre clues are required for the final cipher',()=>{
 assert.equal(REQUIRED_CLUES.length,4);
 assert.equal(clueCount(base()),4);
 for(const key of REQUIRED_CLUES){
  const s=base();delete s.flags[key];
  assert.equal(clueCount(s),3);
  const result=decodeVault(s);
  assert.equal(result.changed,false,'cipher must reject missing '+key);
  assert.match(result.reason,/3\/4/);
  assert.equal(s.flags.vaultAccess,undefined);
 }
});
test('cipher opens only in Frontier and does not mutate or destroy existing progress',()=>{
 const old=base();
 assert.equal(decodeVault({...old,zone:'dead'}).changed,false);
 assert.equal(openVault(old).changed,false,'cannot open prior to decoder');
 const decoded=decodeVault(old);
 assert.equal(decoded.changed,true);
 assert.equal(decoded.state.flags.vaultAccess,true);
 assert.equal(decoded.state.flags.vault,undefined);
 assert.equal(decoded.state.health,74);
 assert.equal(decoded.state.enemyDown,true);
 assert.equal(decoded.state.portalCount,8);
 assert.deepEqual(decoded.state.portalLog,old.portalLog);
 assert.equal(old.flags.vaultAccess,undefined);
 assert.equal(decodeVault(decoded.state).changed,false);
});
test('opening the physical vault marks exactly the canonical 2D Case 001 ending',()=>{
 const s=decodeVault(base()).state;
 const finished=openVault(s);
 assert.equal(finished.changed,true);
 assert.equal(finished.state.flags.vault,true);
 assert.equal(finished.state.flags.vaultAccess,true);
 assert.equal(finished.state.flags.platform,true);
 assert.equal(finished.state.health,74);
 assert.match(finished.reason,/THE SUBJECT IS THE PRODUCT/);
 assert.equal(DIRECTIVE,'THE SUBJECT IS THE PRODUCT');
 assert.equal(openVault(finished.state).changed,false);
 assert.equal(decodeVault(finished.state).changed,false);
});
test('wrong zone, partial clues, and malformed states cannot bypass security',()=>{
 assert.equal(decodeVault(null).changed,false);
 assert.equal(openVault(null).changed,false);
 assert.equal(decodeVault([]).changed,false);
 assert.equal(openVault({zone:'dead',flags:{vaultAccess:true}}).changed,false);
 assert.equal(openVault({zone:'frontier',flags:{vaultAccess:true}}).changed,false);
 assert.equal(openVault({...base(),flags:{vaultAccess:true,report:true}}).changed,false);
 assert.equal(vaultUnlocked({flags:{vault:true}}),true);
});
test('legacy 2D endings automatically imply the decoder was cleared',()=>{
 const old=base();old.flags.vault=true;
 const app=gameHarness(old);
 assert.equal(app.run("has('vault')"),true);
 assert.equal(app.run("has('vaultAccess')"),true);
 app.run('save()');
 const reopened=gameHarness(JSON.parse(app.memory.get('lenz-poc-v1')));
 assert.equal(reopened.run("has('vaultAccess')"),true);
 assert.equal(reopened.run("has('vault')"),true);
});
test('XR decoder progress survives the 2D save parser and imported JSON saves',()=>{
 const decoded=decodeVault(base()).state;
 const app=gameHarness(decoded);
 assert.equal(app.run("has('vaultAccess')"),true);
 assert.equal(app.run("has('vault')"),false);
 app.run('save()');
 const reload=gameHarness(JSON.parse(app.memory.get('lenz-poc-v1')));
 assert.equal(reload.run("has('vaultAccess')"),true);
 assert.equal(reload.run("has('vault')"),false);
 const portable=reload.run('portableSave()');
 const imported=JSON.parse(reload.run('JSON.stringify(parsePortableSave('+JSON.stringify(portable)+'))'));
 assert.equal(imported.flags.vaultAccess,true);
 assert.equal(imported.flags.vault,undefined);
});
test('the 2D final vault remains completable with the original rules',()=>{
 const old=base();delete old.flags.vaultAccess;
 const app=gameHarness(old);
 app.run('interact()');
 assert.equal(app.run("has('vault')"),true);
 assert.equal(app.run("has('vaultAccess')"),true);
});
test('decoder, door and Frontier scanner have distinct individually targetable 3D rays',()=>{
 const origin={x:0,y:1.35,z:0};
 assert.notEqual(raySphere(origin,aim(origin,VAULT_DECODER),VAULT_DECODER),null);
 assert.notEqual(raySphere(origin,aim(origin,VAULT_DOOR),VAULT_DOOR),null);
 assert.equal(raySphere(origin,aim(origin,VAULT_DECODER),VAULT_DOOR),null);
 assert.equal(raySphere(origin,aim(origin,VAULT_DOOR),VAULT_DECODER),null);
});
test('3D readable ending has precisely the full corporate directive, not placeholder boxes',()=>{
 assert.equal(REVEAL_LINES.join(' '),DIRECTIVE);
 const mesh=geometryForMessage();
 assert.ok(mesh instanceof Float32Array);
 assert.ok(mesh.length>3000);
 assert.equal(mesh.length%9,0);
 for(const v of mesh)assert.equal(Number.isFinite(v),true);
 assert.throws(()=>geometryForMessage(['⚡']),/Unsupported XR glyph/);
});
test('XR controller and desktop buttons support both finishing interactions',()=>{
 for(const id of ['vaultDecode','vaultOpen','vaultStatus'])
  assert.ok(page.includes('id="'+id+'"'),'missing '+id);
 assert.match(xr,/raySphere\(origin,orientation,VAULT_DECODER\)/);
 assert.match(xr,/raySphere\(origin,orientation,VAULT_DOOR\)/);
 assert.match(xr,/vaultAction\(decodeVault\)/);
 assert.match(xr,/vaultAction\(openVault\)/);
 const portal=xr.indexOf('const which=targetGate(origin,orientation)');
 const vault=xr.indexOf('raySphere(origin,orientation,VAULT_DECODER)',portal);
 const floor=xr.indexOf('const floor=floorTarget(origin,orientation)',portal);
 assert.ok(portal>=0&&vault>portal&&floor>vault);
 assert.match(xr,/gl\.drawArrays\(gl\.TRIANGLES,0,messageVertexCount\)/);
 assert.match(xr,/geometryForMessage/);
});
