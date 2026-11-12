# 초록섬 · Chorok Island

**오늘은, 조금 느긋하게.** 동물 주민들과 인사하고, 사과를 모으고, 나만의 마을을 꾸미는 브라우저 3D 게임입니다.

동물의 숲의 편안한 마을 생활에서 영감을 받았습니다. 닌텐도와 관계없는 독립 프로젝트이며 캐릭터·건물·지형은 코드로 직접 만든 기본 도형입니다. 원작 캐릭터, 이미지, 음악은 사용하지 않습니다.

![초록섬 3D 마을 미리보기](docs/preview.png)

## 들어 있는 기능

- 바다, 나무, 꽃, 집, 선착장으로 구성한 파스텔 3D 섬
- 밀짚모자 캐릭터 이동과 부드러운 추적 카메라
- 토끼 모모, 곰 보리, 고양이 두리와 대화
- 사과 12개 수집과 오늘의 목표 표시
- 나무·집 배치 미리보기, 겹침 방지, 마지막 배치 취소 (최대 40개)
- 수집한 사과·배치한 물건 자동 저장 및 마을 초기화
- 화면 확대·축소와 모바일 방향 버튼

첫 버전은 **혼자 탐험하는 마을**입니다. 실시간 다중 접속, 계정, 온라인 채팅, 집 내부, 아이템 거래는 포함하지 않습니다. 이웃 인사 목표는 페이지를 새로 열면 초기화됩니다.

## 내 컴퓨터에서 실행하기

Node.js 22.12 이상을 설치한 뒤 이 폴더에서 실행하세요.

```sh
npm install
npm run dev
```

터미널에 표시되는 로컬 주소(기본 `http://127.0.0.1:5173/`)를 브라우저에서 여세요. `index.html`을 더블클릭하는 방식으로 실행하지 마세요.

이미 설치된 환경에서는 `npm ci`로 잠금 파일과 동일한 의존성을 설치할 수 있습니다. 3D 화면에는 WebGL 2와 하드웨어 가속이 필요합니다. 글꼴을 불러올 수 없을 때는 기기에 있는 기본 글꼴로 표시됩니다.

## 조작 방법

| 조작 | 기능 |
| --- | --- |
| WASD / 방향키 | 화면 방향에 맞춰 이동 |
| E | 가까운 주민과 대화 / 바닥의 사과 줍기 |
| Enter | 대화 이어 가기 |
| ＋ / − / 마우스 휠 | 확대 / 축소 |
| 마을 꾸미기 | 나무·집 선택 후 빈 잔디 클릭 |
| Esc | 대화 / 꾸미기 / 도움말 닫기 |
| ? | 도움말 및 마을 초기화 |
| 모바일 방향 버튼 | 터치 이동 |

꾸미기 미리보기가 초록색이면 배치할 수 있습니다. 길, 바다, 다른 물건, 주민, 수집할 사과, 플레이어 주변은 비워 두어야 합니다. 오른쪽 아래 `마지막 배치 취소`로 가장 최근 물건을 되돌릴 수 있습니다.

저장은 브라우저의 `localStorage`를 사용합니다. 같은 주소·브라우저에서 다시 열면 수집·배치가 복구됩니다. 브라우저 데이터를 지우거나 다른 기기·주소에서 열면 이어지지 않습니다. 저장이 차단되어 있으면 화면에 안내합니다.

## GitHub에 올리기

1. GitHub에서 새 저장소를 만드세요. 예: `chorok-island`.
2. 이 프로젝트 파일을 업로드하세요. `node_modules`, `dist`, 압축 파일은 제외하고 **`.github` 폴더와 `package-lock.json`은 포함**하세요.
3. 가장 간편한 방법은 GitHub Desktop에서 이 폴더를 저장소로 추가하고 `Publish repository`를 누르는 것입니다.

Git을 사용하는 경우, 아래 `YOUR_ACCOUNT`를 본인의 계정으로 바꾸세요. 빈 저장소에 처음 올리는 예시입니다.

```sh
git init
git add .
git commit -m "feat: create Chorok Island 3D village"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/chorok-island.git
git push -u origin main
```

### 웹 주소로 공개하기 — GitHub Pages

1. 저장소의 `Settings → Pages`에서 `Source`를 **GitHub Actions**로 선택하세요.
2. `main` 브랜치에 올리거나 `Actions → Deploy village to GitHub Pages → Run workflow`를 실행하세요.
3. 포함된 작업이 테스트 → 빌드 → 배포 순으로 실행됩니다.
4. 완료되면 Pages 설정 또는 작업 결과에 표시되는 주소를 여세요. 일반적으로 `https://YOUR_ACCOUNT.github.io/chorok-island/`입니다.

GitHub Pages를 사용할 수 있는 저장소·계정 설정이 필요합니다. 실제 계정에 업로드하거나 배포한 상태는 아니며, 바로 올릴 수 있는 소스와 배포 설정을 준비한 프로젝트입니다.

## 이 3D 마을을 만드는 방법

1. **장면과 카메라**: Three.js의 `Scene`, `OrthographicCamera`, `WebGLRenderer`를 만들고 부드러운 조명·그림자를 설정합니다. 원근 왜곡이 적은 카메라로 장난감 같은 마을을 표현합니다.
2. **섬 만들기**: 납작한 원기둥을 타원으로 늘려 모래층과 잔디층을 만들고, 아래에는 큰 바다 평면을 놓습니다.
3. **건물·식물 만들기**: 집은 상자와 삼각 지붕, 나무는 원기둥과 둥근 구로 조합합니다. 같은 생성 함수를 꾸미기 물건에도 재사용합니다.
4. **캐릭터 움직이기**: 키보드 방향을 카메라 기준 벡터로 바꾸고 프레임 간 시간에 따라 이동합니다. 이동 전에 섬 경계·집·나무와 충돌하는지 확인합니다.
5. **대화·수집 연결하기**: 플레이어와 가까운 주민·사과를 찾아 안내를 표시합니다. E를 누르면 주민 대화를 열거나 사과 ID를 수집 목록에 넣습니다.
6. **마을 꾸미기**: 마우스 좌표에서 바닥으로 광선을 쏘아 배치 좌표를 구합니다. 미리보기에 배치 가능 여부를 표시하고 길·기존 물건과의 겹침을 검사합니다.
7. **저장하기**: 위치·종류·수집 ID만 JSON으로 저장합니다. 불러올 때도 데이터를 검증하여 깨진 저장이나 잘못된 좌표를 거릅니다.
8. **공개하기**: Vite로 정적 파일을 만들고 GitHub Actions로 Pages에 배포합니다. 상대 경로 빌드를 사용하므로 저장소 이름이 바뀌어도 작동합니다.

공식 참고: [Three.js 설치](https://threejs.org/manual/pages/installation.html), [첫 장면 만들기](https://threejs.org/manual/pages/creating-a-scene.html).

## 파일 구조와 수정 지점

```text
index.html                       한국어 UI와 도움말
src/main.js                      조작, 카메라, 대화, 꾸미기, 저장 연결
src/world.js                     섬·집·나무·캐릭터 3D 도형 생성
src/state.js                     주민·배치·수집·충돌·저장 데이터 검증
src/input.js                     한글 입력 상태에서도 동작하는 키 매핑
src/style.css                    반응형 화면 디자인
tests/state.test.js              저장·중복 수집·배치·이동 경계 테스트
.github/workflows/deploy.yml     GitHub Pages 자동 배포
docs/design.md                   제작안
```

- 주민 이름·대사: `src/state.js`의 `NPCS`
- 기존 집 위치·색상: `src/state.js`의 `HOMES`
- 나무와 사과 위치: `src/state.js`의 `TREE_POSITIONS`, `FRUITS`
- 캐릭터와 집 외형: `src/world.js`의 `makeCharacter`, `makeHouse`
- 화면 문구·색감: `index.html`, `src/style.css`

## 검증과 배포용 빌드

```sh
npm test
npm run build
npm run preview
```

`dist/`에 정적 파일이 생성됩니다. `npm run preview`가 알려 주는 주소에서 빌드 결과를 확인할 수 있습니다. Three.js가 포함되어 빌드 과정에서 크기 알림이 나올 수 있습니다.

## 이후 확장한다면

실시간 다중 접속은 별도 WebSocket 서버, 서버 기준 플레이어 상태, 방 구분, 저장 DB를 추가해야 합니다. 현재의 브라우저 저장을 온라인 공유 상태로 사용하는 것만으로는 구현되지 않습니다.

## 라이선스

직접 작성한 코드와 도형은 MIT 라이선스입니다. Three.js, Vite 및 Google Fonts의 글꼴은 각 배포자의 라이선스를 따릅니다.
