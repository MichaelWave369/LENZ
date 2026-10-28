// LENZ v0.9: final two-step XR corporate vault sequence.
// The decoder and sealed vault are separate physical targets in Frontier.
// Legacy and 2D completion remain authoritative, and no unrelated flags are reset.
import {currentZone} from './xr-gates.js';
export const VAULT_DECODER={x:1.12,y:1.20,z:-8.40,radius:.49};
export const VAULT_DOOR={x:-1.02,y:1.34,z:-9.72,radius:.77};
export const REQUIRED_CLUES=['report','record','crystal','platform'];
export const DIRECTIVE='THE SUBJECT IS THE PRODUCT';
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const flags=s=>object(s?.flags)?s.flags:{};
export function clueCount(s){return REQUIRED_CLUES.filter(k=>flags(s)[k]===true).length}
export function vaultUnlocked(s){return flags(s).vaultAccess===true||flags(s).vault===true}
export function decodeVault(state){
 if(!object(state))return {state,changed:false,reason:'INVALID SAVE STATE'};
 if(currentZone(state)!=='frontier')return {state,changed:false,reason:'RETURN TO FRONTIER TO ACCESS THE CORPORATE VAULT'};
 const f=flags(state);
 if(f.vault===true)return {state,changed:false,reason:'CASE 001 COMPLETE // THE DIRECTIVE HAS BEEN RECOVERED'};
 if(vaultUnlocked(state))return {state,changed:false,reason:'VAULT SECURITY ALREADY BYPASSED // OPEN THE SEALED DOOR'};
 const count=clueCount(state);
 if(count<4)return {state,changed:false,reason:'SECURITY DENIED // '+count+'/4 EXPERIENCE ZONE CLUES RECOVERED'};
 return {state:{...state,flags:{...f,vaultAccess:true}},changed:true,
  reason:'FOUR-PART CIPHER ACCEPTED // VAULT DOOR UNSEALED'};
}
export function openVault(state){
 if(!object(state))return {state,changed:false,reason:'INVALID SAVE STATE'};
 if(currentZone(state)!=='frontier')return {state,changed:false,reason:'THE CORPORATE VAULT IS IN FRONTIER'};
 const f=flags(state);
 if(f.vault===true)return {state,changed:false,reason:'CASE 001 COMPLETE // '+DIRECTIVE};
 if(!vaultUnlocked(state))return {state,changed:false,reason:'VAULT LOCKED // DECODE THE FOUR-PART CIPHER FIRST'};
 if(clueCount(state)!==4)return {state,changed:false,reason:'VAULT SECURITY DENIED // COMPLETE ALL FOUR EXPERIENCE ZONES'};
 return {state:{...state,flags:{...f,vaultAccess:true,vault:true}},changed:true,
  reason:'CASE 001 COMPLETE // '+DIRECTIVE};
}
