import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 rayDirection,raySphere,floorTarget,scanFrontierReport,teleportOffset,TERMINAL
} from '../src/xr-play.js';
import {KEY,ROUTES} from '../src/xr-gates.js';

const yaw=y=>({x:0,y:Math.sin(y/2),z:0,w:Math.cos(y/2)});
const pitch=a=>({x:Math.sin(a/2),y:0,z:0,w:Math.cos(a/2)});
const xrSource=readFileSync(new URL('../src/xr.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../xr.html',import.meta.url),'utf8');

test('front-facing ray can hit Frontier evidence console without entering either portal',()=>{
 const origin={x:0,y:1.2,z:0};
 assert.ok(raySphere(origin,yaw(0),TERMINAL)!==null);
 assert.equal(raySphere(origin,yaw(1.2),TERMINAL),null);
 assert.equal(raySphere({x:20,y:1.2,z:0},yaw(0),TERMINAL),null);
 assert.equal(raySphere(origin,{x:NaN,y:0,z:0,w:1},TERMINAL),null);
});
test('floor targets support comfort teleport only for bounded, downward shots',()=>{
 const origin={x:0,y:1.65,z:0};
 assert.equal(floorTarget(origin,yaw(0)),null);
 // Positive X quaternion aims a forward ray upward, negative down.
 const point=floorTarget(origin,pitch(-.45));
 assert.ok(point,'downward ray should intersect ground');
 assert.ok(point.z<0&&point.z> -9);
 assert.equal(floorTarget(origin,pitch(-.04)),null,'shallow horizon cannot teleport a long distance');
 assert.equal(floorTarget({x:100,y:1.65,z:0},pitch(-.45)),null);
 assert.equal(floorTarget({x:0,y:1.65,z:-11.5},pitch(-.45)),null,'outside world bounds');
});
test('reference space offset calculates an in-bounds teleport without modifying head tracking',()=>{
 const current={x:0,y:1.7,z:-2};
 const target={x:1.5,z:-5};
 const offset=teleportOffset(current,target);
 assert.deepEqual(offset,{x:-1.5,y:0,z:3});
 assert.equal(teleportOffset(current,{x:100,z:-5}),null);
 assert.equal(teleportOffset(null,target),null);
});
test('VR Frontier terminal earns the existing Case 001 report once only',()=>{
 const old={zone:'frontier',health:82,flags:{record:false},portalCount:6,portalLog:['hospital-in'],
 positions:{frontier:{x:222,y:320}},visited:['frontier']};
 const got=scanFrontierReport(old);
 assert.equal(got.changed,true);
 assert.equal(got.state.flags.report,true);
 assert.equal(got.state.health,92);
 assert.equal(got.state.portalCount,6);
 assert.equal(got.state.positions.frontier.x,222);
 assert.equal(old.flags.report,undefined,'original save must stay unmodified');
 assert.equal(scanFrontierReport(got.state).changed,false);
 assert.equal(scanFrontierReport({...old,zone:'dead'}).changed,false,'wrong zone is not scanable');
});
test('full health scan is capped, while corrupt health is normalized',()=>{
 assert.equal(scanFrontierReport({zone:'frontier',flags:{},health:98}).state.health,100);
 assert.equal(scanFrontierReport({zone:'frontier',flags:{},health:'bad'}).state.health,100);
});
test('XR script contains all three controller ray actions with portal precedence',()=>{
 const gate=xrSource.indexOf('const which=targetGate(origin,orientation)');
 const terminal=xrSource.indexOf('raySphere(origin,orientation,TERMINAL)',gate);
 const floor=xrSource.indexOf('const floor=floorTarget(origin,orientation)');
 assert.ok(gate>0&&terminal>gate&&floor>terminal,'gate, clue, teleport precedence required');
 assert.match(xrSource,/referenceSpace=referenceSpace\.getOffsetReferenceSpace/);
 assert.match(xrSource,/new XRRigidTransform\(delta\)/);
 assert.match(xrSource,/scanFrontierReport/);
 assert.match(html,/id="scanTerminal"/);
 assert.ok(html.includes('floor'));
 assert.ok(Object.values(ROUTES).every(g=>g.length===2));
});
