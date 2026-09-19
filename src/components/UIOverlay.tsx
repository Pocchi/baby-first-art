/**
 * ============================================================================
 * 🎛️ UIOverlay コンポーネント (操作バッジ・フロートコントロールパネル)
 * ============================================================================
 */

import React from 'react';
import { Mode } from '../types/firstArt';

interface UIOverlayProps {
  vjMode: Mode;
  hideUi: boolean;
  soundEnabled: boolean;
  showFrame: boolean;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'disconnected';
  roomId: string;
  onSetVjMode: (mode: Mode) => void;
  onSetHideUi: (hide: boolean) => void;
  onToggleSound: () => void;
  onToggleFrame: () => void;
  onResetCanvas: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  vjMode,
  hideUi,
  soundEnabled,
  showFrame,
  connectionStatus,
  roomId,
  onSetVjMode,
  onSetHideUi,
  onToggleSound,
  onToggleFrame,
  onResetCanvas,
}) => {
  return (
    <>
      {/* 木の額縁フレーム */}
      {showFrame && (
        <div
          style={{
            position: 'absolute',
            top: '5%',
            left: '5%',
            width: '90%',
            height: '90%',
            border: '28px solid #8b5a2b',
            borderRadius: '16px',
            boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.8), 0 30px 80px rgba(0,0,0,0.9)',
            pointerEvents: 'none',
            zIndex: 25,
          }}
        >
          {!hideUi && (
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '25px',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontFamily: '"Caveat", cursive, serif',
                color: '#333',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              Baby&apos;s First Art 🎨
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 👁️ UI オーバーレイ (hideUi === false 時) */}
      {/* ------------------------------------------------------------- */}
      {!hideUi && vjMode !== 'select' && (
        <>
          {/* 左上モード変更ボタン */}
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

          {/* WebRTC 接続状態バッジ */}
          {(vjMode === 'projection' || vjMode === 'controller') && (
            <div
              style={{
                position: 'absolute',
                top: '72px',
                left: '20px',
                zIndex: 30,
                padding: '8px 16px',
                borderRadius: '14px',
                background: connectionStatus === 'connected' ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255, 180, 0, 0.25)',
                border: `1px solid ${connectionStatus === 'connected' ? '#00f2fe' : '#ffb400'}`,
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{connectionStatus === 'connected' ? '📡 同期接続中' : '⏳ 接続待機中...'}</span>
              {roomId && <span style={{ background: '#000', padding: '2px 8px', borderRadius: '6px', color: '#ffcd75' }}>部屋ID: {roomId}</span>}
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

            {/* 額縁トグル */}
            <button
              onClick={onToggleFrame}
              style={{
                padding: '8px 16px',
                borderRadius: '14px',
                border: 'none',
                background: showFrame ? '#ffbe00' : 'rgba(255, 255, 255, 0.15)',
                color: showFrame ? '#000' : '#fff',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {showFrame ? '🖼️ 額縁をはずす' : '🖼️ 額縁にかざる'}
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
            border: '1px solid rgba(255, 255, 255, 0.2)',
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
