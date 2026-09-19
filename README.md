# 🎨 Baby's First Art GLSL - 赤ちゃんのファーストアート WebRTC VJ スタジオ

iPadなどのタッチ端末（操作リモコン）と、プロジェクター/大画面PC（投影モニター）をワイヤレスでリアルタイム同期（60FPS）し、赤ちゃんのタッチ操作でアクリル絵の具とキラカード風ホログラムラメアートを制作・鑑賞できる独立Webアプリケーションです。

> 🤖 **Developed with Google Antigravity & Gemini**
> 本アプリケーションのGLSLシェーダー、WebRTCリアルタイム同期システム、UI/UXデザイン、およびTypeScriptコード基盤は **Google Antigravity** と **Gemini** ツールを活用して開発・生成されました。

---

## 📂 ファイル構成

保守性・可読性を高めるため、機能ごとに役割を明確に分離・モジュール化しています。

```
baby-first-art/
├── .github/
│   └── workflows/
│       └── deploy.yml          # mainブランチへのPush時にGitHub Actionsで自動ビルド＆デプロイ
├── src/
│   ├── components/
│   │   ├── FirstArtCanvas.tsx  # 3D WebGL (React Three Fiber) Canvas コンポーネント
│   │   ├── ModeSelectModal.tsx # モード選択 ＆ 部屋コード入力ダイアログ
│   │   ├── ParticleCanvas.tsx  # 2D HTML Canvas 手元スプラッシュ粒子アニメーション
│   │   ├── UIOverlay.tsx       # ヘッダー ＆ フロートコントロールパネル
│   │   └── firstArtSyncLinkWireless.ts  # WebRTC (PeerJS) ＋ BroadcastChannel ワイヤレス同期
│   ├── constants/
│   │   └── palettes.ts         # アクリル絵の具カラーパレット ＆ 粒子カラー定数
│   ├── shaders/
│   │   └── firstArtShader.ts   # Custom GLSL シェーダー (詳細な日本語解説コメント付き)
│   ├── types/
│   │   └── firstArt.ts         # TypeScript 型定義 (Particle, Ripple, Droplet, Mode)
│   ├── App.tsx                 # 簡潔で可読性の高いメインコンポーネント (~150行)
│   ├── main.tsx                # エントリーポイント
│   ├── index.css               # グローバルスタイル定義
│   └── vite-env.d.ts           # Viteクライアント ＋ React Three Fiber JSX型定義
├── index.html                  # メタタグ ＋ Google Fonts (Outfit / Inter / Caveat)
├── package.json                # 依存パッケージおよびスクリプト定義
├── tsconfig.json               # TypeScript コンパイラ設定
├── vite.config.ts              # Viteビルド設定 (相対パス base: './')
├── GEMINI.md                   # Gemini / Antigravity AI 開発ガイドライン・コンテキスト定義
├── .gitignore                  # dist/ や node_modules/ をGitコミット対象外に指定
└── README.md                   # プロジェクト説明書
```

---

## 🚀 主な機能・特徴

- **🎨 WebGL / GLSL 3Dアクリル絵の具シェーダー**:
  - ドーム状の立体ツヤ感、プラチナシルバーハイライト、ドメインワープ混色グラデーション
  - 漆黒キャンバス（#03050c）と超低速スモークゆらめき
  - キラカード風ホログラムフォイル粒子
- **📱 タッチ端末限定スプラッシュ（星・ハート・波紋）**:
  - iPad手元画面でのみタッチ時に2Dスプラッシュアニメーションが表示され、直感的なタッチフィードバックを提供
  - 大画面PC（投影モニター）では2Dノイズが除去され、洗練されたアクリル絵の具アートのみを静かに投影
- **📡 WebRTC / BroadcastChannel ワイヤレスVJ同期**:
  - 4桁の部屋コードで手元iPadと大画面PCをワイヤレス同期
  - 画面解像度・アスペクト比の違いに依存しない相対座標（0.0〜1.0）同期
- **👁️ 全画面UI隠しモード (Clean Display Mode)**:
  - ボタンやヘッダーを消去し、100%全画面キャンバス化（`H` キー / `Space` キー / 👁️ ボタンで切替）

---

## 💻 ローカル開発・起動方法

### 1. 依存ライブラリのインストール
```bash
npm install
```

### 2. 開発サーバーの起動
```bash
npm run dev
```
ブラウザで `http://localhost:5173` が開きます。

### 3. 静的ビルドの実行
```bash
npm run build
```
`dist/` ディレクトリに GitHub Pages 公開用の完全な静的ファイルが生成されます。

---

## 🌐 GitHub Pages への公開手順

1. **新しい GitHub リポジトリを作成**:
   - GitHub 上で `baby-first-art` という名前の **Public（公開）リポジトリ** を新規作成します。

2. **ローカルから Push**:
   ```bash
   git init
   git add .
   git commit -m "refactor: update modular file structure and docs"
   git branch -M main
   git remote add origin https://github.com/<あなたのユーザー名>/baby-first-art.git
   git push -u origin main
   ```

3. **GitHub Pages の設定**:
   - GitHub リポジトリの **Settings > Pages** を開きます。
   - **Build and deployment > Source** を **`GitHub Actions`** に変更します。
   - `main` ブランチへ Push されると、自動的にビルドされ `https://<あなたのユーザー名>.github.io/baby-first-art/` で公開されます！
