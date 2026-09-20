# 🎨 Baby's First Art GLSL - 赤ちゃんのファーストアート WebRTC VJ スタジオ

iPadなどのタッチ端末（操作リモコン）と、プロジェクター/大画面PC（投影モニター）をワイヤレスでリアルタイム同期（60FPS）し、赤ちゃんのタッチ操作でアクリル絵の具とキラカード風ホログラムラメアートを制作・鑑賞できる独立Webアプリケーション（PWA対応）です。

> 🤖 **Developed with Google Antigravity & Gemini**
> 本アプリケーションのGLSLシェーダー、WebRTCリアルタイム同期システム、UI/UXデザイン、PWAモバイル最適化、およびTypeScriptコード基盤は **Google Antigravity** と **Gemini** ツールを活用して開発・生成されました。

---

## 📂 ファイル構成

保守性・可読性を高めるため、機能ごとに役割を明確に分離・モジュール化しています。

```
baby-first-art/
├── .github/
│   └── workflows/
│       └── deploy.yml          # mainブランチへのPush時にGitHub Actionsで自動ビルド＆デプロイ
├── public/
│   ├── manifest.json           # PWA (Progressive Web App) アプリマニフェスト
│   ├── sw.js                   # オフラインキャッシュ用 Service Worker
│   ├── icon-192.png            # PWA用 アイコン (192x192)
│   ├── icon-512.png            # PWA用 アイコン (512x512)
│   └── apple-touch-icon.png    # iOS ホーム画面アイコン
├── src/
│   ├── components/
│   │   ├── FirstArtCanvas.tsx  # 3D WebGL (React Three Fiber) Canvas コンポーネント (dpr 1.5制限 ＆ 60FPS)
│   │   ├── ModeSelectModal.tsx # 全画面縦スクロール モード選択 ＆ 画面中央4桁コード入力ダイアログ
│   │   ├── ParticleCanvas.tsx  # 2D HTML Canvas 手元スプラッシュ粒子アニメーション
│   │   ├── UIOverlay.tsx       # ヘッダー ＆ フロートコントロールパネル (Safe-Area ＆ 100dvh対応)
│   │   └── firstArtSyncLinkWireless.ts  # WebRTC (PeerJS) ＋ STUN ＋ 全角自動補正 ＋ PWA復帰自動再同期
│   ├── constants/
│   │   └── palettes.ts         # アクリル絵の具カラーパレット (基本4色＋✨差し色2色) ＆ 粒子カラー定数
│   ├── shaders/
│   │   └── firstArtShader.ts   # Custom GLSL シェーダー (1:1正円補正 ＋ ゼロ除算安全ガード)
│   ├── types/
│   │   └── firstArt.ts         # TypeScript 型定義 (Particle, Ripple, Droplet, Mode)
│   ├── App.tsx                 # メインコンポーネント (PWA / Safe-Area / 視認性制御)
│   ├── main.tsx                # エントリーポイント (Service Worker 自動登録)
│   ├── index.css               # グローバルスタイル定義
│   └── vite-env.d.ts           # Viteクライアント ＋ React Three Fiber JSX型定義
├── index.html                  # メタタグ (Viewport-fit cover / PWA) ＋ Google Fonts
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
  - 画面のアスペクト比（19.5:9 iPhone 〜 4:3 iPad 〜 16:9 PC）に関わらず絵の具が完璧な正円（1:1）で描画される補正計算
  - ドーム状の立体ツヤ感、プラチナシルバーハイライト、ドメインワープ混色グラデーション
  - 漆黒キャンバス（#03050c）と超低速スモークゆらめき ＋ キラカード風ホログラムフォイル粒子
- **📡 WebRTC / STUN / PWA 堅牢型ワイヤレスVJ同期**:
  - 全角数字（例: `４６６４`）の自動半角正規化 (`normalizeRoomCode`)
  - Google STUN サーバー群による異なるWi-Fi・ルーター環境越え接続確立
  - PWA / iOS Safari スリープ復帰時 (`visibilitychange`) の自動状態確認 ＆ リコネクト
  - 二重保証キャンバスリセット信号送信による確実な端末間クリア同期
- **📱 赤ちゃん誤操作防止ガード (Baby-Proofing)**:
  - 長押しメニュー・右クリック遮断 (`contextmenu`)
  - ピンチズーム・拡大縮小・ダブルタップズーム無効化
  - バウンススクロール無効化 (`touch-action: none; overscroll-behavior: none;`)
- **📲 モバイル最適化 ＆ PWA 対応**:
  - CSS `100dvh` (Dynamic Viewport Height) 適用により Mobile Safari アドレスバー表示時でもUIが隠れない設計
  - ノッチ・Dynamic Island・画面下ホームインジケーターに対応する Safe Area (`env(safe-area-inset-top/bottom)`) 自動確保
  - ホーム画面への追加によるスタンドアロン全画面アプリ化 ＆ オフライン動作
- **⚙️ 直感的なUI ＆ モード切替**:
  - 全端末で UI デフォルト表示 (`hideUi = false`)、必要に応じて「👁️ UIを隠す (全画面)」ボタンや `H` / `Space` キーで隠せる親切設計
  - 画面中央の専用ポップアップダイアログによるスクロール不要な 4桁部屋コード入力
  - PC（投影画面）マウスクリックによる単一点ドロップ追加（基本4色 ＋ ✨差し色2色）

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

1. **GitHub へ Push**:

   ```bash
   git add .
   git commit -m "feat: complete baby first art app with pwa & mobile safari fixes"
   git push origin main
   ```

2. **GitHub Pages の自動デプロイ**:
   - GitHub リポジトリの **Settings > Pages** で Source を **`GitHub Actions`** に設定すると、`main` ブランチへの Push 時に自動ビルドされ、https://pocchi.github.io/baby-first-art/ で公開されます。
