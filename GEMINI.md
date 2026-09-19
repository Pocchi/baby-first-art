# 🎨 GEMINI.md — Baby's First Art GLSL AI Development Playbook

本プロジェクト `baby-first-art` は、**Google Antigravity** および **Gemini** 開発支援ツールを用いて構築された独立型インタラクティブ WebGL / GLSL アプリケーションです。
将来、AIエージェントや開発者が本リポジトリを改修・拡張する際のコンテキスト・設計規約・開発ガイドラインを以下に体系化しています。

---

## 🧭 1. プロジェクト概要 ＆ 技術スタック

- **フレームワーク**: Vite + React 18 + TypeScript
- **3D / GLSL**: Three.js + `@react-three/fiber`
- **リアルタイム通信**: WebRTC (PeerJS) + BroadcastChannel
- **デプロイ**: GitHub Actions (`.github/workflows/deploy.yml`) ➔ GitHub Pages (`dist/`)

---

## 📂 2. ファイル構成と役割

```
baby-first-art/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Push検知 ➔ npm run build ➔ GitHub Pages全自動デプロイ
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
│   ├── main.tsx                # React エントリーポイント
│   ├── index.css               # グローバルスタイル・アニメーション
│   └── vite-env.d.ts           # Vite Client ＋ React Three Fiber JSX 型定義
├── index.html                  # メタタグ・Google Fonts
├── package.json
├── tsconfig.json
├── vite.config.ts              # 相対パス (base: './') 設定
├── GEMINI.md                   # 本ドキュメント
├── README.md                   # 公開用リポジトリ説明書
└── .gitignore                  # dist/ や node_modules/ をGit除外
```

---

## ⚙️ 3. 設計規約と動作仕様

### 1. タッチ入力制御（iPad限定 ＆ PCモニター保護）
- **操作端末（iPad/Controller）**: タッチ操作、絵の具の広がり計算、手元フィードバック用の2Dポップスプラッシュアニメーション（星・ハート・波紋）および効果音を実行。
- **投影モニター（PC/Projection）**: 画面に `pointerEvents: 'none'` を指定し、ローカルのタッチ・マウスクリックを完全無効化。2Dポップスプラッシュは非表示（`if (vjMode === 'projection') return;`）とし、高画質なアクリル絵の具アートのみを大画面表示。

### 2. 99.9%〜100% の画面同期（解像度・アスペクト比不変）
- 画面サイズや縦横比の違い（iPad 4:3 ⇔ PC 16:9）で位置がずれないよう、タッチ座標はすべてパーセンテージ（`normX`, `normY`: 0.0〜1.0）として通信。
- ランダム性のズレを防ぐため、擬似乱数シード（`seed`）を送信し、決定論的乱数発生器で同期。

### 3. 全画面UI隠しモード (Clean Display Mode)
- 投影モニター側は初期状態でボタン類を完全非表示（`hideUi = true`）。
- `H` キー、`Space` キー、または画面右上ホバーの 👁️ ボタンで表示/非表示をトグル切替。

---

## 💻 4. 開発・ビルドコマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック ＋ 静的ビルド (dist/ 出力)
npm run build
```
