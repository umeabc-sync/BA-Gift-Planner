<p>
  <a href="../README.md">English</a> | 
  <a href="./README.zh-TW.md">繁體中文</a> | 
  <a href="./README.zh-CN.md">简体中文</a> | 
  <a href="./README.ja.md">日本語</a> |
  한국어
</p>

# BA Gift Planner - 블루 아카이브 선물 플래너

<p align="left">
  <a href="https://vuejs.org/"><img alt="Vue.js" src="https://img.shields.io/badge/Vue.js-3-4FC08D?style=flat-square"></a>
  <a href="https://vitejs.dev/"><img alt="Vite" src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square"></a>
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square"></a>
</p>

이것은 모바일 게임 "블루 아카이브" 플레이어를 위해 설계된 선물 플래너입니다. 이 프로젝트는 Vue 3와 Vite를 사용하여 제작되었으며, 플레이어가 인연 랭크를 올리고 싶은 학생들에게 가장 최적의 선물 전략을 빠르게 찾을 수 있도록 깔끔하고 빠르며 반응형인 인터페이스를 제공합니다. 이 웹사이트에서 사용된 모든 정보와 자료는 각 저작자의 재산이며 저작권의 보호를 받습니다.

**[➡️ 웹사이트 바로가기](https://ba-gift-planner.pages.dev/)**

![프로젝트 OG 이미지](https://raw.githubusercontent.com/Yuuzi261/BA-Gift-Planner/refs/heads/main/public/og_image.webp)

> [!NOTE]
> 이 웹사이트가 BA Gift Planner와 Sensei Harem Tool이라는 두 가지 이름을 가지고 있다는 것을 눈치채셨을 수도 있습니다. BA Gift Planner는 프로젝트 초기의 임시 이름이었으며, 현재 어떤 이름으로 통일할지 고민 중입니다.

---

## ✨ 주요 기능 소개

> [!NOTE]
> 스크린샷 버전은 v0.3.2입니다. 현재 스크린샷에 사용할 영어 인터페이스가 없는 점 양해 바랍니다. 현재 계획은 번체 중국어, 간체 중국어(이 두 언어는 이미 지원됨), 영어, 일본어, 한국어를 지원하는 것입니다. 이러한 언어나 다른 언어 추가에 도움을 주시고 싶다면 [PR](https://github.com/Yuuzi261/BA-Gift-Planner/pulls)을 제출해 주세요.

1️⃣ 학생 선택기를 열고, 당신의 ~~와이프😋~~... 아니, 학생을 선택하세요.

![학생 선택기 스크린샷](./1.png)

2️⃣ 학생 선택기를 닫고 결과를 확인하세요 (네, 정말 간단합니다!). 여기서는 결과의 일부만 보여드립니다.

![결과 표시](./2.png)

최적의 선택이 아닌 학생은 반투명 + 점선 테두리 효과가 적용됩니다. 최적이 아닌 선택 결과를 보고 싶지 않다면, 설정 인터페이스에서 설정을 변경할 수 있습니다:

![설정 인터페이스](./3.png)

3️⃣ 어떤 선물(SSR)을 자유롭게 주거나, 선물 선택 상자(SR)를 합성하는 데 사용할 수 있는지 확인하세요.

![](./4.png)

4️⃣ 자, 이제 게임을 열고 학생들과의 관계를 발전시킬 시간입니다. 더 이상 잘못된 선물을 주거나 어떤 선물을 합성해야 할지 고민할 필요가 없습니다! 🎉

## 🛠️ 주요 개발 프레임워크 및 패키지

*   **프론트엔드 프레임워크**: [Vue 3](https://vuejs.org/) (Composition API)
*   **빌드 도구**: [Vite](https://vitejs.dev/)
*   **상태 관리**: [Pinia](https://pinia.vuejs.org/)
*   **코드 스타일**: [Prettier](https://prettier.io/)
*   **린터**: [ESLint](https://eslint.org/)
*   **배포 플랫폼**: [CloudFlare](https://www.cloudflare.com/)

## 🚀 로컬 개발

컴퓨터에 [Node.js](https://nodejs.org/)(버전 18.x 이상 권장)가 설치되어 있는지 확인하십시오.

1.  **프로젝트 클론**
    ```bash
    git clone https://github.com/Yuuzi261/BA-Gift-Planner.git
    ```

2.  **프로젝트 폴더로 이동**
    ```bash
    cd BA-Gift-Planner
    ```

3.  **의존성 설치**
    ```bash
    npm install
    ```

4.  **개발 서버 시작**
    ```bash
    npm run dev
    ```
    시작 후 브라우저에서 `http://localhost:5173`이 자동으로 열립니다.

5.  **프로젝트 빌드**
    프로덕션 환경용 파일을 빌드하려면 다음을 실행하십시오:
    ```bash
    npm run build
    ```
    빌드된 파일은 `dist` 폴더에 저장됩니다.

### 프로젝트 스크립트
 
| 명령어 | 설명 |
| :--- | :--- |
| `npm install` | 모든 프로젝트 의존성을 설치합니다. |
| `npm run dev` | 핫 리로딩을 지원하는 로컬 개발 서버를 시작합니다. |
| `npm run build` | 프로젝트를 `dist` 폴더로 번들링하고 JSON 파일을 압축합니다. |
| `npm run preview` | 프로덕션 빌드를 로컬에서 미리 봅니다. |
| `npm run format` | Prettier로 모든 코드의 서식을 지정합니다. |
| `npm run lint` | ESLint로 코드 스타일 문제를 검사하고 수정합니다. |
<!-- | `npm run analyze` | 번들 분석을 실행하여 `stats.html` 보고서를 생성합니다. | -->

## 📁 프로젝트 구조

```
BA-Character-Rating/
├── public/            # Vite에서 처리하지 않는 공용 자산
├── src/
│   ├── assets/        # 이미지, 폰트, 데이터 JSON 등 정적 자산
│   ├── components/    # 재사용 가능한 Vue 컴포넌트
│   ├── composables/   # 컴포저블 함수 (Hooks)
│   ├── data/          # 학생 선택기 필터 옵션 데이터
│   ├── locales/       # i18n 언어 파일
│   ├── store/         # Pinia 상태 관리
│   ├── utils/         # 공용 유틸리티 함수
│   ├── App.vue        # 메인 컴포넌트
│   ├── main.js        # 애플리케이션 진입점
│   └── style.css      # 전역 스타일
├── .env               # 전역 변수
├── .prettierrc.json   # Prettier 설정 파일
├── eslint.config.js   # ESLint 설정 파일
├── index.html         # HTML 진입 파일
├── package.json       # 프로젝트 의존성 및 스크립트
└── vite.config.js     # Vite 설정 파일
```

## 🤝 기여 및 지원

이 프로젝트는 데이터 업데이트, 버그 보고, 언어 지원 추가, 제안 등 커뮤니티의 기여를 적극 환영합니다.

다음과 같은 방법으로 저희를 도울 수 있습니다:

*   [Issues](https://github.com/Yuuzi261/BA-Gift-Planner/issues)에서 문제 및 제안 제기.
*   [Pull Request](https://github.com/Yuuzi261/BA-Gift-Planner/pulls)를 통해 누락된 캐릭터 데이터 또는 코드 수정 제출.

## 📄 라이선스

이 프로젝트는 [MIT License](https://opensource.org/licenses/MIT)에 따라 라이선스가 부여됩니다.
