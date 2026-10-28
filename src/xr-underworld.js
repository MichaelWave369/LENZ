// LENZ v0.7: a deliberate, accessible aim-and-pulse sentinel encounter.
// Pure combat transitions share the 2D game's enemyDown, crystal and health fields.
// The three conduits must be disabled in the sequence center → left → right.
import {currentZone} from './xr-gates.js';

export const CONDUITS=[
 {id:'left',x:-.78,y:1.14,z:-6.35,radius:.28},
 {id:'center',x:0,y:1.77,z:-6.47,radius:.29},
 {id:'right',x:.78,y:1.14,z:-6.35,radius:.28}
];
export const CORE={x:0,y:.79,z:-8.15,radius:.48};
export const PULSE_ORDER=[1,0,2];
const isObject=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const safeFlags=state=>isObject(state?.flags)?state.flags:{};
export function phaseOf(state){
 if(state?.enemyDown===true)return 3;
 const n=state?.sentinelPhase;
 // A phase-3 save without enemyDown is inconsistent: permit the final pulse to repair it.
 return Number.isInteger(n)&&n>=0&&n<=2?n:0;
}
export function activeConduit(state){
 const phase=phaseOf(state);
 return phase>=3?-1:PULSE_ORDER[phase];
}
export function pulseConduit(state,conduitIndex){
 if(!isObject(state))return {state,changed:false,reason:'INVALID SAVE STATE'};
 if(currentZone(state)!=='underworld')return {state,changed:false,reason:'UNDERWORLD ONLY // ENTER THE FAULT-LINE DUNGEON'};
 if(state.enemyDown===true||phaseOf(state)>=3)return {state,changed:false,reason:'SENTINEL ALREADY DEFEATED'};
 if(safeFlags(state).record!==true)return {state,changed:false,reason:'SENTINEL IMMUNE // FIND MEDICAL COUNTERCODE IN DEAD SECTOR'};
 if(!Number.isInteger(conduitIndex)||conduitIndex<0||conduitIndex>=CONDUITS.length)return {state,changed:false,reason:'NO VALID SENTINEL TARGET'};
 const expected=activeConduit(state);
 if(conduitIndex!==expected){
  // A missed tactical choice has a small, capped consequence, with no screen flash.
  const health=Number.isFinite(state.health)?Math.max(1,Math.min(100,state.health)-4):96;
  return {state:{...state,health},changed:true,reason:'SHIELD COUNTERATTACK // -4 VITALS · TARGET ACTIVE CONDUIT '+(expected+1)};
 }
 const next=phaseOf(state)+1;
 return {
  state:{...state,sentinelPhase:next,enemyDown:next===3},
  changed:true,
  reason:next===3?'SENTINEL DISABLED // DUNGEON CORE NOW EXPOSED':'SHIELD CONDUIT DISABLED '+next+'/3 · NEXT TARGET '+(PULSE_ORDER[next]+1)
 };
}
export function recoverDungeonCore(state){
 if(!isObject(state))return {state,changed:false,reason:'INVALID SAVE STATE'};
 if(currentZone(state)!=='underworld')return {state,changed:false,reason:'UNDERWORLD ONLY'};
 const flags=safeFlags(state);
 if(flags.crystal===true)return {state,changed:false,reason:'DUNGEON CORE ALREADY RECOVERED'};
 if(state.enemyDown!==true)return {state,changed:false,reason:'CORE SHIELDED // DEFEAT THE SENTINEL FIRST'};
 const health=Number.isFinite(state.health)?Math.min(100,Math.max(1,state.health)+10):100;
 return {state:{...state,flags:{...flags,crystal:true},health},changed:true,reason:'STABILIZER CORE RECOVERED // FRACTURE PLATFORM RESTORED'};
}
