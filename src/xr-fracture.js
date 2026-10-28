// LENZ v0.8: Fracture VR stabilizer puzzle and shared Case 001 coordinates.
// All operations are pure; render/click handlers commit only validated transitions.
import {currentZone} from './xr-gates.js';

// Kept within the central viewing gap of the existing VR portal archways.
// Nodes are staggered vertically to make ray targets individually selectable.
export const ANCHORS=[
 {id:'left',x:-.9,y:.85,z:-6.7,radius:.30},
 {id:'center',x:0,y:1.72,z:-7.15,radius:.31},
 {id:'right',x:.9,y:2.18,z:-6.85,radius:.30}
];
export const COORDINATES={x:0,y:.91,z:-8.95,radius:.47};
export const STABILIZATION_ORDER=[0,2,1];
const isObject=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const flagsOf=s=>isObject(s?.flags)?s.flags:{};
export function fracturePhase(state){
 if(flagsOf(state).platform===true)return 3;
 const p=state?.fracturePhase;
 // Phase 3 means all anchors are stable, even if the coordinates are not yet claimed.
 return Number.isInteger(p)&&p>=0&&p<=3?p:0;
}
export function activeAnchor(state){
 const p=fracturePhase(state);
 return p===3?-1:STABILIZATION_ORDER[p];
}
export function stabilizeAnchor(state,index){
 if(!isObject(state))return {state,changed:false,reason:'INVALID SAVE STATE'};
 if(currentZone(state)!=='fracture')return {state,changed:false,reason:'THE FRACTURE ONLY'};
 const flags=flagsOf(state);
 if(flags.platform===true)return {state,changed:false,reason:'REALITY PATH ALREADY STABILIZED'};
 if(flags.crystal!==true)return {state,changed:false,reason:'NO POWER // RECOVER UNDERWORLD STABILIZER CORE'};
 if(fracturePhase(state)===3)return {state,changed:false,reason:'ALL ANCHORS RESTORED // RETRIEVE VAULT COORDINATES'};
 if(!Number.isInteger(index)||index<0||index>=ANCHORS.length)
  return {state,changed:false,reason:'INVALID ANCHOR TARGET'};
 const expected=activeAnchor(state);
 if(index!==expected)return {state,changed:false,reason:'ANCHOR OUT OF SEQUENCE // FOLLOW THE GOLDEN SIGNAL'};
 const phase=fracturePhase(state)+1;
 return {
  state:{...state,fracturePhase:phase},
  changed:true,
  reason:phase===3?'STABILITY GRID ONLINE // COORDINATES NOW ACCESSIBLE':'REALITY ANCHOR '+phase+'/3 RESTORED'
 };
}
export function collectVaultCoordinates(state){
 if(!isObject(state))return {state,changed:false,reason:'INVALID SAVE STATE'};
 if(currentZone(state)!=='fracture')return {state,changed:false,reason:'THE FRACTURE ONLY'};
 const flags=flagsOf(state);
 if(flags.platform===true)return {state,changed:false,reason:'VAULT COORDINATES ALREADY RECOVERED'};
 if(flags.crystal!==true)return {state,changed:false,reason:'COORDINATES OFFLINE // UNDERWORLD CORE REQUIRED'};
 if(fracturePhase(state)!==3)return {state,changed:false,reason:'COORDINATES SHIELDED // RESTORE ALL THREE ANCHORS'};
 const health=Number.isFinite(state.health)?Math.min(100,Math.max(1,state.health)+10):100;
 return {
  state:{...state,fracturePhase:3,flags:{...flags,platform:true},health},
  changed:true,
  reason:'VAULT COORDINATES RECOVERED // FRONTIER CORPORATE VAULT UNLOCKED'
 };
}
