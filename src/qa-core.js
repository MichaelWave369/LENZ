// LENZ Field Test Lab — no network, no user tracking, no mutations of game saves.
import {KEY as GAME_KEY,IDS} from './xr-gates.js';

export const QA_KEY='lenz-field-test-v1';
export const XR_METRICS_KEY='lenz-xr-session-stats-v1';
export const QA_VERSION=1;
export const QA_STEPS=[
 {id:'open',title:'Launch immersive VR',detail:'Enter Quest Browser over HTTPS. Grant immersive permission, confirm stable headset tracking and exit cleanly.'},
 {id:'comfort',title:'Comfort and real-world safety',detail:'Use the floor teleport marker, move within your real boundary and confirm the view never jerks or rotates unexpectedly.'},
 {id:'aim',title:'Controller targeting',detail:'Aim at both portal openings and objects. Confirm only the intended target highlights and the trigger selects it.'},
 {id:'frontier',title:'Frontier evidence',detail:'Scan the central Frontier terminal with the controller. The access code should be recorded once.'},
 {id:'hospital',title:'Hospital portal',detail:'Cross from Frontier into Dead Sector through the Hospital gate and confirm the intended destination.'},
 {id:'archive',title:'Dead Sector records',detail:'Restore the red power breaker, then retrieve the medical record. Locked actions should explain missing prerequisites.'},
 {id:'sublevel',title:'Sublevel portal',detail:'Cross into Underworld and confirm health, previous discoveries and portal history persist.'},
 {id:'sentinel',title:'Underworld encounter',detail:'Disable shield conduits center → left → right. Recover the exposed core. Check the encounter remains complete after reload.'},
 {id:'fracture',title:'Fracture stabilization',detail:'Cross the Fault Line portal. Repair anchors left → right → center, then extract the vault coordinates.'},
 {id:'vault',title:'Corporate vault finale',detail:'Return to Frontier, decode the four-clue cipher, open the vault and read THE SUBJECT IS THE PRODUCT inside VR.'},
 {id:'save',title:'Save continuity',detail:'Reload the page and check case completion. Export a save in the 2D game and verify that importing it preserves the case.'},
 {id:'access',title:'Readability and interaction',detail:'Evaluate world-space glyph legibility, button/target sizes, discoverability and standing or seated comfort.'}
];
export const QA_STATUSES=['untested','pass','fail','blocked'];
const isObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const safeNote=v=>typeof v==='string'?v.slice(0,1200):'';
export function emptyQA(){
 return {version:QA_VERSION,device:'unspecified',results:Object.fromEntries(QA_STEPS.map(x=>[x.id,{status:'untested',note:''}]))};
}
export function normalizeQA(raw){
 const out=emptyQA();
 if(!isObject(raw))return out;
 if(['unspecified','quest-3','desktop','other'].includes(raw.device))out.device=raw.device;
 for(const step of QA_STEPS){
  const r=raw.results?.[step.id];
  if(!isObject(r))continue;
  out.results[step.id]={status:QA_STATUSES.includes(r.status)?r.status:'untested',note:safeNote(r.note)};
 }
 return out;
}
export function qaCounts(qa){
 const results=normalizeQA(qa).results,counts={pass:0,fail:0,blocked:0,untested:0,total:QA_STEPS.length};
 for(const step of QA_STEPS)counts[results[step.id].status]++;
 return counts;
}
export function gameSnapshot(raw){
 const s=isObject(raw)?raw:{},flags=isObject(s.flags)?s.flags:{};
 const keys=['report','record','crystal','platform','vaultAccess','vault','deadPower'];
 const evidence=Object.fromEntries(keys.map(k=>[k,flags[k]===true]));
 const visits=Array.isArray(s.visited)?IDS.filter(z=>s.visited.includes(z)):[];
 const crossings=Number.isSafeInteger(s.portalCount)&&s.portalCount>=0?Math.min(s.portalCount,999999):0;
 return {
  zone:IDS.includes(s.zone)?s.zone:'unknown',
  evidence,
  sentinelDefeated:s.enemyDown===true,
  visited:visits,
  portalCrossings:crossings,
  caseComplete:evidence.vault
 };
}
export function safeEnvironment(raw){
 const out={secureContext:'unknown',webgl:'unknown',immersiveVR:'unknown'};
 if(!isObject(raw))return out;
 for(const key of Object.keys(out)){
  if(typeof raw[key]==='boolean')out[key]=raw[key]?'yes':'no';
  else if(['yes','no','unknown','error'].includes(raw[key]))out[key]=raw[key];
 }
 return out;
}
export function summarizeFrameDeltas(values){
 if(!Array.isArray(values))return null;
 const v=values.filter(n=>Number.isFinite(n)&&n>=2&&n<=250).slice(-2400).sort((a,b)=>a-b);
 if(v.length<5)return null;
 const mean=v.reduce((a,b)=>a+b,0)/v.length;
 return {
  sampledFrames:v.length,
  approximateFps:Math.round((1000/mean)*10)/10,
  p95FrameMs:Math.round(v[Math.ceil(v.length*.95)-1]*10)/10,
  framesOver20ms:v.filter(n=>n>20).length
 };
}
export function safeXRMetrics(value){
 if(!isObject(value))return null;
 const keys=['sampledFrames','approximateFps','p95FrameMs','framesOver20ms'];
 const out={};
 for(const k of keys){if(!Number.isFinite(value[k])||value[k]<0)return null;out[k]=value[k];}
 if(out.sampledFrames>2400||out.framesOver20ms>out.sampledFrames||out.approximateFps>500||out.p95FrameMs>250)return null;
 return out;
}
export function buildReport(qa,game,environment,metrics=null){
 const clean=normalizeQA(qa);
 return {
  kind:'LENZ_FIELD_TEST_REPORT',
  version:QA_VERSION,
  device:clean.device,
  steps:QA_STEPS.map(step=>({id:step.id,status:clean.results[step.id].status,note:clean.results[step.id].note})),
  counts:qaCounts(clean),
  game:gameSnapshot(game),
  environment:safeEnvironment(environment),
  xrPerformance:safeXRMetrics(metrics),
  disclaimer:'Manual checks are tester-reported; saved game flags do not prove headset usability. No raw save, headset pose, account ID, user-agent or IP address is included.'
 };
}
export function readJSON(storage,key){
 try{return JSON.parse(storage.getItem(key))}catch{return null}
}
export {GAME_KEY};
