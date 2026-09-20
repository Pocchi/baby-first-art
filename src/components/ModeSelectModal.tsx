/**
 * ============================================================================
 * ⚙️ ModeSelectModal コンポーネント (モード選択・ワイヤレス接続入力ダイアログ)
 * ============================================================================
 */

import React, { useState } from 'react';
import { Mode } from '../types/firstArt';
import { normalizeRoomCode } from './firstArtSyncLinkWireless';

interface ModeSelectModalProps {
  onSelectMode: (mode: Mode) => void;
  onConnectAsController: (code: string) => void;
  errorMessage: string;
}

const requestFullScreen = () => {
  if (typeof document === 'undefined') return;
  const elem = document.documentElement as any;
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch(() => {});
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
};

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  onSelectMode,
  onConnectAsController,
  errorMessage,
}) => {
  const [selectedCard, setSelectedCard] = useState<'none' | 'controller'>('none');
  const [inputCode, setInputCode] = useState<string>('');

  const handleConnectSubmit = () => {
    onSelectMode('controller');
    onConnectAsController(inputCode);
  };

  const handleSelectProjection = () => {
    requestFullScreen();
    onSelectMode('projection');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 100,
        backgroundColor: 'rgba(3, 5, 12, 0.94)',
        backdropFilter: 'blur(30px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        style={{
          maxWidth: '850px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(255, 112, 166, 0.35)',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.85)',
          color: '#ffffff',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>🎨 📡</span>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#ff70a6', margin: '0 0 8px 0' }}>
            ファーストアート WebRTC VJ スタジオ
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            iPadなどのタッチ端末と投影モニターをワイヤレスで同期し、大画面でアート体験を楽しめます。
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {/* モード1: コントローラー */}
          <div
            onClick={() => setSelectedCard('controller')}
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: selectedCard === 'controller' ? 'rgba(255, 112, 166, 0.2)' : 'rgba(30, 41, 59, 0.8)',
              border: selectedCard === 'controller' ? '2px solid #ff70a6' : '1px solid rgba(255, 112, 166, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎮</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ff70a6', margin: '0 0 8px 0' }}>
              操作端末 (Controller)
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
              iPadやスマホ等の手元用。タッチした描画信号をモニターにリアルタイム送信します。
            </p>
          </div>

          {/* モード2: プロジェクター投影 */}
          <div
            onClick={handleSelectProjection}
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '2px solid rgba(0, 242, 254, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🖥️</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#00f2fe', margin: '0 0 8px 0' }}>
              投影モニター (Projection)
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
              大画面モニターやプロジェクター用。4桁コードを発行し、全画面で自動表示します。
            </p>
          </div>

          {/* モード3: 単体独立 */}
          <div
            onClick={() => onSelectMode('standalone')}
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📱</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: '0 0 8px 0' }}>
              単体スタンドアロン
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
              通信を使用せず、この端末単体でアートキャンバスをプレイします。
            </p>
          </div>
        </div>

        {/* 接続コード入力エリア (操作端末モード選択時) */}
        {selectedCard === 'controller' && (
          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ fontSize: '15px', color: '#ffcd75', marginBottom: '12px' }}>
              📡 投影モニターの 4桁部屋コード を入力
            </h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConnectSubmit();
              }}
              style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}
            >
              <input
                type="text"
                maxLength={4}
                value={inputCode}
                onChange={(e) => setInputCode(normalizeRoomCode(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConnectSubmit();
                  }
                }}
                placeholder="例: 7842"
                style={{
                  padding: '12px 18px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: 800,
                  letterSpacing: '4px',
                  textAlign: 'center',
                  width: '160px',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff70a6 0%, #ff9770 100%)',
                  color: '#000',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                送信機として接続 🚀
              </button>
            </form>
            {errorMessage && <p style={{ color: '#ff4b5c', fontSize: '13px', marginTop: '10px' }}>{errorMessage}</p>}
          </div>
        )}

        {/* 💡 PWA アプリ化案内ガイド */}
        <div
          style={{
            marginTop: '28px',
            padding: '16px 20px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '12px',
            color: '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontWeight: 800, color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡 PWAアプリ化ガイド（全画面表示 ＆ 赤ちゃん誤操作ガード）</span>
          </div>
          <div>
            <strong>📱 iPad の場合:</strong> Safari の共有ボタン ➔ 「ホーム画面に追加」でアドレスバーのないネイティブアプリとしてインストールできます。
          </div>
          <div>
            <strong>🖥️ PC の場合:</strong> Chrome / Edge のアドレスバー右側にある「アプリとしてインストール」ボタンから、ブラウザ枠なしで全画面起動できます。
          </div>
        </div>
      </div>
    </div>
  );
};
