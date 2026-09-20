# 🎨 GEMINI.md — Baby's First Art GLSL AI Development Playbook

本プロジェクト `baby-first-art` は、**Google Antigravity** および **Gemini** 開発支援ツールを用いて構築された独立型インタラクティブ WebGL / GLSL アプリケーションです。
将来、AIエージェントや開発者が本リポジトリを改修・拡張する際のコンテキスト・設計規約・開発ガイドラインを以下に体系化しています。

---

## 🧭 1. プロジェクト概要 ＆ 技術スタック

- **フレームワーク**: Vite + React 18 + TypeScript
- **3D / GLSL**: Three.js + `@react-three/fiber` (GPU dpr 1.5制限, 60FPS最軽量描画)
- **リアルタイム通信**: WebRTC (PeerJS) + STUN + BroadcastChannel (全角正規化, PWA復帰時自動リコネクト)
- **モバイル / PWA**: Web App Manifest (`manifest.json`) + Service Worker (`sw.js`) + Safe Area (`env()`) + `100dvh`
- **デプロイ**: GitHub Actions (`.github/workflows/deploy.yml`) ➔ GitHub Pages (`dist/`)

---

## 📂 2. ファイル構成と役割

```
baby-first-art/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Push検知 ➔ npm run build ➔ GitHub Pages全自動デプロイ
├── public/
│   ├── manifest.json           # PWA 設定 (standalone 表示)
│   ├── sw.js                   # オフラインキャッシュ用 Service Worker
│   ├── icon-192.png / icon-512.png # PWA アプリアイコン
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
│   ├── main.tsx                # React エントリーポイント (Service Worker 自動登録)
│   ├── index.css               # グローバルスタイル・アニメーション
│   └── vite-env.d.ts           # Vite Client ＋ React Three Fiber JSX 型定義
├── index.html                  # メタタグ (Viewport-fit cover / PWA) ＋ Google Fonts
├── package.json
├── tsconfig.json
├── vite.config.ts              # 相対パス (base: './') 設定
├── GEMINI.md                   # 本ドキュメント
├── README.md                   # 公開用リポジトリ説明書
└── .gitignore                  # dist/ や node_modules/ をGit除外
```

---

## ⚙️ 3. 設計規約と動作仕様

### 1. タッチ入力制御 ＆ 画面比率補正
- **操作端末（iPad/Controller/Standalone）**: タッチ操作、絵の具の広がり計算、手元フィードバック用の2Dポップスプラッシュアニメーション（星・ハート・波紋）および効果音を実行。
- **投影モニター（PC/Projection）**: マウスクリックにより指定色（基本4色 ＋ ✨差し色2色）の点ドロップをピンポイントで追加。2Dポップスプラッシュは非表示とし、大画面用にアクリル絵の具アートのみを静かに投影。
- **1:1 正円補正 (GLSL)**: シェーダー内で `float aspect = uResolution.y > 0.0 ? uResolution.x / uResolution.y : 1.0;` を適用し、iPhone (19.5:9) や iPad (4:3)、PC (16:9) など画面縦横比に関わらず絵の具を完璧な 1:1 正円で描画。

### 2. PWA ＆ モバイル Safari 最適化
- **動的ビューポート高**: ルート・オーバーレイに `100dvh` および `minHeight: 100dvh` を適用し、Mobile Safari アドレスバー出現時でも画面内に UI がピッタリ収まる設計。
- **Safe Area インセット**: iPhone ノッチ・Dynamic Island・画面下ホームバーへの被りを防ぐため、`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` を自動計算。
- **赤ちゃん誤操作防止**: 長押しメニュー禁止 (`contextmenu`)、ピンチズーム・ダブルタップズーム禁止、バウンススクロール無効化 (`touch-action: none; overscroll-behavior: none;`)。

### 3. WebRTC 堅牢同期 ＆ PWA スリープ復帰
- **入力補正**: 4桁コード入力時の全角数字（例: `４６６４`）および余分なスペースを自動的に半角英数字へ正規化 (`normalizeRoomCode`)。
- **STUN サーバー**: Google STUN サーバー群の明示指定により異なるネットワーク間での接続を確立。
- **PWA 復帰再同期**: `visibilitychange` イベントにより、iOS Safari PWA スリープ復帰時に自動的に通信状態を確認し再同期・再接続リクエスト。

### 4. UI 視認性制御
- すべてのモードで初期状態は UI 表示 (`hideUi = false`)。
- コントロールパネル上の「👁️ UIを隠す (全画面)」ボタン、または `H` キー / `Space` キーで UI を非表示化。

---

## 💻 4. 開発・ビルドコマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック ＋ 静的ビルド (dist/ 出力)
npm run build
```
