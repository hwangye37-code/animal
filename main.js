import * as THREE from 'three';
import './style.css';
import { SAVE_KEY, FRUITS, NPCS, restore, collect, place, placementError, canStand } from './state.js';
import { createWorld, makeHouse, makeTree } from './world.js';
import { gameKey } from './input.js';

const $=s=>document.querySelector(s);
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3300);}
let state;
try{state=restore(localStorage.getItem(SAVE_KEY));}catch{state=restore(null);}
function save(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));$('#save-status').textContent='● 마을 저장됨';}
  catch{$('#save-status').textContent='○ 저장할 수 없음';toast('브라우저 저장이 차단되어 있어요. 이번 산책 동안만 유지돼요.');}
}
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}
catch{
  const error=document.createElement('div');error.className='fatal';error.innerHTML='<h2>3D 화면을 열 수 없어요.</h2><p>WebGL 2를 지원하는 브라우저에서 하드웨어 가속을 켠 뒤 새로고침해 주세요.</p>';document.body.append(error);
  throw new Error('WebGL 2 initialization failed');
}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
$('#scene').append(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.OrthographicCamera(-25,25,20,-20,.1,200);
const world=createWorld(scene),player=world.player;
let zoom=1,buildMode=false,buildType='tree',dialogueNpc=null,lineIndex=0,nearest=null;
const greeted=new Set(),keys=new Set(),target=new THREE.Vector3(),cameraOffset=new THREE.Vector3(23,29,34);
const forward=new THREE.Vector3(-cameraOffset.x,0,-cameraOffset.z).normalize();
const right=new THREE.Vector3(cameraOffset.z,0,-cameraOffset.x).normalize();
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),-.1),hit=new THREE.Vector3();
let pointerValid=false,ghost=null;

function resize(){
  const w=innerWidth,h=innerHeight,aspect=w/h;
  const half=aspect<1?23:20;
  camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.zoom=zoom;camera.updateProjectionMatrix();renderer.setSize(w,h);
}
addEventListener('resize',resize);resize();
function changeZoom(delta){zoom=THREE.MathUtils.clamp(zoom+delta,.7,1.8);resize();}
$('#zoom-in').onclick=()=>changeZoom(.12);$('#zoom-out').onclick=()=>changeZoom(-.12);
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();changeZoom(e.deltaY>0?-.06:.06);},{passive:false});

function addDecoration(o){const g=o.type==='house'?makeHouse(0x91a989):makeTree();g.position.set(o.x,.1,o.z);world.decorations.add(g);}
function releaseObject(root){root.traverse(o=>{if(o.isMesh)o.geometry.dispose();});}
function syncDecorations(){
  for(const g of [...world.decorations.children]){world.decorations.remove(g);releaseObject(g);}
  state.objects.forEach(addDecoration);$('#object-count').textContent=`${state.objects.length} / 40개`;
}
function updateStats(){
  const count=state.fruits.length;
  $('#fruit-count').textContent=`${count} / 12`;$('#fruit-progress').style.width=`${count/12*100}%`;
  $('#greet-count').textContent=`${greeted.size} / 3`;
  $('#quest-note').textContent=count===12&&greeted.size===3?'오늘의 작은 기쁨을 모두 찾았어요. 고마워요!':'작은 만남이 마을을 따뜻하게 해요.';
  for(const [id,g] of world.fruits)g.visible=!state.fruits.includes(id);
}
syncDecorations();updateStats();save();

function makeGhost(){
  if(ghost){scene.remove(ghost);ghost.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});}
  ghost=buildType==='tree'?makeTree():makeHouse();
  ghost.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.55;o.material.depthWrite=false;o.castShadow=false;}});
  ghost.visible=false;scene.add(ghost);
}
function setBuild(value){
  buildMode=value;$('#build-panel').hidden=!value;$('#decorate').classList.toggle('active',value);keys.clear();
  if(value){closeDialogue();makeGhost();toast('물건을 선택한 뒤, 빈 잔디 위를 눌러 주세요.');}
  else if(ghost)ghost.visible=false;
  renderer.domElement.style.cursor=value?'crosshair':'default';
}
$('#decorate').onclick=()=>setBuild(!buildMode);$('#close-build').onclick=()=>setBuild(false);
document.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{buildType=b.dataset.type;document.querySelectorAll('[data-type]').forEach(el=>el.classList.toggle('selected',el===b));makeGhost();});
$('#undo').onclick=()=>{if(!state.objects.length){toast('아직 배치한 물건이 없어요.');return;}state.objects.pop();syncDecorations();save();toast('마지막으로 놓은 물건을 되돌렸어요.');};
function updatePointer(e){
  const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(pointer,camera);pointerValid=!!raycaster.ray.intersectPlane(ground,hit);
  if(pointerValid){hit.x=Math.round(hit.x*2)/2;hit.z=Math.round(hit.z*2)/2;}
}
function buildError(){
  if(Math.hypot(player.position.x-hit.x,player.position.z-hit.z)<(buildType==='house'?3.2:1.3))return '내가 서 있는 곳은 비워 두어요.';
  return placementError(state,buildType,hit.x,hit.z);
}
renderer.domElement.addEventListener('pointermove',e=>{if(buildMode)updatePointer(e);});
renderer.domElement.addEventListener('pointerleave',()=>{pointerValid=false;if(ghost)ghost.visible=false;});
renderer.domElement.addEventListener('pointerdown',e=>{
  if(!buildMode || !$('#help-overlay').hidden)return;
  updatePointer(e);if(!pointerValid)return;
  const reason=buildError();if(reason){toast(reason);return;}
  const result=place(state,buildType,hit.x,hit.z);
  if(result.ok){addDecoration(state.objects.at(-1));$('#object-count').textContent=`${state.objects.length} / 40개`;save();toast(buildType==='tree'?'작은 숲이 한 뼘 자랐어요.':'새로운 집이 생겼어요!');}
});

function closeDialogue(){dialogueNpc=null;$('#dialogue').hidden=true;keys.clear();}
function showLine(){$('#npc-line').textContent=NPCS[dialogueNpc].lines[lineIndex];$('#next-line').innerHTML=lineIndex===2?'다음에 또 만나! <span>↵</span>':'계속 이야기하기 <span>↵</span>';}
function nextLine(){if(dialogueNpc===null)return;if(lineIndex>=2){closeDialogue();return;}lineIndex++;showLine();}
function interact(){
  if(!$('#help-overlay').hidden||buildMode)return;
  if(dialogueNpc!==null){nextLine();return;}
  if(!nearest){toast('주민이나 사과에 조금 더 가까이 가 보세요.');return;}
  if(nearest.kind==='npc'){
    dialogueNpc=nearest.index;lineIndex=0;keys.clear();greeted.add(dialogueNpc);$('#npc-name').textContent=NPCS[dialogueNpc].name;$('#dialogue').hidden=false;showLine();updateStats();
  }else if(collect(state,nearest.id)){
    save();updateStats();toast(state.fruits.length===12?'사과 열두 개를 모두 모았어요! 오늘도 풍성한 하루.':`사과를 주웠어요! (${state.fruits.length} / 12)`);
  }
}
$('#next-line').onclick=nextLine;$('#close-dialogue').onclick=closeDialogue;$('#interact-touch').onclick=interact;
function findNearest(){
  nearest=null;let best=2.25;
  NPCS.forEach((n,index)=>{const d=Math.hypot(player.position.x-n.x,player.position.z-n.z);if(d<best){nearest={kind:'npc',index};best=d;}});
  FRUITS.forEach(f=>{const d=Math.hypot(player.position.x-f.x,player.position.z-f.z);if(!state.fruits.includes(f.id)&&d<Math.min(best,1.65)){nearest={kind:'fruit',id:f.id};best=d;}});
  const visible=nearest&&!buildMode&&dialogueNpc===null&&$('#help-overlay').hidden;
  $('#prompt').hidden=!visible;$('#interact-touch').hidden=!visible;
  if(visible){const text=nearest.kind==='npc'?`${NPCS[nearest.index].name}에게 말 걸기`:'사과 줍기';$('#prompt span').textContent=text;$('#interact-touch').textContent=text;}
}
function openHelp(){setBuild(false);closeDialogue();keys.clear();$('#help-overlay').hidden=false;$('#close-help').focus();}
function closeHelp(){$('#help-overlay').hidden=true;$('#help').focus();}
$('#help').onclick=openHelp;$('#close-help').onclick=closeHelp;
$('#reset').onclick=()=>{
  if(!confirm('모은 사과와 배치한 물건을 모두 지우고 처음부터 시작할까요?'))return;
  state=restore(null);greeted.clear();syncDecorations();updateStats();player.position.set(0,.1,5);save();closeHelp();toast('새로운 산책이 시작됐어요.');
};
const movementKeys=['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright'];
addEventListener('keydown',e=>{
  const key=gameKey(e);
  if(key==='escape'){if(!$('#help-overlay').hidden)closeHelp();else if(dialogueNpc!==null)closeDialogue();else setBuild(false);return;}
  if(e.target instanceof HTMLElement && (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.target.isContentEditable))return;
  if(key==='enter'&&e.target instanceof HTMLElement&&e.target.tagName==='BUTTON')return;
  if(movementKeys.includes(key)){e.preventDefault();keys.add(key);}
  if(!e.repeat&&(key==='e'||key==='enter')){e.preventDefault();interact();}
});
addEventListener('keyup',e=>keys.delete(gameKey(e)));addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
document.querySelectorAll('[data-key]').forEach(b=>{
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.key));
});
// Keep focus inside the welcome dialog for keyboard users.
$('#help-overlay').addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const first=$('#close-help'),last=$('#reset');
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});

const clock=new THREE.Clock();let elapsed=0;
const move=new THREE.Vector3(),desired=new THREE.Vector3();
function animate(){
  const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;
  let moving=false;
  if(!buildMode&&dialogueNpc===null&&$('#help-overlay').hidden){
    const vertical=Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown'));
    const horizontal=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
    move.set(0,0,0).addScaledVector(forward,vertical).addScaledVector(right,horizontal);
    if(move.lengthSq()>0){
      move.normalize().multiplyScalar(dt*4.4);
      const x=player.position.x+move.x,z=player.position.z+move.z;
      if(canStand(x,player.position.z,state.objects))player.position.x=x;
      if(canStand(player.position.x,z,state.objects))player.position.z=z;
      const angle=Math.atan2(move.x,move.z),diff=Math.atan2(Math.sin(angle-player.rotation.y),Math.cos(angle-player.rotation.y));player.rotation.y+=diff*Math.min(dt*14,1);moving=true;
    }
  }
  player.userData.body.position.y=moving?Math.abs(Math.sin(elapsed*13))*.08:Math.sin(elapsed*2)*.015;
  player.userData.leg1.rotation.x=moving?Math.sin(elapsed*13)*.45:0;player.userData.leg2.rotation.x=-player.userData.leg1.rotation.x;
  world.npcs.forEach((npc,i)=>{
    npc.userData.body.position.y=Math.sin(elapsed*1.7+i)*.04;
    if(dialogueNpc===i)npc.rotation.y=Math.atan2(player.position.x-npc.position.x,player.position.z-npc.position.z);
  });
  world.waves.forEach((w,i)=>{w.position.y=-1.035+Math.sin(elapsed*.9+i)*.015;w.scale.setScalar(1+Math.sin(elapsed*.6+i)*.1);});
  world.clouds.forEach((c,i)=>{c.position.x+=Math.sin(elapsed*.13+i)*dt*.08;});
  world.fruits.forEach((g,id)=>{g.position.y=.1+Math.sin(elapsed*2+Number(id.split('-')[1]))*.055;});
  desired.set(player.position.x*.42,0,player.position.z*.35-1);
  target.lerp(desired,1-Math.exp(-dt*2));camera.position.copy(target).add(cameraOffset);camera.lookAt(target);
  if(buildMode&&ghost){ghost.visible=pointerValid;if(pointerValid){ghost.position.set(hit.x,.1,hit.z);const color=buildError()?0xd68069:0x74b589;ghost.traverse(o=>{if(o.isMesh)o.material.color.setHex(color);});}}
  findNearest();renderer.render(scene,camera);
}
renderer.setAnimationLoop(animate);
setTimeout(()=>toast('초록섬에 오신 걸 환영해요. WASD로 산책을 시작해 보세요.'),700);
