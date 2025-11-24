<p>
  <a href="../README.md">English</a> | 
  繁體中文 | 
  <a href="./README.zh-CN.md">简体中文</a> | 
  <a href="./README.ja.md">日本語</a> |
  <a href="./README.ko.md">한국어</a>
</p>

# BA Gift Planner - 蔚藍檔案禮物規劃器

<p align="left">
  <a href="https://vuejs.org/"><img alt="Vue.js" src="https://img.shields.io/badge/Vue.js-3-4FC08D?style=flat-square"></a>
  <a href="https://vitejs.dev/"><img alt="Vite" src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square"></a>
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square"></a>
</p>

這是一個為手遊《蔚藍檔案》（Blue Archive）玩家設計的禮物規劃器。專案使用 Vue 3 和 Vite 建立，提供一個簡潔、快速且響應式的介面，幫助玩家快速從想提升羈絆等級的學生們中找到最優的送禮策略。本網站中使用的所有資訊和素材均為各自作者的財產和版權。

**[➡️ 點此進入網站](https://ba-gift-planner.pages.dev/)**

![專案OG圖片](https://raw.githubusercontent.com/Yuuzi261/BA-Gift-Planner/refs/heads/main/public/og_image.webp)

> [!NOTE]
> 你可能會發現這個網站同時擁有 BA Gift Planner 以及 Sensei Harem Tool 兩個名字，BA Gift Planner 為專案早期暫定的名稱，目前還在考慮最終要統一使用哪個名字。

---

## ✨ 主要功能介紹

> [!NOTE]
> 目前網站支持繁體英文、日文、繁體中文、簡體中文、韓文，如果你想要幫助我其他語言，請提交 [PR](https://github.com/Yuuzi261/BA-Gift-Planner/pulls)

### 禮物推薦頁面

1️⃣ 打開角色選擇器，選好你的~~老婆😋~~...我的意思是學生

![角色選擇器截圖](./imgs/1.png)

2️⃣ 關閉角色選擇器查看結果（沒錯就是這麼簡單！），這裡我只展示部份的結果

![結果展示](./imgs/2.png)

不是最佳選擇的學生會有一個半透明+虛線邊框效果，如果不想看到非最佳選擇的結果，可以在設定界面中修改設定：

![設定界面](./imgs/3.png)

3️⃣ 查看哪些禮物可以任意贈送（SSR）或是拿去合成禮物自選箱（SR）

![](./imgs/4.png)

4️⃣ 好了，現在你可以打開遊戲了開始和學生們培養感情了，再也不怕送錯或是不知道哪些禮物可以拿去合成了！🎉

### 羈絆計算頁面

1️⃣ 設定禮物庫存

![](./imgs/5.png)

2️⃣ 設定學生羈絆等級、經驗

![](./imgs/6.png)

3️⃣ 開始擬定贈禮計劃

![](./imgs/7.png)

4️⃣ 可即時預覽計劃效果

![](./imgs/8.png)

5️⃣ 設定目標等級並查看差距

![](./imgs/9.png)

6️⃣ 實際套用計劃

![](./imgs/10.png)

這些功能讓計算羈絆變得簡單，不管是要透過它隨時同步遊戲中的進度，嚴格進行好感度的規劃；或是單純設定一個差不多的數值看一下距離目標還有多遙遠，亦或是想知道當下自己的禮物庫存可以做到什麼程度都很方便。

## 🛠️ 主要開發框架&套件

*   **前端框架**: [Vue 3](https://vuejs.org/) (Composition API)
*   **建置工具**: [Vite](https://vitejs.dev/)
*   **狀態管理**: [Pinia](https://pinia.vuejs.org/)
*   **程式碼風格**: [Prettier](https://prettier.io/)
*   **程式碼檢查**: [ESLint](https://eslint.org/)
*   **部署平台**: [CloudFlare](https://www.cloudflare.com/)

## 🚀 本地開發

請確認您的電腦已安裝 [Node.js](https://nodejs.org/)（建議版本 18.x 或以上）。

1.  **複製專案**
    ```bash
    git clone https://github.com/Yuuzi261/BA-Gift-Planner.git
    ```

2.  **進入專案資料夾**
    ```bash
    cd BA-Gift-Planner
    ```

3.  **安裝依賴**
    ```bash
    npm install
    ```

4.  **啟動開發伺服器**
    ```bash
    npm run dev
    ```
    啟動後，瀏覽器將自動打開 `http://localhost:5173`。

5.  **建置專案**
    若要建置用於生產環境的檔案，請執行：
    ```bash
    npm run build
    ```
    建置後的檔案會存放在 `dist` 資料夾下。

### 專案腳本
 
| 指令 | 描述 |
| :--- | :--- |
| `npm install` | 安裝專案所有依賴。 |
| `npm run dev` | 啟動本地開發伺服器，支援熱重載。 |
| `npm run build` | 將專案打包至 dist 資料夾，並壓縮 JSON 檔案。 |
| `npm run preview` | 預覽打包後的成果。 |
| `npm run format` | 使用 Prettier 格式化所有程式碼。 |
| `npm run lint` | 使用 ESLint 檢查並修正程式碼風格問題。 |
<!-- | `npm run analyze` | 執行打包分析，產生 `stats.html` 報告。 | -->

## 📁 專案結構

```
BA-Character-Rating/
├── public/            # 公共資源，不會被 Vite 處理
├── src/
│   ├── assets/        # 圖片、字體、資料 JSON 等靜態資源
│   ├── components/    # 可重複使用的 Vue 元件
│   ├── composables/   # 可組合的函式 (Hooks)
│   ├── data/          # 存放角色選擇器 Filter 選項資料
│   ├── locales/       # i18n 語言檔案
│   ├── store/         # Pinia 狀態管理
│   ├── utils/         # 共用工具函數
│   ├── App.vue        # 主元件
│   ├── main.js        # 應用程式進入點
│   └── style.css      # 全域樣式
├── .env               # 全域變數
├── .prettierrc.json   # Prettier 設定檔
├── eslint.config.js   # ESLint 設定檔
├── index.html         # 網頁標頭
├── package.json       # 專案依賴與腳本
└── vite.config.js     # Vite 設定檔
```

## 🤝 貢獻與協助

本專案非常歡迎社群的貢獻，不論是協助資料更新、錯誤回報、新增語言支援或提供建議等。

你可以透過以下方式協助我們：

*   在 [Issues](https://github.com/Yuuzi261/BA-Gift-Planner/issues) 中提出問題及建議。
*   在 [Pull Request](https://github.com/Yuuzi261/BA-Gift-Planner/pulls) 中提交缺失的角評資料或程式碼修改。

## 📄 授權

本專案採用 [MIT License](https://opensource.org/licenses/MIT) 授權。
