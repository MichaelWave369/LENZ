import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 QA_KEY,XR_METRICS_KEY,GAME_KEY,QA_STEPS,emptyQA,normalizeQA,qaCounts,gameSnapshot,
 safeEnvironment,safeXRMetrics,summarizeFrameDeltas,buildReport,readJSON
} from '../src/qa-core.js';

const html=readFileSync(new URL('../qa.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/qa.js',import.meta.url),'utf8');
const xr=readFileSync(new URL('../src/xr.js',import.meta.url),'utf8');
const xrHtml=readFileSync(new URL('../xr.html',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const oldSave={zone:'frontier',health:70,positions:{frontier:{x:234,y:321}},
 visited:['frontier','dead','underworld','fracture'],enemyDown:true,
 sentinelPhase:3,fracturePhase:3,portalCount:9,
 portalLog:['hospital-in','sublevel-in'],flags:{report:true,record:true,crystal:true,platform:true,vault:true},
 personalCustomField:'DO NOT EXPORT',secretToken:'abc-123'};

test('checklist uses explicit self-reported status, never treats game flags as headset pass',()=>{
 const q=emptyQA();
 assert.equal(QA_STEPS.length,12);
 assert.equal(qaCounts(q).untested,12);
 q.results.vault.status='pass';
 q.results.comfort.status='fail';
 q.results.aim.status='blocked';
 assert.deepEqual(qaCounts(q),{pass:1,fail:1,blocked:1,untested:9,total:12});
 const report=buildReport(q,oldSave,{immersiveVR:true,webgl:true,secureContext:true});
 assert.equal(report.counts.pass,1);
 assert.equal(report.game.caseComplete,true);
 assert.equal(report.steps.find(x=>x.id==='open').status,'untested');
});
test('report only includes whitelisted, non-identifying gameplay milestone fields',()=>{
 const q=emptyQA();
 q.device='quest-3';
 q.results.vault.status='pass';
 const report=buildReport(q,oldSave,{secureContext:true,webgl:true,immersiveVR:true},null);
 const serialized=JSON.stringify(report);
 assert.equal(report.kind,'LENZ_FIELD_TEST_REPORT');
 assert.equal(report.device,'quest-3');
 assert.equal(report.game.evidence.vault,true);
 assert.equal(report.game.sentinelDefeated,true);
 assert.equal(report.game.portalCrossings,9);
 assert.equal(report.game.visited.length,4);
 assert.equal(report.game.health,undefined,'health is not part of sanitized reports');
 for(const marker of ['DO NOT EXPORT','secretToken','abc-123','234','321','positions','personalCustomField'])
  assert.equal(serialized.includes(marker),false,'report exposed '+marker);
 assert.equal(report.xrPerformance,null);
});
test('malformed test data is normalized and notes are bounded',()=>{
 const q=normalizeQA({device:'unknown',results:{
  vault:{status:'surprise',note:'a'.repeat(3000)},comfort:{status:'fail',note:15},
  unrecognizedStep:{status:'pass',note:'hidden'}}});
 assert.equal(q.device,'unspecified');
 assert.equal(q.results.vault.status,'untested');
 assert.equal(q.results.vault.note.length,1200);
 assert.equal(q.results.comfort.note,'');
 assert.equal(q.results.unrecognizedStep,undefined);
 assert.equal(qaCounts(q).fail,1);
 assert.deepEqual(normalizeQA(null),emptyQA());
});
test('game snapshot only reflects established narrative state',()=>{
 const game=gameSnapshot({zone:'not-real',flags:{report:1,record:true,vault:'true'},portalCount:-40,
 visited:['bogus','frontier'],enemyDown:'yes'});
 assert.equal(game.zone,'unknown');
 assert.equal(game.evidence.report,false);
 assert.equal(game.evidence.record,true);
 assert.equal(game.evidence.vault,false);
 assert.equal(game.caseComplete,false);
 assert.deepEqual(game.visited,['frontier']);
 assert.equal(game.portalCrossings,0);
 assert.equal(game.sentinelDefeated,false);
});
test('XR timing is computed from bounded aggregate frame intervals, not raw tracking',()=>{
 assert.equal(summarizeFrameDeltas([]),null);
 const data=summarizeFrameDeltas([10,11,12,13,14,15,16,17,18,25,NaN,-1,1000]);
 assert.equal(data.sampledFrames,10);
 assert.equal(data.p95FrameMs,25);
 assert.equal(data.framesOver20ms,1);
 assert.ok(data.approximateFps>0);
 assert.deepEqual(safeXRMetrics(data),data);
 assert.equal(safeXRMetrics({...data,framesOver20ms:20}),null);
 assert.equal(safeXRMetrics({something:'else'}),null);
 const report=buildReport(emptyQA(),oldSave,{secureContext:true,webgl:false,immersiveVR:'error'},data);
 assert.equal(report.xrPerformance.p95FrameMs,25);
 assert.equal(report.environment.immersiveVR,'error');
});
test('QA readJSON handles missing or corrupt storage without modifying game data',()=>{
 const m=new Map([[GAME_KEY,JSON.stringify(oldSave)],[QA_KEY,'{invalid']]);
 const storage={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};
 assert.equal(readJSON(storage,QA_KEY),null);
 assert.deepEqual(readJSON(storage,GAME_KEY),oldSave);
 assert.equal(m.get(GAME_KEY),JSON.stringify(oldSave));
});
test('Field Test Lab has working selectors, local-only controls and no network requests',()=>{
 for(const id of ['progress','secure','webgl','immersive','shardCount','gameState','worldState','xrStats',
  'steps','device','refresh','export','clear','feedback'])
  assert.match(html,new RegExp('id="'+id+'"'),id+' missing');
 assert.match(html,/src\/qa\.js/);
 assert.match(html,/href="xr\.html"/);
 assert.match(html,/href="index\.html"/);
 assert.match(app,/localStorage\.setItem\(QA_KEY/);
 assert.match(app,/buildReport\(/);
 assert.match(app,/createObjectURL/);
 assert.doesNotMatch(app,/fetch\s*\(|XMLHttpRequest|sendBeacon/);
 assert.doesNotMatch(html,/<script[^>]+src=["']https?:/i);
});
test('XR sampling is opt-in and explicitly stores only summary at session end',()=>{
 assert.match(xrHtml,/id="collectXrMetrics"/);
 assert.match(xrHtml,/qa\.html/);
 assert.match(xr,/metricsEnabled=collectXrMetrics\.checked/);
 assert.match(xr,/sampleXRFrame\(time\)/);
 assert.match(xr,/summarizeFrameDeltas\(frameIntervals\)/);
 assert.match(xr,/localStorage\.setItem\(XR_METRICS_KEY,JSON\.stringify\(aggregate\)\)/);
 assert.match(xr,/finishXRMetrics\(\)/);
 assert.doesNotMatch(xr,/localStorage\.setItem\(\s*XR_METRICS_KEY\s*,\s*JSON\.stringify\(frameIntervals\)/);
});
test('Field Test Lab does not claim to verify Quest hardware automatically',()=>{
 assert.match(html,/not proof/i);
 assert.match(html,/not a headset refresh-rate measurement/i);
 assert.match(app,/immersive-vr/);
 assert.match(index,/qa\.html/);
});
