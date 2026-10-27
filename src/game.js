// LENZ v0.1: dependency-free, single-world-state genre experiment.
// This is a prototype: four mechanically different scenes, not four full games.
const canvas=document.getElementById('game'),c=canvas.getContext('2d');
const W=1120,H=630,KEY='lenz-poc-v1';
const IDS=['frontier','dead','underworld','fracture'];
const NAMES={frontier:'FRONTIER',dead:'DEAD SECTOR',underworld:'UNDERWORLD',fracture:'THE FRACTURE'};
const OBJECTIVES={
 frontier:'E: recover anomaly report near the cyan marker.',
 dead:'E: retrieve the corrupted medical record. Avoid the hunter.',
 underworld:'SPACE: fight the sentinel. E: recover the crystal.',
 fracture:'SPACE: jump across platforms. E: claim the shard.'
};
const defaults=()=>({
 zone:'frontier',health:100,flags:{},visited:['frontier'],
 positions:{frontier:{x:160,y:355},dead:{x:125,y:370},underworld:{x:1,y:6},fracture:{x:100,y:560,vy:0}},
 enemyDown:false
});
function load(){
 try{
  const raw=JSON.parse(localStorage.getItem(KEY));if(!raw||!IDS.includes(raw.zone))return defaults();
  const d=defaults();
  d.zone=raw.zone;d.health=Math.max(1,Math.min(100,Number(raw.health)||100));
  for(const id of ['report','record','crystal','platform'])if(raw.flags?.[id]===true)d.flags[id]=true;
  d.visited=IDS.filter(id=>raw.visited?.includes(id));if(!d.visited.includes(d.zone))d.visited.push(d.zone);
  d.enemyDown=raw.enemyDown===true;
  for(const id of IDS){const v=raw.positions?.[id];if(v&&Number.isFinite(v.x)&&Number.isFinite(v.y)){
   d.positions[id].x= v.x;d.positions[id].y=v.y;
  }}
  return d;
 }catch{return defaults();}
}
let s=load(),keys=new Set(),facing=0,enemy={x:860,y:355},lastHit=0,lastSave=0,notice='L.E.N.Z. SYSTEM ONLINE',noticeUntil=0,gamepadWas={};
function save(){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}}
function p(){return s.positions[s.zone]}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function has(id){return !!s.flags[id]}
function shardCount(){return ['report','record','crystal','platform'].filter(has).length}
function say(msg,seconds=4){notice=msg;noticeUntil=performance.now()+seconds*1000;document.getElementById('ticker').textContent=msg}
function gain(id,msg){
 if(has(id)){say('DATA ALREADY RECOVERED');return}
 s.flags[id]=true;s.health=Math.min(100,s.health+10);
 say(msg,6);save();hud();
 if(shardCount()===4)say('SUBJECT STATUS: REVOKED // FOUR ZONES BREACHED',12);
}
function hud(){
 document.getElementById('zoneTitle').textContent='EXPERIENCE ZONE // '+NAMES[s.zone];
 document.getElementById('health').textContent=Math.ceil(s.health)+' / 100';
 document.getElementById('shards').textContent=shardCount()+' / 4';
 document.getElementById('visited').textContent=s.visited.length+' / 4';
 document.getElementById('objective').textContent=OBJECTIVES[s.zone];
 document.getElementById('signal').textContent=s.zone==='dead'?'SIGNAL: COMPROMISED':'SIGNAL: '+(shardCount()===4?'BREACHED':'STABLE');
 document.querySelectorAll('[data-zone]').forEach(b=>{
  const active=b.dataset.zone===s.zone;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));
 });
}
function shift(id){
 if(!IDS.includes(id)||id===s.zone)return;
 s.zone=id;if(!s.visited.includes(id))s.visited.push(id);
 facing=0;say('REALITY RECONFIGURED // '+NAMES[id],5);hud();save();canvas.focus({preventScroll:true});
}
function next(){shift(IDS[(IDS.indexOf(s.zone)+1)%IDS.length])}
function interact(){
 const a=p();
 if(s.zone==='frontier'&&dist(a,{x:738,y:292})<105)gain('report','ANOMALY REPORT: ZONES WERE NEVER MEANT TO CONNECT');
 else if(s.zone==='dead'&&dist(a,{x:887,y:204})<105)gain('record','MEDICAL RECORD: THE SUBJECTS ARE STILL INSIDE');
 else if(s.zone==='underworld'&&dist(a,{x:8,y:6})<2.2)gain('crystal','DUNGEON CORE: A NEW PERSPECTIVE UNLOCKED');
 else if(s.zone==='fracture'&&dist(a,{x:822,y:318})<100)gain('platform','STABILITY SHARD ACQUIRED: REALITY IS ARTIFICIAL');
 else say('NOTHING TO INTERACT WITH HERE',1.8);
}
function action(){
 const a=p();
 if(s.zone==='underworld'){
  if(!s.enemyDown&&dist(a,{x:8,y:3})<2.4){s.enemyDown=true;say('SENTINEL DEFEATED // PERSISTENT ACROSS LENSES');save();}
  else say('STRIKE MISSED: APPROACH THE SENTINEL',1.5);
 }else if(s.zone==='fracture'){
  if(a.grounded!==false||Math.abs(a.vy)<1){a.vy=-475;a.grounded=false;}
 }else if(s.zone==='dead'){
  const d=dist(a,enemy);if(d<175){enemy.x+=Math.cos(facing+Math.PI)*140;enemy.y+=Math.sin(facing+Math.PI)*140;say('EMERGENCY PULSE // HUNTER REPULSED',1.8);}
  else say('PULSE OUT OF RANGE',1.3);
 }else say('SCANNER ACTIVE // FOLLOW THE CYAN MARKER',1.8);
}
function damage(n){
 s.health=Math.max(0,s.health-n);
 if(s.health<=0){s.health=50;s.positions[s.zone]=defaults().positions[s.zone];enemy={x:860,y:355};say('SIMULATION RESET // YOUR DISCOVERIES SURVIVED',5);}
 hud();save();
}
function inputs(){
 let x=Number(keys.has('arrowright')||keys.has('d'))-Number(keys.has('arrowleft')||keys.has('a'));
 let y=Number(keys.has('arrowdown')||keys.has('s'))-Number(keys.has('arrowup')||keys.has('w'));
 const gp=navigator.getGamepads?.()?.find(g=>g?.connected);
 if(gp){
  const gx=Math.abs(gp.axes[0]||0)>.2?gp.axes[0]:0,gy=Math.abs(gp.axes[1]||0)>.2?gp.axes[1]:0;
  if(!x)x=gx;if(!y)y=gy;
  for(const [idx,fn] of [[0,action],[2,interact],[3,next]]){
   const held=!!gp.buttons[idx]?.pressed;if(held&&!gamepadWas[idx])fn();gamepadWas[idx]=held;
  }
 }
 const len=Math.hypot(x,y);return len>1?{x:x/len,y:y/len}:{x,y};
}
function update(dt,now){
 const input=inputs(),a=p();
 if(s.zone==='frontier'||s.zone==='dead'){
  const speed=(s.zone==='dead'?145:205);
  a.x=clamp(a.x+input.x*speed*dt,34,1080);a.y=clamp(a.y+input.y*speed*dt,94,560);
  if(Math.hypot(input.x,input.y)>.05)facing=Math.atan2(input.y,input.x);
  if(s.zone==='dead'){
   const d=dist(a,enemy);
   if(d>32){enemy.x+=(a.x-enemy.x)/d*55*dt;enemy.y+=(a.y-enemy.y)/d*55*dt;}
   if(d<42&&now-lastHit>1400){lastHit=now;damage(12);say('HUNTER CONTACT // VITALS DAMAGED',2);}
  }
 }else if(s.zone==='underworld'){
  a.x=clamp(a.x+input.x*3.5*dt,0,11);a.y=clamp(a.y+input.y*3.5*dt,0,8);
 }else{
  const prevY=a.y;a.x=clamp(a.x+input.x*230*dt,20,1090);
  a.vy=clamp((a.vy||0)+980*dt,-550,900);a.y+=a.vy*dt;a.grounded=false;
  const surfaces=[{x:0,y:560,w:1120},{x:205,y:485,w:170},{x:455,y:410,w:180},{x:725,y:350,w:190}];
  for(const pl of surfaces){if(a.x>=pl.x-12&&a.x<=pl.x+pl.w+12&&prevY<=pl.y+8&&a.y>=pl.y&&a.vy>=0){a.y=pl.y;a.vy=0;a.grounded=true;break}}
  if(a.y>675){a.x=100;a.y=560;a.vy=0;damage(8);say('FALL DETECTED // CHECKPOINT RESTORED',2);}
 }
 if(now-lastSave>2400){lastSave=now;save()}
 if(noticeUntil&&now>noticeUntil){noticeUntil=0;document.getElementById('ticker').textContent='MONITORING SUBJECT // '+s.zone.toUpperCase()}
}
function rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h)}
function line(x,y,x2,y2,color,width=1){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function text(t,x,y,size=16,color='#d9ecff',font='monospace'){c.fillStyle=color;c.font='bold '+size+'px '+font;c.fillText(t,x,y)}
function circle(x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()}
function player(x,y,r=13){circle(x,y,r+5,'#244c5f');circle(x,y,r,'#7bedef');circle(x-3,y-4,4,'#e9feff')}
function marker(x,y,t){const bob=Math.sin(performance.now()/300)*5;circle(x,y+bob,24,'#1d5260');circle(x,y+bob,13,'#50e8ec');text(t,x-20,y-36,12)}
function backdrop(color='#111f2d'){
 rect(0,0,W,H,color);
 for(let i=0;i<25;i++)line(0,i*27,W,i*27,'#31506c22');
 for(let i=0;i<35;i++)line(i*35,0,i*35,H,'#31506c1b');
}
function frontier(){
 backdrop('#1a2f37');const a=p();
 rect(0,285,1120,120,'#3e4d57');for(let i=0;i<1120;i+=105)rect(i,344,53,4,'#a7c4cc55');
 rect(0,0,1120,60,'#1e3d46');rect(0,560,1120,70,'#1e3d46');
 const blocks=[[240,105,170,125],[520,80,130,175],[840,104,210,122],[360,430,140,115],[790,449,185,106]];
 blocks.forEach(([x,y,w,h],i)=>{rect(x+8,y+9,w,h,'#0b1921aa');rect(x,y,w,h,i%2?'#2b5866':'#314653');rect(x+15,y+15,w-30,6,'#71b3be44');rect(x+w/2-12,y+h-10,24,10,'#0e2434')});
 for(let i=0;i<13;i++){const x=(i*173+77)%W,y=(i*91+50)%H;if(y<275||y>415){circle(x,y,17,'#315a4d');circle(x+5,y-7,10,'#3a6d58')}}
 rect(970,290,82,94,'#123e50');text('EXIT',982,281,13,'#b5f8fc');text('L.E.N.Z.',470,34,18,'#7be8ea');
 if(!has('report'))marker(738,292,'E: READ');else circle(738,292,11,'#297365');
 player(a.x,a.y);text('FRONTIER // FIELD SURVEY',26,93,18);text('Walk to the cyan terminal. Change reality with Q.',26,119,13,'#b1cfd8');
}
function dead(){
 backdrop('#171923');const a=p();
 for(const [x,y,w,h] of [[0,0,1120,70],[0,550,1120,80],[345,78,40,310],[600,280,45,275],[783,68,42,160],[1000,70,120,500]]){
  rect(x,y,w,h,'#3a3941');rect(x+6,y+5,Math.max(1,w-12),Math.max(1,h-10),'#282833');
 }
 for(let i=0;i<6;i++){rect(120+i*140,82,67,13,'#682e43');rect(135+i*140,95,27,5,'#f15d6a77')}
 marker(!has('record')?887:-400,204,'E: LOG');
 circle(enemy.x,enemy.y,22,'#b42a44');circle(enemy.x,enemy.y,10,'#f56a78');
 player(a.x,a.y);
 c.save();rect(0,0,W,H,'#030609e0');c.globalCompositeOperation='destination-out';
 const radial=c.createRadialGradient(a.x,a.y,8,a.x,a.y,85);radial.addColorStop(0,'#000');radial.addColorStop(1,'#0000');circle(a.x,a.y,85,radial);
 c.beginPath();c.moveTo(a.x,a.y);c.arc(a.x,a.y,310,facing-.45,facing+.45);c.closePath();c.fillStyle='#000';c.fill();c.restore();
 text('DEAD SECTOR // DO NOT TRUST THE LIGHTS',26,96,17,'#ff8698');
 text('SPACE: pulse the hunter away. Find the medical terminal.',26,121,13,'#ffb4bc');
}
function iso(x,y){return {x:550+(x-y)*43,y:120+(x+y)*24}}
function diamond(x,y,rx,ry,color){
 c.beginPath();c.moveTo(x,y-ry);c.lineTo(x+rx,y);c.lineTo(x,y+ry);c.lineTo(x-rx,y);c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#36516a';c.stroke();
}
function underworld(){
 backdrop('#121b2d');
 for(let y=0;y<9;y++)for(let x=0;x<12;x++){
  const v=iso(x,y);diamond(v.x,v.y,43,24,(x+y)%2?'#223548':'#293f56');
 }
 const p1=iso(8,3),p2=iso(8,6),a=iso(p().x,p().y);
 if(!s.enemyDown){circle(p1.x,p1.y-8,19,'#79294e');text('SENTINEL',p1.x-42,p1.y-32,11,'#ff93ba')}
 if(!has('crystal'))marker(p2.x,p2.y-15,'E: CORE');
 player(a.x,a.y-9);
 text('UNDERWORLD // FAULT-LINE DUNGEON',26,94,17);
 text('Approach sentinel and press SPACE. Recover the crystal.',26,121,13,'#b0bad7');
}
function fracture(){
 backdrop('#102537');for(let i=0;i<22;i++)circle((i*83+40)%1120,(i*71)%500+40,1+(i%3),'#67a9c9');
 for(const [x,y,w] of [[0,560,1120],[205,485,170],[455,410,180],[725,350,190]]){
  rect(x,y,w,18,'#32a3be');rect(x,y+18,w,65,'#19394e');
  for(let i=x;i<x+w;i+=30)line(i,y+23,i+15,y+44,'#4bbbd04d',2);
 }
 for(let i=0;i<7;i++){const x=405+i*41;line(x,561,x+15,540,'#f74f6d',4);line(x+15,540,x+28,561,'#f74f6d',4)}
 const a=p();if(!has('platform'))marker(822,318,'E: SHARD');
 rect(1030,482,62,79,'#153e59');rect(1041,495,39,65,'#5bd9e477');
 player(a.x,a.y-14,14);
 text('THE FRACTURE // HORIZONTAL REALITY',26,94,17);
 text('SPACE to jump. Reach the elevated shard.',26,121,13,'#a9d0e7');
}
function draw(){
 c.clearRect(0,0,W,H);
 if(s.zone==='frontier')frontier();else if(s.zone==='dead')dead();else if(s.zone==='underworld')underworld();else fracture();
 // Quiet corporate monitoring aesthetic: intentionally non-flashing.
 rect(0,0,W,50,'#040e19b5');text('L.E.N.Z. // EXPERIENCE CONTROL',23,31,15,'#79e3ec');
 text('SUBJECT 001      VITALS '+Math.ceil(s.health)+'      DATA '+shardCount()+'/4',685,31,13,'#d7e6f5');
 if(shardCount()===4){
  rect(260,530,630,57,'#031e2add');text('EXPERIMENT BREACHED // THE WORLD IS STILL HERE',285,564,17,'#77f3e9');
 }
}
document.querySelectorAll('[data-zone]').forEach(b=>b.addEventListener('click',()=>shift(b.dataset.zone)));
document.getElementById('action').addEventListener('click',action);
document.getElementById('interact').addEventListener('click',interact);
document.getElementById('shift').addEventListener('click',next);
document.getElementById('touchAction').addEventListener('click',action);
document.getElementById('touchInteract').addEventListener('click',interact);
document.getElementById('reset').addEventListener('click',()=>{if(confirm('Reset your local LENZ prototype save?')){s=defaults();enemy={x:860,y:355};save();hud();say('SUBJECT FILE REINITIALIZED')}}); 
window.addEventListener('keydown',e=>{
 const key=e.key.toLowerCase();
 if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key)&&!(e.target instanceof HTMLButtonElement))e.preventDefault();
 if(e.repeat)return;
 keys.add(key);
 if(key==='q')next();else if(key==='e')interact();else if(key===' ')action();
 else if(/^[1-4]$/.test(key))shift(IDS[Number(key)-1]);
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
document.querySelectorAll('[data-hold]').forEach(b=>{
 const key=b.dataset.hold;
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(key)});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(key));
});
let last=0;function frame(now){const dt=Math.min(.04,(now-last)/1000||0);last=now;update(dt,now);draw();requestAnimationFrame(frame)}
hud();say('WELCOME, SUBJECT 001 // YOU ARE BEING OBSERVED',5);requestAnimationFrame(frame);