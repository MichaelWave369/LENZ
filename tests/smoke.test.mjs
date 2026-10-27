import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root=['index.html','xr.html','src/game.js','src/xr.js','docs/GAME_BIBLE.md','LICENSE'];

test('all release files exist',()=>{
 for(const f of root)assert.ok(existsSync(new URL('../'+f,import.meta.url)),f+' missing');
});
test('entrypoint links and controls are wired',()=>{
 const html=read('index.html');
 assert.match(html,/src\/game\.js/);
 assert.match(html,/href="xr\.html"/);
 for(const id of ['game','action','interact','shift','reset','health','shards','visited'])assert.match(html,new RegExp('id="'+id+'"'));
 for(const id of ['frontier','dead','underworld','fracture'])assert.match(html,new RegExp('data-zone="'+id+'"'));
});
test('game defines different mechanics and persistent progress',()=>{
 const code=read('src/game.js');
 for(const key of ['localStorage.setItem','requestAnimationFrame','function frontier','function dead','function underworld','function fracture','function damage','function interact'])assert.ok(code.includes(key),key+' missing');
 assert.match(code,/shardCount\(\)/);
});
test('XR implementation requests immersive session and tracked views',()=>{
 const html=read('xr.html'),code=read('src/xr.js');
 assert.match(html,/src\/xr\.js/);
 assert.ok(code.includes("requestSession('immersive-vr'"));
 assert.ok(code.includes("requestReferenceSpace('local-floor'"));
 assert.ok(code.includes('getViewerPose('));
 assert.ok(code.includes("addEventListener('select',changeZone)"));
});
test('no remote scripts or external library dependency',()=>{
 for(const f of ['index.html','xr.html']){
  assert.doesNotMatch(read(f),/<script[^>]+src=["']https?:/i);
  assert.doesNotMatch(read(f),/<link[^>]+href=["']https?:\/\/[^"']+\.css/i);
 }
});
