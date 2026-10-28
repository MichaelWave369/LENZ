// Browser-only LENZ acceptance dashboard: manual outcomes, read-only case evidence.
// No outbound requests, analytics, background submissions or mutations of the game save.
import {QA_KEY,XR_METRICS_KEY,QA_STEPS,QA_STATUSES,normalizeQA,qaCounts,gameSnapshot,safeEnvironment,safeXRMetrics,buildReport,readJSON,GAME_KEY} from './qa-core.js';

const $=id=>document.getElementById(id);
let qa=normalizeQA(readJSON(localStorage,QA_KEY));
let environment={secureContext:!!window.isSecureContext,webgl:'unknown',immersiveVR:'unknown'};
const words={untested:'Not tested',pass:'Pass',fail:'Fail',blocked:'Blocked'};
function persistQA(){
 try{localStorage.setItem(QA_KEY,JSON.stringify(qa));return true}
 catch{$('feedback').textContent='QA storage is unavailable; export the report to retain your notes.';return false}
}
function updateSummary(){
 const n=qaCounts(qa);
 $('progress').textContent=n.pass+' / '+n.total+' passed';
 $('failures').textContent=n.fail+' failures · '+n.blocked+' blocked · '+n.untested+' untested';
}
function renderSteps(){
 const host=$('steps');host.replaceChildren();
 for(const [i,step] of QA_STEPS.entries()){
  const card=document.createElement('article');card.className='step';
  const head=document.createElement('div');head.className='step-head';
  const description=document.createElement('div');
  const title=document.createElement('h3');title.className='step-title';title.textContent=String(i+1).padStart(2,'0')+' / '+step.title;
  const prompt=document.createElement('p');prompt.textContent=step.detail;
  description.append(title,prompt);
  const select=document.createElement('select');
  select.setAttribute('aria-label','Result for '+step.title);
  for(const status of QA_STATUSES){
   const option=document.createElement('option');option.value=status;option.textContent=words[status];select.append(option);
  }
  select.value=qa.results[step.id].status;
  select.addEventListener('change',()=>{
   qa.results[step.id].status=select.value;
   persistQA();updateSummary();
  });
  head.append(description,select);
  const note=document.createElement('textarea');note.maxLength=1200;note.rows=2;note.placeholder='Optional observations, reproduction steps, readability or comfort issues';
  note.setAttribute('aria-label','Notes for '+step.title);
  note.value=qa.results[step.id].note;
  note.addEventListener('input',()=>{
   qa.results[step.id].note=note.value.slice(0,1200);persistQA();
  });
  card.append(head,note);host.append(card);
 }
}
function updateGame(){
 const game=gameSnapshot(readJSON(localStorage,GAME_KEY));
 const count=['report','record','crystal','platform'].filter(x=>game.evidence[x]).length;
 $('shardCount').textContent=count+' / 4';
 $('gameState').textContent='Case status: '+(game.caseComplete?'completed':'not complete')+' · Last zone: '+game.zone;
 $('worldState').textContent='Crossings: '+game.portalCrossings+' · Distinct zones visited: '+game.visited.length+'/4';
}
function updateMetrics(){
 const data=safeXRMetrics(readJSON(localStorage,XR_METRICS_KEY));
 $('xrStats').textContent=data
 ? 'Sampled '+data.sampledFrames+' frame intervals · ~'+data.approximateFps+' callback FPS · p95 '+data.p95FrameMs+' ms · '+data.framesOver20ms+' intervals over 20 ms'
 : 'No XR performance summary stored. Opt in from the XR Lab before starting a headset session.';
}
function textState(v){return v===true?'yes':v===false?'no':v}
async function checkEnvironment(){
 $('secure').textContent=environment.secureContext?'YES':'NO';
 try{
  const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl');
  environment.webgl=!!gl;if(gl)gl.getExtension('WEBGL_lose_context')?.loseContext();
 }catch{environment.webgl=false}
 $('webgl').textContent=textState(environment.webgl).toUpperCase();
 if(!navigator.xr||typeof navigator.xr.isSessionSupported!=='function'){
  environment.immersiveVR=false;
 }else{
  try{environment.immersiveVR=await navigator.xr.isSessionSupported('immersive-vr')}
  catch{environment.immersiveVR='error'}
 }
 $('immersive').textContent=textState(environment.immersiveVR).toUpperCase();
}
function exportReport(){
 const report=buildReport(qa,readJSON(localStorage,GAME_KEY),environment,readJSON(localStorage,XR_METRICS_KEY));
 const blob=new Blob([JSON.stringify(report,null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='LENZ-field-test-report.json';
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('feedback').textContent='LOCAL REPORT EXPORTED // NOTHING WAS SUBMITTED';
}
$('device').value=qa.device;
$('device').addEventListener('change',e=>{qa.device=e.target.value;persistQA()});
$('refresh').addEventListener('click',()=>{updateGame();updateMetrics();$('feedback').textContent='LOCAL EVIDENCE REFRESHED'});
$('export').addEventListener('click',exportReport);
$('clear').addEventListener('click',()=>{
 if(!confirm('Clear only your Field Test answers? LENZ game saves will remain untouched.'))return;
 qa=normalizeQA(null);persistQA();$('device').value=qa.device;renderSteps();updateSummary();
 $('feedback').textContent='QA ANSWERS CLEARED // GAME SAVE PRESERVED';
});
renderSteps();updateSummary();updateGame();updateMetrics();checkEnvironment();
