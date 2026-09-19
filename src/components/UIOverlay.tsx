/**
 * ============================================================================
 * 🎛️ UIOverlay コンポーネント (操作バッジ・フロートコントロールパネル・QRコード)
 * ============================================================================
 */

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Mode } from '../types/firstArt';

interface UIOverlayProps {
  vjMode: Mode;
  hideUi: boolean;
  soundEnabled: boolean;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'disconnected';
  roomId: string;
  onSetVjMode: (mode: Mode) => void;
  onSetHideUi: (hide: boolean) => void;
  onToggleSound: () => void;
  onResetCanvas: () => void;
}

const toggleFullScreen = () => {
  if (typeof document === 'undefined') return;
  if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
    const elem = document.documentElement as any;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    }
  }
};

export const UIOverlay: React.FC<UIOverlayProps> = ({
  vjMode,
  hideUi,
  soundEnabled,
  connectionStatus,
  roomId,
  onSetVjMode,
  onSetHideUi,
  onToggleSound,
  onResetCanvas,
}) => {
  // QRコード用URL (現在ページのオリジン + パス + ?room=部屋ID)
  const connectionUrl = typeof window !== 'undefined' && roomId
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : '';

  // 📱 iPad (Controllerモード): 「部屋ID: XXXX」の控えめな表示のみ
  if (vjMode === 'controller') {
    return (
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 30,
          padding: '6px 12px',
          borderRadius: '10px',
          background: 'rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#cbd5e1',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          opacity: 0.65,
          pointerEvents: 'none',
        }}
      >
        部屋ID: {roomId || '----'}
      </div>
    );
  }

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* 👁️ UI オーバーレイ (hideUi === false 時) */}
      {/* ------------------------------------------------------------- */}
      {!hideUi && vjMode !== 'select' && (
        <>
          {/* 左上モード変更 ＆ 全画面切り替えボタン */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 30,
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => onSetVjMode('select')}
              style={{
                padding: '10px 18px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffcd75',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ⚙️ モード変更
            </button>

            <button
              onClick={toggleFullScreen}
              style={{
                padding: '10px 18px',
                borderRadius: '16px',
                background: 'rgba(0, 242, 254, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                color: '#00f2fe',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ⛶ 全画面切替
            </button>
          </div>

          {/* 右上タイトルバッジ ＆ UI隠しボタン */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 30,
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => onSetHideUi(true)}
              style={{
                padding: '10px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 112, 166, 0.25)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 112, 166, 0.5)',
                color: '#ff70a6',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              👁️ UIを隠す (全画面)
            </button>

            <div
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 112, 166, 0.4)',
                color: '#ff70a6',
                fontWeight: 800,
                fontSize: '14px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🎨</span> 赤ちゃんのファーストアート GLSL
            </div>
          </div>

          {/* 📡 投影モニター用 QRコード ＆ 接続案内カード (Projection モード時) */}
          {vjMode === 'projection' && roomId && (
            <div
              style={{
                position: 'absolute',
                top: '72px',
                left: '20px',
                zIndex: 30,
                padding: '18px 22px',
                borderRadius: '24px',
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(0, 242, 254, 0.4)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                maxWidth: '240px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: connectionStatus === 'connected' ? '#00f2fe' : '#ffcd75',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{connectionStatus === 'connected' ? '📡 同期接続完了！' : '📱 iPadのカメラで読み取って接続'}</span>
              </div>

              {/* QRコードを表示 (白背景でスキャン精度向上) */}
              {connectionUrl && (
                <div
                  style={{
                    background: '#ffffff',
                    padding: '12px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <QRCodeSVG
                    value={connectionUrl}
                    size={140}
                    bgColor="#ffffff"
                    fgColor="#03050c"
                    level="M"
                  />
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  または手動入力
                </span>
                <span
                  style={{
                    background: '#000000',
                    border: '1px solid rgba(255, 205, 117, 0.4)',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    color: '#ffcd75',
                    fontSize: '15px',
                    fontWeight: 900,
                    letterSpacing: '2px',
                  }}
                >
                  部屋ID: {roomId}
                </span>
              </div>
            </div>
          )}

          {/* 下部フロート操作パネル */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 30,
              padding: '14px 22px',
              borderRadius: '24px',
              background: 'rgba(10, 15, 30, 0.85)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              maxWidth: '92vw',
              overflowX: 'auto',
              color: '#ffffff',
            }}
          >
            {/* 音声ON/OFF */}
            <button
              onClick={onToggleSound}
              style={{
                padding: '8px 16px',
                borderRadius: '14px',
                border: soundEnabled ? '1px solid #ff70a6' : '1px solid rgba(255,255,255,0.2)',
                background: soundEnabled ? 'rgba(255, 112, 166, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                color: soundEnabled ? '#ff70a6' : '#888',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {soundEnabled ? '🔊 音ON' : '🔇 音OFF'}
            </button>

            {/* キャンバスリセット */}
            <button
              onClick={onResetCanvas}
              style={{
                padding: '8px 16px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                color: '#000',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(0, 242, 254, 0.4)',
              }}
            >
              ✨ 新しいキャンバス
            </button>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 👁️ UI表示ボタン (UI隠し時) */}
      {/* ------------------------------------------------------------- */}
      {hideUi && (
        <button
          onClick={() => onSetHideUi(false)}
          title="UIを表示 (Hキー / Spaceキーでも可能)"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 40,
            padding: '10px 14px',
            borderRadius: '50px',
            background: 'rgba(10, 15, 30, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 112, 166, 0.4)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            opacity: 0.6,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
        >
          👁️ UIを表示
        </button>
      )}
    </>
  );
};
