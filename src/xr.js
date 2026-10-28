// LENZ v0.6 immersive VR: two sequential Case 001 clues and shared world progress.
import {KEY,IDS,NAMES,ROUTES,GATE_CENTERS,currentZone,readXRSave,persistXRTravel,targetGate} from './xr-gates.js';
import {TERMINAL,raySphere,floorTarget,scanFrontierReport,teleportOffset} from './xr-play.js';
import {DEAD_BREAKER,DEAD_ARCHIVE,deadPowerOnline,restoreDeadPower,retrieveMedicalArchive} from './xr-dead.js';
import {CONDUITS,CORE,PULSE_ORDER,phaseOf,activeConduit,pulseConduit,recoverDungeonCore} from './xr-underworld.js';
const canvas=document.getElementById('scene'),status=document.getElementById('status');
const enter=document.getElementById('enter'),leftButton=document.getElementById('leftGate'),rightButton=document.getElementById('rightGate'),scanButton=document.getElementById('scanTerminal'),powerButton=document.getElementById('deadPower'),archiveButton=document.getElementById('deadArchive'),coreButton=document.getElementById('underworldCore'),conduitButtons=[0,1,2].map(i=>document.getElementById('sentinelNode'+i)),label=document.getElementById('zone');
const gl=canvas.getContext('webgl',{alpha:false,antialias:true,xrCompatible:true});
let zone=currentZone(readXRSave(localStorage)),session=null,referenceSpace=null,program,loc={},cubeBuffer;
let highlightedGate=-1,teleportPreview=null,terminalHighlighted=false,deadTarget=null,sentinelTarget=-1,coreTarget=false,lastPulseMs=-Infinity;
function updateLabel(){
 label.textContent='EXPERIENCE: '+NAMES[zone];
 const routes=ROUTES[zone];
 leftButton.textContent='LEFT GATE / '+routes[0].site+' → '+NAMES[routes[0].to];
 rightButton.textContent='RIGHT GATE / '+routes[1].site+' → '+NAMES[routes[1].to];
 const save=readXRSave(localStorage);
 const flags=save.flags&&typeof save.flags==='object'?save.flags:{};
 scanButton.disabled=zone!=='frontier'||flags.report===true;
 scanButton.textContent=flags.report===true?'FRONTIER REPORT RECOVERED':'SCAN FRONTIER TERMINAL';
 powerButton.disabled=zone!=='dead'||deadPowerOnline(save);
 archiveButton.disabled=zone!=='dead'||flags.record===true;
 powerButton.textContent=deadPowerOnline(save)?'HOSPITAL POWER ONLINE':'RESTORE HOSPITAL POWER';
 archiveButton.textContent=flags.record===true?'MEDICAL FILE RECOVERED':'READ MEDICAL ARCHIVE';
 const stage=phaseOf(save),active=activeConduit(save);
 conduitButtons.forEach((button,i)=>{
  button.disabled=zone!=='underworld'||save.enemyDown===true;
  button.textContent='PULSE '+['LEFT','CENTER','RIGHT'][i]+' / '+(i+1);
  button.classList.toggle('active-node',zone==='underworld'&&i===active&&flags.record===true);
 });
 coreButton.disabled=zone!=='underworld'||flags.crystal===true;
 coreButton.textContent=flags.crystal===true?'STABILIZER RECOVERED':'RECOVER STABILIZER CORE';
 document.getElementById('sentinelStatus').textContent=zone!=='underworld'?'UNDERWORLD ENCOUNTER AVAILABLE AFTER PORTAL CROSSING':
  save.enemyDown===true?'SENTINEL DISABLED // SCAN THE CORE':
  flags.record!==true?'SENTINEL IMMUNE // RECOVER DEAD SECTOR MEDICAL COUNTERCODE':
  'SHIELD PHASE '+stage+'/3 // AIM AT '+['LEFT','CENTER','RIGHT'][active]+' CONDUIT';
 const found=['report','record','crystal','platform'].filter(k=>flags[k]===true).length;
 document.getElementById('caseState').textContent='SHARDS '+found+'/4 · '+(flags.vault===true?'CASE 001 COMPLETE':'CORPORATE VAULT SEALED')+' · '+(save.portalCount||0)+' GATE CROSSINGS';
 document.getElementById('xrJournal').textContent=(save.portalLog||[]).slice(-5).reverse().join(' · ')||'NO THRESHOLDS RECORDED';
 status.textContent='ACTIVE LENS // '+NAMES[zone]+' // '+(session?'AIM AND PRESS CONTROLLER TRIGGER':'DESKTOP PREVIEW');
}
function scanTerminal(){
 try{
  const previous=readXRSave(localStorage);
  const result=scanFrontierReport({...previous,zone});
  if(result.changed)localStorage.setItem(KEY,JSON.stringify(result.state));
  updateLabel();status.textContent=result.reason;
  return result.changed;
 }catch(err){status.textContent='EVIDENCE ERROR // '+String(err?.message||err).slice(0,100);return false}
}
scanButton.addEventListener('click',scanTerminal);
function changeDeadState(operation){
 try{
  const saved={...readXRSave(localStorage),zone};
  const result=operation(saved);
  if(result.changed)localStorage.setItem(KEY,JSON.stringify(result.state));
  updateLabel();status.textContent=result.reason;
  return result.changed;
 }catch(err){status.textContent='ARCHIVE ERROR // '+String(err?.message||err).slice(0,100);return false}
}
function restorePower(){return changeDeadState(restoreDeadPower)}
function readArchive(){return changeDeadState(retrieveMedicalArchive)}
powerButton.addEventListener('click',restorePower);
archiveButton.addEventListener('click',readArchive);
function updateUnderworld(operation){
 try{
  const previous={...readXRSave(localStorage),zone};
  const result=operation(previous);
  if(result.changed)localStorage.setItem(KEY,JSON.stringify(result.state));
  updateLabel();status.textContent=result.reason;
  return result.changed;
 }catch(err){status.textContent='SENTINEL ERROR // '+String(err?.message||err).slice(0,110);return false}
}
function pulseSentinel(index){
 const now=performance.now();
 if(now-lastPulseMs<500||zone!=='underworld')return false;
 lastPulseMs=now;
 return updateUnderworld(s=>pulseConduit(s,index));
}
function takeCore(){return updateUnderworld(recoverDungeonCore)}
conduitButtons.forEach((b,i)=>b.addEventListener('click',()=>pulseSentinel(i)));
coreButton.addEventListener('click',takeCore);
function traverse(index){
 try{
  const state=persistXRTravel(localStorage,zone,index);
  if(!state)return false;
  zone=currentZone(state);highlightedGate=-1;deadTarget=null;sentinelTarget=-1;coreTarget=false;updateLabel();
  return true;
 }catch(err){
  status.textContent='SAVE ERROR // '+String(err?.message||err).slice(0,120);return false;
 }
}
function changeZone(event){
 // Target precedence: portal > evidence devices > floor teleport.
 // No trigger does anything unless the controller ray actually hits a target.
 if(!event||!referenceSpace)return false;
 const frame=event.frame,space=event.inputSource?.targetRaySpace;
 const pose=frame&&space?frame.getPose(space,referenceSpace):null;
 if(!pose){status.textContent='NO CONTROLLER TARGET RAY AVAILABLE';return false}
 const origin=pose.transform.position,orientation=pose.transform.orientation;
 const which=targetGate(origin,orientation);
 if(which>=0)return traverse(which);
 if(zone==='frontier'&&raySphere(origin,orientation,TERMINAL)!==null)return scanTerminal();
 if(zone==='dead'){
  if(raySphere(origin,orientation,DEAD_BREAKER)!==null)return restorePower();
  if(raySphere(origin,orientation,DEAD_ARCHIVE)!==null)return readArchive();
 }
 if(zone==='underworld'){
  for(let i=0;i<CONDUITS.length;i++){
   if(raySphere(origin,orientation,CONDUITS[i])!==null)return pulseSentinel(i);
  }
  if(raySphere(origin,orientation,CORE)!==null)return takeCore();
 }
 const floor=floorTarget(origin,orientation);
 if(floor)return teleportTo(floor,frame);
 status.textContent='AIM AT A PORTAL, A TARGETABLE OBJECT, OR THE FLOOR';
 return false;
}
function teleportTo(target,frame){
 if(!referenceSpace||!frame)return false;
 const viewer=frame.getViewerPose(referenceSpace)?.transform?.position;
 const delta=teleportOffset(viewer,target);
 if(!delta){status.textContent='TELEPORT OUT OF RANGE';return false}
 if(typeof XRRigidTransform==='undefined'){
  status.textContent='VR REFERENCE SPACE OFFSET UNAVAILABLE';return false
 }
 try{
  referenceSpace=referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(delta));
  teleportPreview=null;highlightedGate=-1;terminalHighlighted=false;deadTarget=null;sentinelTarget=-1;coreTarget=false;
  status.textContent='TELEPORT COMPLETE // AIM AT GATE, TERMINAL OR FLOOR';
  return true;
 }catch(err){status.textContent='TELEPORT FAILED // '+String(err?.message||err).slice(0,90);return false}
}
leftButton.addEventListener('click',()=>traverse(0));
rightButton.addEventListener('click',()=>traverse(1));

function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
function init(){
 const vs=compile(gl.VERTEX_SHADER,
 'attribute vec3 aPos; attribute vec3 aNormal; uniform mat4 uP; uniform mat4 uV; uniform vec3 uOffset; uniform vec3 uScale; varying float vLight; void main(){vec3 norm=aNormal;vLight=.52+max(dot(norm,normalize(vec3(.45,.9,.4))),0.0)*.48;gl_Position=uP*uV*vec4(aPos*uScale+uOffset,1.0);}');
 const fs=compile(gl.FRAGMENT_SHADER,'precision mediump float; uniform vec3 uColor; varying float vLight;void main(){gl_FragColor=vec4(uColor*vLight,1.0);}');
 program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);
 for(const name of ['uP','uV','uOffset','uScale','uColor'])loc[name]=gl.getUniformLocation(program,name);
 const data=[];
 const faces=[
  [[0,0,1],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]],
  [[0,0,-1],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]],
  [[1,0,0],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]]],
  [[-1,0,0],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]]],
  [[0,1,0],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]]],
  [[0,-1,0],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]]
 ];
 for(const [normal,verts] of faces)for(const idx of [0,1,2,0,2,3])data.push(...verts[idx].map(v=>v*.5),...normal);
 cubeBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,cubeBuffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
 for(const [name,off] of [['aPos',0],['aNormal',12]]){
  const at=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,3,gl.FLOAT,false,24,off);
 }
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
}
function box(x,y,z,sx,sy,sz,color){
 gl.uniform3fv(loc.uOffset,[x,y,z]);gl.uniform3fv(loc.uScale,[sx,sy,sz]);gl.uniform3fv(loc.uColor,color);
 gl.drawArrays(gl.TRIANGLES,0,36);
}
const C={blue:[.14,.42,.58],ice:[.28,.89,.95],pale:[.62,.87,.88],floor:[.10,.22,.27],dark:[.10,.13,.20],red:[.9,.19,.31],hot:[1,.42,.45],gold:[.94,.62,.24],purple:[.46,.31,.68],stone:[.24,.30,.44],green:[.27,.66,.48]};
const DIGITS={1:[1,2],2:[0,1,3,4,6],3:[0,1,2,3,6],4:[1,2,5,6]};
function drawDigit(x,y,z,n,color){
 const segments=[
  [0,.32,.47,.055],  // top
  [.25,.15,.05,.30], // upper right
  [.25,-.20,.05,.30],// lower right
  [0,-.37,.47,.055], // bottom
  [-.25,-.20,.05,.30],// lower left
  [-.25,.15,.05,.30],// upper left
  [0,-.02,.47,.055]  // middle
 ];
 for(const id of DIGITS[n]||[]){
  const [dx,dy,w,h]=segments[id];
  box(x+dx,y+dy,z,w,h,.04,color);
 }
}
function scene(){
 box(0,-.18,-5,18,.28,24,C.floor);
 // Both portals occupy stable physical positions: no scripted headset movement.
 const accent=zone==='dead'?C.red:zone==='underworld'?C.purple:zone==='fracture'?C.gold:C.ice;
 for(let i=0;i<2;i++){
  const route=ROUTES[zone][i],x=GATE_CENTERS[i],active=i===highlightedGate;
  const color=active?C.pale:route.to==='dead'?C.red:route.to==='underworld'?C.purple:route.to==='fracture'?C.gold:C.ice;
  box(x-.64,1.34,-3.7,.13,2.55,.25,color);
  box(x+.64,1.34,-3.7,.13,2.55,.25,color);
  box(x,2.58,-3.7,1.38,.16,.25,color);
  box(x,.09,-3.7,1.38,.13,.3,color);
  box(x,2.82,-3.7,.85,.06,.24,C.stone);
  drawDigit(x,2.86,-3.59,IDS.indexOf(route.to)+1,color);
  // Gates have no opaque center, so the environment remains visible through them.
 }
 // Four distinctive representations of an Experience Zone.
 if(zone==='frontier'){
  box(0,-.06,-6,2.25,.04,5,[.26,.29,.32]);
  for(let i=0;i<7;i++){
   const x=i%2?-2.6:2.6,z=-5-i*1.65,h=1+(i%3)*.65;
   box(x,h/2-.06,z,1.2,h,1.25,i%2?C.blue:C.stone);
   box(x,h-.05,z,.5,.09,.55,C.ice);
  }
  box(0,.7,-5.45,.6,1.4,.6,C.green);
  // An interactable scan console, placed between the two portal openings.
  box(0,1.13,-5.06,.68,.45,.14,terminalHighlighted?C.pale:C.ice);
  box(0,1.53,-5.04,.46,.06,.15,C.gold);
 }else if(zone==='dead'){
  for(let i=0;i<5;i++){
   const z=-5.1-i*1.75;
   box(-2.1,1.15,z,.4,2.35,1.3,C.dark);box(2.1,1.15,z,.4,2.35,1.3,C.dark);
   box(0,2.3,z,4.3,.35,.4,C.stone);
   box(i%2?1.75:-1.75,1.5,z,.08,.3,.25,C.red);
  }
  box(0,.85,-6, .72,1.7,.8,C.red);box(0,1.75,-6,.6,.18,.8,C.hot);
  // Sequential story devices, deliberately separated for controller targeting:
  // right: emergency breaker; left: sealed medical archive.
  const save=readXRSave(localStorage);
  const powered=deadPowerOnline(save);
  box(DEAD_BREAKER.x,DEAD_BREAKER.y,DEAD_BREAKER.z,.65,.58,.25,deadTarget==='breaker'?C.pale:powered?C.green:C.red);
  box(DEAD_BREAKER.x,1.64,DEAD_BREAKER.z,.1,.37,.11,powered?C.green:C.gold);
  drawDigit(DEAD_BREAKER.x,1.89,DEAD_BREAKER.z+.14,1,C.pale);
  box(DEAD_ARCHIVE.x,DEAD_ARCHIVE.y,DEAD_ARCHIVE.z,.8,.64,.22,deadTarget==='archive'?C.pale:powered?C.ice:C.red);
  box(DEAD_ARCHIVE.x,1.75,DEAD_ARCHIVE.z,.58,.09,.3,powered?C.green:C.hot);
  drawDigit(DEAD_ARCHIVE.x,2.03,DEAD_ARCHIVE.z+.15,2,C.pale);
 }else if(zone==='underworld'){
  box(0,.67,-6.3,5.3,.27,5.3,C.stone);
  for(let x=0;x<5;x++)for(let z=0;z<5;z++)
   box((x-2)*.94,.85,-6.3+(z-2)*.94,.87,.09,.87,(x+z)%2?C.purple:C.blue);
  const saved=readXRSave(localStorage),down=saved.enemyDown===true;
  box(0,1.18,-6.35,.68,1.26,.54,down?C.stone:C.purple);
  box(0,1.94,-6.35,.52,.28,.55,down?C.stone:C.red);
  for(let i=0;i<CONDUITS.length;i++){
   const node=CONDUITS[i],expected=activeConduit(saved);
   const completed=down||PULSE_ORDER.slice(0,phaseOf(saved)).includes(i);
   const color=completed?C.stone:i===sentinelTarget?C.pale:i===expected?C.gold:C.red;
   box(node.x,node.y,node.z,.42,.42,.24,color);
   drawDigit(node.x,node.y+.36,node.z+.06,i+1,color);
  }
  // The stabilizer is still shielded until the final tactical pulse.
  box(CORE.x,CORE.y,CORE.z,.53,.54,.53,coreTarget?C.pale:down?C.ice:C.dark);
  box(CORE.x,CORE.y+.46,CORE.z,.38,.12,.38,down?C.green:C.red);
 }else{
  const platforms=[[0,-5.3],[-1.3,-6.6],[.4,-7.9],[1.6,-9.2],[-.9,-10.5]];
  platforms.forEach(([x,z],i)=>box(x,.25+i*.35,z,1.6,.23,.95,i%2?C.gold:C.blue));
  box(1.6,2.22,-9.2,.25,.8,.25,C.ice);
 }
 // Near-space apparatus makes the room feel physically grounded.
 box(-2.6,.65,-1.8,.46,1.3,.44,C.stone);box(2.6,.65,-1.8,.46,1.3,.44,C.stone);
 if(teleportPreview){
  // No flashing, animations or camera movement: a stable ground marker.
  box(teleportPreview.x,-.035,teleportPreview.z,.36,.025,.36,C.ice);
  box(teleportPreview.x,-.018,teleportPreview.z,.12,.027,.12,C.green);
 }
 box(-2.6,1.36,-1.8,.3,.1,.3,accent);box(2.6,1.36,-1.8,.3,.1,.3,accent);
}
function render(projection,view){
 gl.useProgram(program);gl.uniformMatrix4fv(loc.uP,false,projection);gl.uniformMatrix4fv(loc.uV,false,view);scene();
}
function perspective(fov,aspect,near,far){
 const f=1/Math.tan(fov/2),r=1/(near-far);
 return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*r,-1,0,0,2*far*near*r,0]);
}
function lookAt(eye,target){
 const norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l)};
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const z=norm(eye.map((v,i)=>v-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x);
 return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,
  -x.reduce((acc,v,i)=>acc+v*eye[i],0),-y.reduce((acc,v,i)=>acc+v*eye[i],0),-z.reduce((acc,v,i)=>acc+v*eye[i],0),1]);
}
function clear(){
 const bg=zone==='dead'?[.055,.025,.055]:zone==='underworld'?[.035,.03,.10]:[.03,.08,.14];
 gl.clearColor(...bg,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
}
function preview(){
 if(session||!gl)return;
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);clear();
 render(perspective(Math.PI/3,canvas.width/canvas.height,.05,80),lookAt([0,1.8,2.1],[0,1.2,-5.3]));
 requestAnimationFrame(preview);
}
function immersiveFrame(time,frame){
 if(!session)return;session.requestAnimationFrame(immersiveFrame);
 const pose=frame.getViewerPose(referenceSpace);if(!pose)return;
 highlightedGate=-1;teleportPreview=null;terminalHighlighted=false;deadTarget=null;sentinelTarget=-1;coreTarget=false;
 for(const source of session.inputSources||[]){
  const ray=frame.getPose(source.targetRaySpace,referenceSpace);
  if(!ray)continue;
  const origin=ray.transform.position,orientation=ray.transform.orientation;
  highlightedGate=targetGate(origin,orientation);
  if(highlightedGate!==-1)break;
  if(zone==='frontier'&&raySphere(origin,orientation,TERMINAL)!==null){terminalHighlighted=true;break}
  if(zone==='dead'&&raySphere(origin,orientation,DEAD_BREAKER)!==null){deadTarget='breaker';break}
  if(zone==='dead'&&raySphere(origin,orientation,DEAD_ARCHIVE)!==null){deadTarget='archive';break}
  if(zone==='underworld'){
   for(let i=0;i<CONDUITS.length;i++)if(raySphere(origin,orientation,CONDUITS[i])!==null){sentinelTarget=i;break}
   if(sentinelTarget!==-1)break;
   if(raySphere(origin,orientation,CORE)!==null){coreTarget=true;break}
  }
  teleportPreview=floorTarget(origin,orientation);
  if(teleportPreview)break;
 }
 const layer=session.renderState.baseLayer;
 gl.bindFramebuffer(gl.FRAMEBUFFER,layer.framebuffer);clear();
 for(const view of pose.views){
  const v=layer.getViewport(view);gl.viewport(v.x,v.y,v.width,v.height);
  render(view.projectionMatrix,view.transform.inverse.matrix);
 }
}
async function enterXR(){
 try{
  enter.disabled=true;const xr=await navigator.xr.requestSession('immersive-vr',{requiredFeatures:['local-floor']});
  session=xr;session.addEventListener('select',changeZone);
  session.addEventListener('end',()=>{
   session=null;referenceSpace=null;highlightedGate=-1;teleportPreview=null;terminalHighlighted=false;deadTarget=null;sentinelTarget=-1;coreTarget=false;enter.disabled=false;enter.textContent='ENTER IMMERSIVE VR';updateLabel();requestAnimationFrame(preview);
  });
  await gl.makeXRCompatible?.();
  xr.updateRenderState({baseLayer:new XRWebGLLayer(xr,gl,{alpha:false,depth:true})});
  referenceSpace=await xr.requestReferenceSpace('local-floor');
  updateLabel();xr.requestAnimationFrame(immersiveFrame);
 }catch(err){
  status.textContent='IMMERSIVE VR COULD NOT START: '+(err?.message||String(err));
  if(session){try{await session.end()}catch{}session=null}
  enter.disabled=false;
 }
}
enter.addEventListener('click',enterXR);
if(!gl){
 status.textContent='WEBGL UNAVAILABLE: TRY A BROWSER WITH WEBGL ENABLED';
 enter.textContent='WEBGL REQUIRED';leftButton.disabled=true;rightButton.disabled=true;scanButton.disabled=true;powerButton.disabled=true;archiveButton.disabled=true;coreButton.disabled=true;conduitButtons.forEach(b=>b.disabled=true);
}else{
 try{init();requestAnimationFrame(preview);updateLabel();
  if(navigator.xr){
   navigator.xr.isSessionSupported('immersive-vr').then(supported=>{
    enter.disabled=!supported;enter.textContent=supported?'ENTER IMMERSIVE VR':'IMMERSIVE VR NOT AVAILABLE';
    if(!supported)status.textContent='DESKTOP PREVIEW ONLY // OPEN THIS HTTPS PAGE IN A COMPATIBLE HEADSET BROWSER';
   }).catch(()=>{enter.textContent='IMMERSIVE VR NOT AVAILABLE'});
  }else{enter.textContent='IMMERSIVE VR NOT AVAILABLE';status.textContent='WEBXR NOT EXPOSED IN THIS BROWSER // DESKTOP PREVIEW ONLY'}
 }catch(err){status.textContent='GRAPHICS ERROR: '+err.message;enter.textContent='GRAPHICS ERROR';leftButton.disabled=true;rightButton.disabled=true;scanButton.disabled=true}
}