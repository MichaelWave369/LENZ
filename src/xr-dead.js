// LENZ v0.6 — the first two-step 3D Case 001 puzzle.
// Pure state transitions are used by both controller targeting and desktop fallback.
import {currentZone} from './xr-gates.js';
export const DEAD_BREAKER={x:.78,y:1.13,z:-5.35,radius:.51};
export const DEAD_ARCHIVE={x:-.86,y:1.23,z:-6.45,radius:.59};
const valid=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const flagsOf=s=>valid(s?.flags)?s.flags:{};
export function deadPowerOnline(state){
 const flags=flagsOf(state);
 return flags.deadPower===true||flags.record===true;
}
export function restoreDeadPower(state){
 if(!valid(state))return {state,changed:false,reason:'INVALID SAVE'};
 if(currentZone(state)!=='dead')return {state,changed:false,reason:'WRONG EXPERIENCE ZONE'};
 const flags=flagsOf(state);
 if(!flags.report)return {state,changed:false,reason:'BREAKER KEY MISSING // SCAN FRONTIER FIRST'};
 if(deadPowerOnline(state))return {state,changed:false,reason:'HOSPITAL POWER ALREADY RESTORED'};
 return {state:{...state,flags:{...flags,deadPower:true}},changed:true,reason:'HOSPITAL POWER ONLINE // MEDICAL ARCHIVE ACCESSIBLE'};
}
export function retrieveMedicalArchive(state){
 if(!valid(state))return {state,changed:false,reason:'INVALID SAVE'};
 if(currentZone(state)!=='dead')return {state,changed:false,reason:'WRONG EXPERIENCE ZONE'};
 const flags=flagsOf(state);
 if(flags.record===true)return {state,changed:false,reason:'MEDICAL FILE ALREADY RECOVERED'};
 if(flags.report!==true)return {state,changed:false,reason:'ACCESS DENIED // FRONTIER CODE REQUIRED'};
 if(!deadPowerOnline(state))return {state,changed:false,reason:'ARCHIVE OFFLINE // ACTIVATE THE RED POWER BREAKER'};
 const health=Number.isFinite(state.health)?Math.min(100,Math.max(1,state.health)+10):100;
 return {state:{...state,zone:'dead',health,flags:{...flags,deadPower:true,record:true}},changed:true,reason:'MEDICAL FILE RECOVERED // SENTINEL COUNTERCODE DISCOVERED'};
}
