<p>
  <a href="../README.md">English</a> | 
  <a href="./README.zh-TW.md">繁體中文</a> | 
  <a href="./README.zh-CN.md">简体中文</a> | 
  日本語 |
  <a href="./README.ko.md">한국어</a>
</p>

# BA Gift Planner - ブルーアーカイブ ギフトプランナー

<p align="left">
  <a href="https://vuejs.org/"><img alt="Vue.js" src="https://img.shields.io/badge/Vue.js-3-4FC08D?style=flat-square"></a>
  <a href="https://vitejs.dev/"><img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square"></a>
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square"></a>
</p>

これは、モバイルゲーム「ブルーアーカイブ」のプレイヤー向けに設計されたギフトプランナーです。このプロジェクトはVue 3とViteを使用しており、プレイヤーが絆ランクを上げたい生徒たちに最適な贈り物の戦略を迅速に見つけるための、クリーンで高速、かつレスポンシブなインターフェースを提供します。このウェブサイトで使用されているすべての情報と素材は、それぞれの著者の財産であり、著作権で保護されています。

**[➡️ ウェブサイトはこちら](https://ba-gift-planner.pages.dev/)**

![プロジェクトOG画像](https://raw.githubusercontent.com/Yuuzi261/BA-Gift-Planner/refs/heads/main/public/og_image.webp)

> [!NOTE]
> このサイトには「BA Gift Planner」と「Sensei Harem Tool」という2つの名前があることにお気づきかもしれません。「BA Gift Planner」はプロジェクトの初期段階での仮称であり、最終的にどちらの名前に統一するかは現在検討中です。

---

## ✨ 主な機能の紹介

> [!NOTE]
> 現在、このサイトは英語、日本語、繁体字中国語、簡体字中国語、韓国語に対応しています。他の言語の追加にご協力いただける場合は、[PR](https://github.com/Yuuzi261/BA-Gift-Planner/pulls)を送信してください。

### 贈り物の推薦ページ

1️⃣ 生徒選択を開き、あなたの~~お嫁さん😋~~...じゃなくて、生徒を選びます。

![生徒選択のスクリーンショット](./imgs/1.png)

2️⃣ 生徒選択を閉じて結果を確認します（そう、とても簡単です！）。ここでは結果の一部のみを表示しています。

![結果表示](./imgs/2.png)

最適でない選択肢の生徒には、半透明+破線の枠が表示されます。最適でない結果を見たくない場合は、設定画面で設定を変更できます：

![設定画面](./imgs/3.png)

3️⃣ どの贈り物（SSR）を自由に贈れるか、または贈り物選択ボックス（SR）の合成に使用できるかを確認します。

![](./imgs/4.png)

4️⃣ さあ、ゲームを開いて生徒たちとの絆を深めましょう。もう贈り物を間違えたり、どの贈り物が合成に使えるか分からなくなったりする心配はありません！🎉

### 絆計算ページ

1️⃣ 贈り物インベントリを設定

![](./imgs/5.png)

2️⃣ 生徒の絆レベルと経験値を設定

![](./imgs/6.png)

3️⃣ 贈り物計画を立てる

![](./imgs/7.png)

4️⃣ 計画の効果を即時プレビュー

![](./imgs/8.png)

5️⃣ 目標レベルを設定して差を確認

![](./imgs/9.png)

6️⃣ 計画を適用

![](./imgs/10.png)

これらの機能により、絆の計算が簡単になります。ゲームの進行状況を同期して綿密な好感度計画を立てたい場合でも、おおよその数値を設定して目標までの距離を確認したい場合でも、現在の手持ちの贈り物で何ができるかを知りたい場合でも、非常に便利です。

## 🛠️ 主な開発フレームワーク＆パッケージ

*   **フロントエンドフレームワーク**: [Vue 3](https://vuejs.org/) (Composition API)
*   **ビルドツール**: [Vite](https://vitejs.dev/)
*   **状態管理**: [Pinia](https://pinia.vuejs.org/)
*   **ルーティング**: [Vue Router](https://router.vuejs.org/)
*   **コードスタイル**: [Prettier](https://prettier.io/)
*   **リンター**: [ESLint](https://eslint.org/)
*   **デプロイプラットフォーム**: [CloudFlare](https://www.cloudflare.com/)

## 🚀 ローカルでの開発

お使いのコンピュータに[Node.js](https://nodejs.org/)（バージョン18.x以上を推奨）がインストールされていることを確認してください。

1.  **プロジェクトをクローンする**
    ```bash
    git clone https://github.com/Yuuzi261/BA-Gift-Planner.git
    ```

2.  **プロジェクトフォルダに移動する**
    ```bash
    cd BA-Gift-Planner
    ```

3.  **依存関係をインストールする**
    ```bash
    npm install
    ```

4.  **開発サーバーを起動する**
    ```bash
    npm run dev
    ```
    起動後、ブラウザで自動的に `http://localhost:5173` が開きます。

5.  **プロジェクトをビルドする**
    本番環境用のファイルをビルドするには、次を実行します：
    ```bash
    npm run build
    ```
    ビルドされたファイルは `dist` フォルダに保存されます。

### プロジェクトスクリプト
 
| コマンド | 説明 |
| :--- | :--- |
| `npm install` | プロジェクトのすべての依存関係をインストールします。 |
| `npm run dev` | ホットリロード対応のローカル開発サーバーを起動します。 |
| `npm run build` | プロジェクトを`dist`フォルダにバンドルし、JSONファイルを圧縮します。 |
| `npm run preview` | 本番ビルドをローカルでプレビューします。 |
| `npm run format` | Prettierを使用してすべてのコードをフォーマットします。 |
| `npm run lint` | ESLintを使用してコードスタイルの問題をチェックし、修正します。 |
<!-- | `npm run analyze` | バンドル分析を実行し、`stats.html`レポートを生成します。 | -->

## 📁 プロジェクト構造

```
BA-Gift-Planner/
├── public/            # Viteで処理されない公開アセット
├── src/
│   ├── assets/        # 画像、フォント、データJSONなどの静的アセット
│   ├── components/    # 再利用可能なVueコンポーネント
│   ├── composables/   # コンポーザブル関数 (Hooks)
│   ├── data/          # アプリケーションデータ
│   ├── directives/    # カスタムディレクティブ
│   ├── locales/       # i18n言語ファイル
│   ├── router/        # Vueルーターの設定
│   ├── store/         # Pinia状態管理
│   ├── utils/         # 共有ユーティリティ関数
│   ├── views/         # ページコンポーネント
│   ├── App.vue        # メインコンポーネント
│   ├── main.js        # アプリケーションのエントリーポイント
│   └── style.css      # グローバルスタイル
├── .env               # グローバル変数
├── .prettierrc.json   # Prettier設定ファイル
├── eslint.config.js   # ESLint設定ファイル
├── index.html         # HTMLエントリーファイル
├── package.json       # プロジェクトの依存関係とスクリプト
└── vite.config.js     # Vite設定ファイル
```

## 🤝 貢献と協力

このプロジェクトでは、データ更新、バグ報告、言語サポートの追加、提案など、コミュニティからの貢献を歓迎しています。

以下の方法でご協力いただけます：

*   [Issues](https://github.com/Yuuzi261/BA-Gift-Planner/issues)で問題や提案を提起する。
*   [Pull Request](https://github.com/Yuuzi261/BA-Gift-Planner/pulls)で不足しているキャラクターデータやコードの修正を提出する。

## 📄 ライセンス

このプロジェクトは[MIT License](https://opensource.org/licenses/MIT)の下でライセンスされています。
