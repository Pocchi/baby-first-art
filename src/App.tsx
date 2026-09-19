/**
 * ============================================================================
 * 🎨 Baby's First Art - メイン App コンポーネント
 * ============================================================================
 * 
 * 【ファイル構成】
 * - src/types/firstArt.ts               : 型定義 (Particle, Ripple, Droplet, Mode)
 * - src/constants/palettes.ts           : カラーパレット ＆ 粒子カラー定数
 * - src/shaders/firstArtShader.ts       : Custom GLSL シェーダー (アクリル絵の具 ＋ ホログラム)
 * - src/components/FirstArtCanvas.tsx    : 3D WebGL (React Three Fiber) キャンバス
 * - src/components/ParticleCanvas.tsx   : 2D HTML Canvas 手元限定スプラッシュ粒子
 * - src/components/UIOverlay.tsx        : ヘッダー ＆ フロートコントロールパネル
 * - src/components/ModeSelectModal.tsx  : 初回モード選択 ＆ 部屋コード接続モーダル
 * - src/components/firstArtSyncLinkWireless.ts : WebRTC / BroadcastChannel 同期モジュール
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FirstArtCanvas } from './components/FirstArtCanvas';
import { ParticleCanvas } from './components/ParticleCanvas';
import { UIOverlay } from './components/UIOverlay';
import { ModeSelectModal } from './components/ModeSelectModal';
import { FirstArtSyncLinkWireless, FirstArtSyncMessage } from './components/firstArtSyncLinkWireless';
import { Droplet, Mode, Particle, Ripple } from './types/firstArt';
import { HOLOGRAM_PARTICLE_COLORS } from './constants/palettes';

export default function App() {
  // モード ＆ 表示設定 state
  const [vjMode, setVjMode] = useState<Mode>('select');
  const [hideUi, setHideUi] = useState(false);
  const [paletteIdx, setPaletteIdx] = useState<number>(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // WebRTC ワイヤレス同期 state
  const [roomId, setRoomId] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [reconnectCode, setReconnectCode] = useState<string>('');

  const syncLinkRef = useRef<FirstArtSyncLinkWireless | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // パレット切り替えハンドラー
  const handleSelectPalette = useCallback((idx: number) => {
    setPaletteIdx(idx);
    if (syncLinkRef.current) {
      syncLinkRef.current.send({
        type: 'palette_change',
        paletteIdx: idx,
      });
    }
  }, []);

  // 2D Canvas パーティクル参照
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const activePointerMap = useRef<Map<number | string, { lastX: number; lastY: number }>>(new Map());

  // 初期絵の具ドロップ生成 (8点円形サークル)
  const generateInitialDroplets = useCallback((): Droplet[] => {
    const drops: Droplet[] = [];
    const count = 8;
    const center = { x: 0.5, y: 0.5 };
    const radius = 0.24;

    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count - Math.PI / 2;
      drops.push({
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
        r: 0.062,
        colorIdx: i % 4,
      });
    }
    return drops;
  }, []);

  const dropletsRef = useRef<Droplet[]>(generateInitialDroplets());
  const [, setRerender] = useState(0);

  const lastSoundTimeRef = useRef<number>(0);

  // 🔊 効果音再生 (WebAudioスロットル ＆ ノード自動解放でメモリリーク完全防止)
  const playPaintSound = useCallback(() => {
    if (!soundEnabled) return;
    const nowMs = Date.now();
    if (nowMs - lastSoundTimeRef.current < 80) return;
    lastSoundTimeRef.current = nowMs;

    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freqs = [523.25, 659.25, 783.99, 880.0, 1046.5];
      const baseFreq = freqs[Math.floor(Math.random() * freqs.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);

      // WebAudio メモリ即時解放
      setTimeout(() => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      }, 200);
    } catch {}
  }, [soundEnabled]);

  // ✨ 粒子噴射 (iPadのみ表示・PC投影版では非表示)
  const spawnParticlesAt = useCallback((normX: number, normY: number, seed?: number) => {
    if (vjMode === 'projection') return; // PC投影版ではスプラッシュ粒子非表示

    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const screenX = normX * canvas.width;
    const screenY = normY * canvas.height;

    let s = seed ?? Math.random();
    const pseudoRandom = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const rand = seed !== undefined ? pseudoRandom : Math.random;

    const shapes: ('star' | 'heart' | 'circle' | 'sparkle')[] = ['star', 'heart', 'circle', 'sparkle'];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (rand() - 0.5) * 0.5;
      const speed = 1.2 + rand() * 2.0;
      particlesRef.current.push({
        id: rand(),
        x: screenX,
        y: screenY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        size: 7 + rand() * 9,
        color: HOLOGRAM_PARTICLE_COLORS[Math.floor(rand() * HOLOGRAM_PARTICLE_COLORS.length)],
        shape: shapes[Math.floor(rand() * shapes.length)],
        life: 0,
        maxLife: 25 + rand() * 15,
        rotation: rand() * Math.PI * 2,
        vRot: (rand() - 0.5) * 0.15,
      });
    }

    ripplesRef.current.push({
      id: rand(),
      x: screenX,
      y: screenY,
      radius: 8,
      color: HOLOGRAM_PARTICLE_COLORS[Math.floor(rand() * HOLOGRAM_PARTICLE_COLORS.length)],
      alpha: 0.95,
    });
  }, [vjMode]);

  // 🎨 絵の具拡大・混色計算
  const applyPaintSpreadAt = useCallback((x: number, y: number) => {
    const drops = dropletsRef.current;
    let closestDrop: Droplet | null = null;
    let minDist = 999;

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      const dist = Math.hypot(d.x - x, d.y - y);
      if (dist < minDist) {
        minDist = dist;
        closestDrop = d;
      }

      if (dist < d.r + 0.18) {
        d.r = Math.min(0.38, d.r + 0.007);
      }
    }

    if (minDist > 0.12 && drops.length < 32) {
      const newColorIdx = closestDrop ? closestDrop.colorIdx : Math.floor(Math.random() * 4);
      drops.push({
        x,
        y,
        r: 0.08,
        colorIdx: newColorIdx,
      });
    }
  }, []);

  // 🎨 PC用 絵の具点の追加 (混色・拡大は一切せず、選択中の色の点のみを追加)
  const addPcPointDroplet = useCallback((x: number, y: number) => {
    const drops = dropletsRef.current;
    if (drops.length < 32) {
      drops.push({
        x,
        y,
        r: 0.075,
        colorIdx: selectedColorIdx,
      });
      setRerender((v) => v + 1);
    }
  }, [selectedColorIdx]);

  // 🔄 キャンバスリセット
  const handleReset = useCallback(() => {
    const newDroplets = generateInitialDroplets();
    dropletsRef.current = newDroplets;
    particlesRef.current = [];
    ripplesRef.current = [];
    activePointerMap.current.clear();
    setRerender((v) => v + 1);

    if (syncLinkRef.current) {
      syncLinkRef.current.send({
        type: 'reset',
        droplets: newDroplets,
      });
      syncLinkRef.current.send({
        type: 'droplets_update',
        droplets: newDroplets,
      });
    }
  }, [generateInitialDroplets]);

  // URL パラメーター自動接続 (?room=7842)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get('room');
    if (urlRoom && vjMode === 'select') {
      setVjMode('controller');
      handleConnectAsController(urlRoom);
    }
  }, [vjMode]);

  // キーボードショートカット (H / Space / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVjMode('select');
        setConnectionStatus('idle');
        if (syncLinkRef.current) {
          syncLinkRef.current.close();
          syncLinkRef.current = null;
        }
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'h' || e.key === ' ') {
        setHideUi((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 📡 WebRTC 投影ホスト初期化 (Projection モード)
  useEffect(() => {
    if (vjMode === 'projection') {
      setSoundEnabled(false); // 投影PC側はデフォルトで効果音OFF (消音)
      const sync = new FirstArtSyncLinkWireless();
      syncLinkRef.current = sync;

      sync.onReady((generatedRoomId) => {
        setRoomId(generatedRoomId);
        setConnectionStatus('idle');
      });

      sync.onConnect(() => {
        setConnectionStatus('connected');
        // 新しい端末が接続された際、ホスト（PC）側の現在の描画状態を送信して同期
        sync.send({
          type: 'droplets_update',
          droplets: dropletsRef.current,
        });
      });

      sync.onMessage((msg: FirstArtSyncMessage) => {
        if (msg.type === 'pointer_down' || msg.type === 'pointer_move') {
          if (msg.x !== undefined && msg.y !== undefined) {
            applyPaintSpreadAt(msg.x, msg.y);
          }
          playPaintSound();
        } else if (msg.type === 'droplets_update' && msg.droplets) {
          dropletsRef.current = msg.droplets;
          setRerender((v) => v + 1);
        } else if (msg.type === 'palette_change' && msg.paletteIdx !== undefined) {
          setPaletteIdx(msg.paletteIdx);
        } else if (msg.type === 'reset') {
          dropletsRef.current = msg.droplets || generateInitialDroplets();
          particlesRef.current = [];
          ripplesRef.current = [];
          activePointerMap.current.clear();
          setRerender((v) => v + 1);
        }
      });

      sync.startHost();

      const handleBeforeUnload = () => {
        try {
          sync.send({ type: 'host_closed' });
        } catch {}
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        try {
          sync.send({ type: 'host_closed' });
        } catch {}
        sync.close();
        syncLinkRef.current = null;
      };
    }
  }, [vjMode, applyPaintSpreadAt, playPaintSound, generateInitialDroplets]);

  // 🎮 WebRTC コントローラー接続ハンドラー
  const handleConnectAsController = (targetCode: string) => {
    if (!targetCode || targetCode.length !== 4) {
      setErrorMessage('4桁の部屋コードを入力してください');
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');
    setErrorMessage('');
    setReconnectCode(targetCode);

    const sync = new FirstArtSyncLinkWireless();
    syncLinkRef.current = sync;

    sync.onConnect(() => {
      setConnectionStatus('connected');
      setRoomId(targetCode);
    });

    sync.onClose(() => {
      setConnectionStatus('disconnected');
      setErrorMessage('投影モニターが閉じたか通信が切断されました。');
    });

    sync.onError((err) => {
      setConnectionStatus('disconnected');
      setErrorMessage(`部屋ID「${targetCode}」が見つからないか無効です。`);
    });

    sync.onMessage((msg: FirstArtSyncMessage) => {
      if (msg.type === 'host_closed') {
        setConnectionStatus('disconnected');
        setErrorMessage('投影モニターの部屋が閉じられました。');
        if (syncLinkRef.current) {
          syncLinkRef.current.close();
          syncLinkRef.current = null;
        }
      } else if (msg.type === 'palette_change' && msg.paletteIdx !== undefined) {
        setPaletteIdx(msg.paletteIdx);
      } else if (msg.type === 'reset' || msg.type === 'droplets_update') {
        if (msg.droplets) {
          dropletsRef.current = msg.droplets;
        } else if (msg.type === 'reset') {
          dropletsRef.current = generateInitialDroplets();
        }
        particlesRef.current = [];
        ripplesRef.current = [];
        activePointerMap.current.clear();
        setRerender((v) => v + 1);
      }
    });

    sync.connectToHost(targetCode);
  };

  // 👇 タッチ・マウスクリックイベントハンドラー
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (vjMode === 'controller' && connectionStatus !== 'connected') return; // 未接続時は操作全禁止

    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;
    const x = normX;
    const y = 1.0 - normY;

    const seed = Math.random();

    // 🖥️ PC投影画面 (Projection) の場合は点として1点絵の具を置く (混色・拡大は一切せず選択色の点のみ追加)
    if (vjMode === 'projection') {
      addPcPointDroplet(x, y);
      playPaintSound();
      if (syncLinkRef.current) {
        syncLinkRef.current.send({
          type: 'droplets_update',
          droplets: dropletsRef.current,
        });
      }
      return;
    }

    // iPad / Standalone モードの場合は通常通り連続操作 ＋ スプラッシュ粒子
    activePointerMap.current.set(e.pointerId, { lastX: x, lastY: y });
    applyPaintSpreadAt(x, y);
    spawnParticlesAt(normX, normY, seed);
    playPaintSound();

    if (syncLinkRef.current) {
      syncLinkRef.current.send({
        type: 'pointer_down',
        x,
        y,
        normX,
        normY,
        seed,
        droplets: dropletsRef.current,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (vjMode === 'projection') return; // PC投影画面では連続ドラッグ描画を禁止（点で置くため）
    if (vjMode === 'controller' && connectionStatus !== 'connected') return; // 未接続時は操作全禁止
    if (!activePointerMap.current.has(e.pointerId)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;
    const x = normX;
    const y = 1.0 - normY;

    const last = activePointerMap.current.get(e.pointerId)!;
    const moveDist = Math.hypot(x - last.lastX, y - last.lastY);

    if (moveDist > 0.015) {
      activePointerMap.current.set(e.pointerId, { lastX: x, lastY: y });
      applyPaintSpreadAt(x, y);

      if (Math.random() < 0.12) {
        const seed = Math.random();
        spawnParticlesAt(normX, normY, seed);
        playPaintSound();

        if (syncLinkRef.current) {
          syncLinkRef.current.send({
            type: 'pointer_move',
            x,
            y,
            normX,
            normY,
            seed,
          });
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (vjMode === 'projection') return; // PC投影画面では連続ドラッグ描画を禁止
    if (vjMode === 'controller' && connectionStatus !== 'connected') return; // 未接続時は操作全禁止
    activePointerMap.current.delete(e.pointerId);

    if (syncLinkRef.current) {
      syncLinkRef.current.send({
        type: 'droplets_update',
        droplets: dropletsRef.current,
      });
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#03050c',
        fontFamily: '"Outfit", "Inter", system-ui, sans-serif',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* ① 3D WebGL Canvas */}
      <FirstArtCanvas
        paletteIdx={paletteIdx}
        dropletsRef={dropletsRef}
        vjMode={vjMode}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* ② 2D 手元スプラッシュ粒子 Canvas */}
      <ParticleCanvas
        particleCanvasRef={particleCanvasRef}
        particlesRef={particlesRef}
        ripplesRef={ripplesRef}
      />

      {/* ③ 操作コントロール ＆ 状態オーバーレイ */}
      <UIOverlay
        vjMode={vjMode}
        hideUi={hideUi}
        soundEnabled={soundEnabled}
        paletteIdx={paletteIdx}
        selectedColorIdx={selectedColorIdx}
        connectionStatus={connectionStatus}
        roomId={roomId}
        onSetVjMode={setVjMode}
        onSetHideUi={setHideUi}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onSelectPalette={handleSelectPalette}
        onSelectColor={setSelectedColorIdx}
        onResetCanvas={handleReset}
      />

      {/* ④ 初期モード選択 ＆ ワイヤレス接続ダイアログ */}
      {vjMode === 'select' && (
        <ModeSelectModal
          onSelectMode={setVjMode}
          onConnectAsController={handleConnectAsController}
          errorMessage={errorMessage}
        />
      )}

      {/* ⑤ iPad コントローラー モードの接続待機・切断時 再接続ダイアログ */}
      {vjMode === 'controller' && connectionStatus !== 'connected' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 90,
            backgroundColor: 'rgba(3, 5, 12, 0.88)',
            backdropFilter: 'blur(24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '440px',
              width: '100%',
              background: 'rgba(15, 23, 42, 0.95)',
              border: connectionStatus === 'disconnected' ? '1px solid rgba(255, 112, 166, 0.5)' : '1px solid rgba(0, 242, 254, 0.4)',
              borderRadius: '24px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8)',
              color: '#ffffff',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>
              {connectionStatus === 'connecting' ? '⏳' : '📡'}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: connectionStatus === 'disconnected' ? '#ff70a6' : '#00f2fe', margin: '0 0 8px 0' }}>
              {connectionStatus === 'connecting'
                ? '投影モニターへ接続中...'
                : '部屋が無効か切断されました'}
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '24px' }}>
              {errorMessage || '新しい部屋IDを入力して再接続してください。'}
            </p>

            {connectionStatus !== 'connecting' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (syncLinkRef.current) {
                      syncLinkRef.current.close();
                      syncLinkRef.current = null;
                    }
                    handleConnectAsController(reconnectCode);
                  }}
                  style={{ display: 'flex', gap: '10px' }}
                >
                  <input
                    type="text"
                    maxLength={4}
                    value={reconnectCode}
                    onChange={(e) => setReconnectCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (syncLinkRef.current) {
                          syncLinkRef.current.close();
                          syncLinkRef.current = null;
                        }
                        handleConnectAsController(reconnectCode);
                      }
                    }}
                    placeholder="例: 7842"
                    style={{
                      padding: '12px 18px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      background: '#0f172a',
                      color: '#ffffff',
                      fontSize: '20px',
                      fontWeight: 800,
                      letterSpacing: '4px',
                      textAlign: 'center',
                      width: '150px',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '12px 20px',
                      borderRadius: '14px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #ff70a6 0%, #ff9770 100%)',
                      color: '#000',
                      fontSize: '14px',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    再接続 🚀
                  </button>
                </form>

                <button
                  onClick={() => {
                    if (syncLinkRef.current) {
                      syncLinkRef.current.close();
                      syncLinkRef.current = null;
                    }
                    setVjMode('select');
                    setConnectionStatus('idle');
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  ⚙️ モード選択へ戻る
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
