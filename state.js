export const SAVE_KEY = 'chorok-island-v1';
export const FRUIT_COUNT = 12;
export const HOMES = [
  { x: -7, z: -6, color: 0xd8795f, name: '모모의 집' },
  { x: 7, z: -7, color: 0x769cbd, name: '보리의 집' },
  { x: -8, z: 5, color: 0xe7b555, name: '두리의 집' },
];
export const NPCS = [
  { x: -4, z: -2, name: '모모', species: '토끼', color: 0xf2c7ad, shirt: 0xdf887e, lines: ['어서 와! 여긴 바람도 천천히 부는 초록섬이야.', '나무 아래 빨간 사과를 발견하면 E를 눌러 봐. 열두 개를 모두 찾아볼래?', '마을 꾸미기를 누르면 네가 원하는 곳에 나무와 집을 놓을 수 있어.'] },
  { x: 5, z: -3, name: '보리', species: '곰', color: 0xc39972, shirt: 0x79a3b2, lines: ['안녕! 나는 보리. 오늘은 산책하기 딱 좋은 날이지?', '집은 길에서 조금 떨어진 잔디 위에 놓으면 예뻐.', '이 섬에서 가장 좋아하는 장소를 찾아봐. 난 바다가 보이는 벤치가 좋아.'] },
  { x: -4, z: 6, name: '두리', species: '고양이', color: 0xe7bb65, shirt: 0x94aa75, lines: ['반가워! 나는 꽃을 가꾸는 두리야.', '주민 세 명 모두에게 인사하고 사과도 모아 봐!', '마을은 이 브라우저에 자동으로 저장돼. 다음에 다시 만나자!'] },
];
export const TREE_POSITIONS = [[-12,-9],[-11,-2],[-12,9],[-5,-11],[0,-12],[5,-12],[12,-10],[12,-3],[13,5],[8,11],[0,12],[-6,11]];
export const FRUITS = TREE_POSITIONS.map(([x,z], i) => ({id:`fruit-${i}`,x:x+0.9,z:z+1.4}));
export function initialState() { return { version: 1, fruits: [], objects: [] }; }
export function inside(x,z,margin=0) { return Number.isFinite(x) && Number.isFinite(z) && x*x/((17-margin)**2)+z*z/((15-margin)**2)<1; }
const distance = (a,b,x,z) => Math.hypot(a-x,b-z);
export function canStand(x,z,objects=[]) {
  if (!inside(x,z,0.7)) return false;
  if (HOMES.some(h=>Math.abs(h.x-x)<2.15 && Math.abs(h.z-z)<1.9)) return false;
  if (TREE_POSITIONS.some(([a,b])=>distance(a,b,x,z)<0.65)) return false;
  return !objects.some(o=>distance(o.x,o.z,x,z)<(o.type==='house'?2.3:0.75));
}
export function collect(state,id) {
  if (!FRUITS.some(f=>f.id===id) || state.fruits.includes(id)) return false;
  state.fruits.push(id); return true;
}
export function placementError(state,type,x,z) {
  if (!['tree','house'].includes(type)) return '배치할 물건을 선택해 주세요.';
  if (state.objects.length>=40) return '마을에는 최대 40개까지 꾸밀 수 있어요.';
  const r=type==='house'?2.8:1.2;
  if (!inside(x,z,r+0.6)) return '섬 안쪽 잔디에 놓아 주세요.';
  if (Math.abs(x)<2+r || (Math.abs(z)<1.2+r && Math.abs(x)<10)) return '산책로는 비워 두어요.';
  if (HOMES.some(h=>distance(h.x,h.z,x,z)<r+2.7) ||
      TREE_POSITIONS.some(([a,b])=>distance(a,b,x,z)<r+1) ||
      NPCS.some(n=>distance(n.x,n.z,x,z)<r+1.3) ||
      FRUITS.some(f=>distance(f.x,f.z,x,z)<r+0.7) ||
      state.objects.some(o=>distance(o.x,o.z,x,z)<r+(o.type==='house'?2.8:1.2))) return '다른 물건과 조금 떨어뜨려 주세요.';
  return '';
}
export function place(state,type,x,z) {
  const reason=placementError(state,type,x,z);
  if (reason) return {ok:false,reason};
  state.objects.push({type,x,z}); return {ok:true};
}
export function restore(raw) {
  const state=initialState();
  try {
    const data=JSON.parse(raw);
    if(data?.version!==1 || !Array.isArray(data.fruits) || !Array.isArray(data.objects)) return state;
    for(const id of data.fruits) collect(state,id);
    for(const o of data.objects.slice(0,40)) if(o && typeof o==='object') place(state,o.type,o.x,o.z);
  } catch { /* A broken save starts a fresh village. */ }
  return state;
}
