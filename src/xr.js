// LENZ WebXR stationary prototype. Native WebGL/WebXR, no CDN or engine dependency.
const canvas=document.getElementById('scene'),status=document.getElementById('status');
const enter=document.getElementById('enter'),cycle=document.getElementById('cycle'),label=document.getElementById('zone');
const gl=canvas.getContext('webgl',{alpha:false,antialias:true,xrCompatible:true});
const KEY='lenz-poc-v1',IDS=['frontier','dead','underworld','fracture'];
const NAMES={frontier:'FRONTIER',dead:'DEAD SECTOR',underworld:'UNDERWORLD',fracture:'THE FRACTURE'};
let zone='frontier',session=null,referenceSpace=null,program,loc={},cubeBuffer;
try{const saved=JSON.parse(localStorage.getItem(KEY));if(IDS.includes(saved?.zone))zone=saved.zone}catch{}
function persist(){
 try{
 const raw=JSON.parse(localStorage.getItem(KEY))||{};
 raw.zone=zone;raw.visited=Array.isArray(raw.visited)?raw.visited.filter(id=>IDS.includes(id)):[];
 if(!raw.visited.includes(zone))raw.visited.push(zone);
 localStorage.setItem(KEY,JSON.stringify(raw));
 }catch{}
}
function updateLabel(){label.textContent='EXPERIENCE: '+NAMES[zone];status.textContent='ACTIVE LENS // '+NAMES[zone]+' // '+(session?'TRIGGER TO SHIFT':'DESKTOP PREVIEW')}
function changeZone(){zone=IDS[(IDS.indexOf(zone)+1)%IDS.length];persist();updateLabel()}
cycle.addEventListener('click',changeZone);
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
function scene(){
 box(0,-.18,-5,18,.28,24,C.floor);
 // The portal itself stays fixed in world space. Headset motion is never overridden.
 const accent=zone==='dead'?C.red:zone==='underworld'?C.purple:zone==='fracture'?C.gold:C.ice;
 box(-1.32,1.42,-3.7,.23,2.9,.3,accent);box(1.32,1.42,-3.7,.23,2.9,.3,accent);
 box(0,2.77,-3.7,2.88,.23,.3,accent);
 box(0,.04,-3.7,2.9,.1,.5,accent);
 box(0,1.3,-3.86,2.3,2.5,.075,zone==='dead'?[.09,.025,.06]:[.045,.13,.20]);
 // Four distinctive representations of an Experience Zone.
 if(zone==='frontier'){
  box(0,-.06,-6,2.25,.04,5,[.26,.29,.32]);
  for(let i=0;i<7;i++){
   const x=i%2?-2.6:2.6,z=-5-i*1.65,h=1+(i%3)*.65;
   box(x,h/2-.06,z,1.2,h,1.25,i%2?C.blue:C.stone);
   box(x,h-.05,z,.5,.09,.55,C.ice);
  }
  box(0,.7,-5.45,.6,1.4,.6,C.green);
 }else if(zone==='dead'){
  for(let i=0;i<5;i++){
   const z=-5.1-i*1.75;
   box(-2.1,1.15,z,.4,2.35,1.3,C.dark);box(2.1,1.15,z,.4,2.35,1.3,C.dark);
   box(0,2.3,z,4.3,.35,.4,C.stone);
   box(i%2?1.75:-1.75,1.5,z,.08,.3,.25,C.red);
  }
  box(0,.85,-6, .72,1.7,.8,C.red);box(0,1.75,-6,.6,.18,.8,C.hot);
 }else if(zone==='underworld'){
  box(0,.67,-6.3,5.3,.27,5.3,C.stone);
  for(let x=0;x<5;x++)for(let z=0;z<5;z++)
   box((x-2)*.94,.85,-6.3+(z-2)*.94,.87,.09,.87,(x+z)%2?C.purple:C.blue);
  box(0,1.24,-6.3,.55,.75,.55,C.gold);
  box(1.1,1.27,-7.15,.5,.82,.5,C.red);
 }else{
  const platforms=[[0,-5.3],[-1.3,-6.6],[.4,-7.9],[1.6,-9.2],[-.9,-10.5]];
  platforms.forEach(([x,z],i)=>box(x,.25+i*.35,z,1.6,.23,.95,i%2?C.gold:C.blue));
  box(1.6,2.22,-9.2,.25,.8,.25,C.ice);
 }
 // Near-space apparatus makes the room feel physically grounded.
 box(-2.6,.65,-1.8,.46,1.3,.44,C.stone);box(2.6,.65,-1.8,.46,1.3,.44,C.stone);
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
   session=null;referenceSpace=null;enter.disabled=false;enter.textContent='ENTER IMMERSIVE VR';updateLabel();requestAnimationFrame(preview);
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
 enter.textContent='WEBGL REQUIRED';cycle.disabled=true;
}else{
 try{init();requestAnimationFrame(preview);updateLabel();
  if(navigator.xr){
   navigator.xr.isSessionSupported('immersive-vr').then(supported=>{
    enter.disabled=!supported;enter.textContent=supported?'ENTER IMMERSIVE VR':'IMMERSIVE VR NOT AVAILABLE';
    if(!supported)status.textContent='DESKTOP PREVIEW ONLY // OPEN THIS HTTPS PAGE IN A COMPATIBLE HEADSET BROWSER';
   }).catch(()=>{enter.textContent='IMMERSIVE VR NOT AVAILABLE'});
  }else{enter.textContent='IMMERSIVE VR NOT AVAILABLE';status.textContent='WEBXR NOT EXPOSED IN THIS BROWSER // DESKTOP PREVIEW ONLY'}
 }catch(err){status.textContent='GRAPHICS ERROR: '+err.message;enter.textContent='GRAPHICS ERROR';cycle.disabled=true}
}