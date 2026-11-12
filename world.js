import * as THREE from 'three';
import { HOMES, NPCS, TREE_POSITIONS, FRUITS } from './state.js';

const materials = new Map();
function material(color) {
  if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({color,roughness:0.93}));
  return materials.get(color);
}
function mesh(geometry,color,parent,x=0,y=0,z=0) {
  const m=new THREE.Mesh(geometry,material(color)); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
function ball(parent,color,x,y,z,r=1,sx=1,sy=1,sz=1) { const m=mesh(new THREE.SphereGeometry(r,10,7),color,parent,x,y,z);m.scale.set(sx,sy,sz);return m; }
function box(parent,color,x,y,z,w,h,d) { return mesh(new THREE.BoxGeometry(w,h,d),color,parent,x,y,z); }
function cylinder(parent,color,x,y,z,rt,rb,h,segments=12) { return mesh(new THREE.CylinderGeometry(rt,rb,h,segments),color,parent,x,y,z); }
export function makeTree() {
  const g=new THREE.Group();
  cylinder(g,0x936948,0,1,0,.21,.31,2.1,7);
  ball(g,0x719959,0,2.7,0,1.3,1,1.12,1);
  ball(g,0x83a65e,-.65,2.4,.2,.85); ball(g,0x91ad69,.65,2.7,.1,.78);
  for(const [x,y,z] of [[-.7,2.9,.85],[.8,2.3,.7],[.3,3.35,.68]]){ball(g,0xdd7056,x,y,z,.17);}
  return g;
}
export function makeHouse(color=0x9aa987) {
  const g=new THREE.Group();
  box(g,0xece2c3,0,1.05,0,3.4,2.1,2.8);
  box(g,0xb6a885,0,.12,0,3.7,.24,3.1);
  // A triangular roof ridge, built from an original prism.
  const shape=new THREE.Shape();shape.moveTo(-2,0);shape.lineTo(0,1.65);shape.lineTo(2,0);shape.closePath();
  const roof=mesh(new THREE.ExtrudeGeometry(shape,{depth:3.3,bevelEnabled:false}),color,g,0,2,-1.65);
  roof.castShadow=true;
  box(g,0x98744e,0,.86,1.416,.75,1.48,.09);
  ball(g,0xdac77d,.23,.85,1.5,.055);
  for(const x of [-1.05,1.05]) {
    box(g,0xfaf0d5,x,1.2,1.43,.75,.85,.08);
    box(g,0x82b9bd,x,1.2,1.48,.55,.65,.03);
    box(g,0xfaf0d5,x,1.2,1.51,.055,.7,.035);
    box(g,0xfaf0d5,x,1.2,1.51,.6,.055,.035);
    box(g,0xad8461,x,.66,1.55,.85,.16,.36);
    for(let i=0;i<3;i++)ball(g,[0xe29b88,0xe7c670,0x94a66d][i],x-.24+i*.24,.81,1.56,.12);
  }
  box(g,0xeee5cc,1,2.65,-.6,.45,1,.5);
  box(g,0xa29b85,1,3.16,-.6,.56,.15,.6);
  box(g,0xc2b396,0,.13,1.8,1.15,.24,.65);
  return g;
}
export function makeCharacter({color=0xf3cba7,shirt=0x789984,species='player'}={}) {
  const g=new THREE.Group(), body=new THREE.Group();g.add(body);
  const leg1=box(body,0x856647,-.18,.28,0,.24,.48,.3);
  const leg2=box(body,0x856647,.18,.28,0,.24,.48,.3);
  ball(body,shirt,0,.9,0,.6,.88,1.12,.7);
  ball(body,color,0,1.65,.025,.58,1,1,.88);
  for(const x of [-.21,.21]) {
    ball(body,0x394239,x,1.72,.51,.055,1,1.25,.5);
    ball(body,0xe5a08b,x*1.6,1.54,.46,.09,1,.5,.2);
  }
  ball(body,0x795943,0,1.54,.56,.06,1,.7,.6);
  ball(body,shirt,-.52,.94,0,.22,.7,1.7,.7);ball(body,shirt,.52,.94,0,.22,.7,1.7,.7);
  if(species==='토끼') for(const x of [-.3,.3]) {ball(body,color,x,2.3,0,.25,.65,2,.65);ball(body,0xe6aa9b,x,2.33,.14,.17,.6,2,.25);}
  else if(species==='곰') for(const x of [-.46,.46]) {ball(body,color,x,2.05,0,.27);ball(body,0xdcb699,x,2.07,.2,.14);}
  else if(species==='고양이') for(const x of [-.4,.4]){const e=cylinder(body,color,x,2.1,0,0,.27,.6,3);e.rotation.y=Math.PI/6;}
  else {
    ball(body,0x68523c,0,1.95,-.04,.59,1,.68,.9);
    cylinder(body,0xe2b76e,0,2.08,0,.65,.65,.12,16);
    cylinder(body,0xefd09a,0,2.26,0,.35,.4,.3,14);
    cylinder(body,0x839d72,0,2.14,0,.405,.405,.08,14);
  }
  g.userData={body,leg1,leg2};return g;
}
function label(text) {
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=96;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fffbef';ctx.beginPath();ctx.roundRect(8,8,240,68,30);ctx.fill();
  ctx.fillStyle='#53694c';ctx.textAlign='center';ctx.font='500 30px sans-serif';ctx.fillText(text,128,53);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));sprite.scale.set(2.5,.94,1);sprite.position.y=3.2;return sprite;
}
export function createWorld(scene) {
  scene.background=new THREE.Color(0xb9deda);
  scene.fog=new THREE.Fog(0xb9deda,65,130);
  scene.add(new THREE.HemisphereLight(0xfff7df,0x7a9c87,2.5));
  const sun=new THREE.DirectionalLight(0xffefce,3.1);sun.position.set(-14,28,15);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:1,far:70});sun.shadow.bias=-.0006;sun.shadow.normalBias=.035;scene.add(sun);
  const water=mesh(new THREE.PlaneGeometry(300,300),0x98cbc8,scene,0,-1.1,0);water.rotation.x=-Math.PI/2;water.castShadow=false;
  const island=new THREE.Group();scene.add(island);
  const sand=cylinder(island,0xe7d9ae,0,-.5,0,1,1,.9,80);sand.scale.set(18.3,1,16.3);
  const grass=cylinder(island,0xa9bb79,0,-.08,0,1,1,.24,80);grass.scale.set(17,1,15);
  const grassTop=cylinder(island,0xb5c58a,0,.045,0,1,1,.025,80);grassTop.scale.set(16.7,1,14.7);
  // Sand paths and a little central gathering place.
  box(island,0xded1a5,0,.071,0,3,.035,26);
  box(island,0xded1a5,0,.072,0,21,.035,2.1);
  cylinder(island,0xe4d7b3,0,.09,0,3.2,3.2,.05,40);
  for(const h of HOMES) {
    const home=makeHouse(h.color);home.position.set(h.x,.08,h.z);island.add(home);
    box(island,0xded1a5,h.x,.075,h.z+3.2,1.2,.035,3.3);
    // Mailbox.
    cylinder(island,0x9b8058,h.x+2.1,.6,h.z+1.4,.06,.08,1.1,6);
    box(island,0x6b8b78,h.x+2.1,1.2,h.z+1.4,.6,.4,.45);
    box(island,0xf1e7c7,h.x+2.1,1.2,h.z+1.64,.34,.045,.02);
  }
  TREE_POSITIONS.forEach(([x,z],i)=>{const t=makeTree();t.position.set(x,.08,z);t.rotation.y=i*.8;island.add(t);});
  const npcs=NPCS.map(n=>{const c=makeCharacter(n);c.position.set(n.x,.08,n.z);c.rotation.y=.25;c.add(label(n.name));island.add(c);return c;});
  const fruits=new Map();
  FRUITS.forEach(f=>{const g=new THREE.Group();ball(g,0xd77351,0,.27,0,.23,1,.9,1);cylinder(g,0x80613e,0,.49,0,.025,.025,.14,5);const leaf=ball(g,0x759b56,.09,.49,0,.1,1,.3,.6);leaf.rotation.z=.4;g.position.set(f.x,.08,f.z);island.add(g);fruits.set(f.id,g);});
  // Low fences, a seaside bench, and a wooden dock.
  for(const start of [-11,4]) {
    for(let i=0;i<6;i++){const x=start+i*.7;box(island,0xf0e4c3,x,.55,-3.7,.12,.95,.12);}
    box(island,0xf0e4c3,start+1.75,.69,-3.7,3.7,.12,.1);box(island,0xf0e4c3,start+1.75,.35,-3.7,3.7,.12,.1);
  }
  const bench=new THREE.Group();box(bench,0x9a7955,0,.6,0,2.4,.17,.7);box(bench,0xa78960,0,1.15,-.35,2.4,.65,.13);
  for(const x of [-.9,.9])box(bench,0x647966,x,.3,0,.12,.6,.5);bench.position.set(5,.1,7.5);bench.rotation.y=-.35;island.add(bench);
  for(let i=0;i<10;i++)box(island,0xba9c71,.02,-.08,13.4+i*.4,2,.16,.32);
  for(const x of [-1.05,1.05])for(const z of [13.5,15,16.9])cylinder(island,0x967450,x,.22,z,.09,.11,1.1,7);
  // A welcome sign facing the camera.
  const sign=new THREE.Group();for(const x of [-.6,.6])box(sign,0x9a8059,x,.7,0,.12,1.4,.12);
  box(sign,0xc3a275,0,1.2,0,1.8,.75,.12);const signLabel=label('초록섬');signLabel.position.set(0,1.2,.1);signLabel.scale.set(1.6,.6,1);sign.add(signLabel);sign.position.set(2.6,0,9);island.add(sign);
  // Deterministic meadow details.
  let seed=51;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  for(let i=0;i<165;i++){
    const x=(random()-.5)*31,z=(random()-.5)*27;
    if(x*x/240+z*z/182>1 || Math.abs(x)<2 || Math.abs(z)<1.6 || HOMES.some(h=>Math.hypot(x-h.x,z-h.z)<3))continue;
    if(i%3===0){const stem=cylinder(island,0x7b9a58,x,.22,z,.025,.03,.3,4);stem.castShadow=false;const color=[0xf1db98,0xe8a294,0xf5f0cf][i%3+Math.floor(random()*3)%3];ball(island,color??0xf6e6ac,x,.4,z,.11,1,.7,1);}
    else {const blade=mesh(new THREE.ConeGeometry(.09,.3,3),0x92ac6e,island,x,.2,z);blade.castShadow=false;}
  }
  for(const [x,z] of [[-14,5],[14,1],[-10,11],[11,9]]){const rock=ball(island,0xa3aaa0,x,.3,z,.7,1,.65,.8);rock.rotation.y=x;}
  const waves=[];
  for(let i=0;i<33;i++) {
    const angle=i*.77,r=21+(i%5)*3;
    const w=mesh(new THREE.TorusGeometry(.7+(i%3)*.3,.025,3,20,Math.PI*.6),0xd4e8d8,scene,Math.cos(angle)*r,-1.05,Math.sin(angle)*r*.85);
    w.rotation.x=-Math.PI/2;w.rotation.z=angle;w.castShadow=false;waves.push(w);
  }
  const clouds=[];
  for(const [x,z,s] of [[-23,-15,1.3],[21,-19,1],[-27,10,.9],[28,15,1.4]]) {
    const cloud=new THREE.Group();for(let i=0;i<4;i++) {const m=ball(cloud,0xf3f4df,(i-1.5)*1.1,Math.sin(i)*.3,0,1.15,1.2,.48,.8);m.castShadow=false;}
    cloud.position.set(x,7,z);cloud.scale.setScalar(s);scene.add(cloud);clouds.push(cloud);
  }
  const decorations=new THREE.Group();island.add(decorations);
  const player=makeCharacter();player.position.set(0,.1,5);island.add(player);
  return {island,water,npcs,fruits,player,decorations,waves,clouds};
}
