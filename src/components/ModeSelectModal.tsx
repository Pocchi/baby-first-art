/**
 * ============================================================================
 * ⚙️ ModeSelectModal コンポーネント (モード選択・ワイヤレス接続入力ダイアログ)
 * ============================================================================
 */

import React, { useState } from 'react';
import { Mode } from '../types/firstArt';

interface ModeSelectModalProps {
  onSelectMode: (mode: Mode) => void;
  onConnectAsController: (code: string) => void;
  errorMessage: string;
}

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

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 100,
        backgroundColor: 'rgba(3, 5, 12, 0.92)',
        backdropFilter: 'blur(30px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '850px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 112, 166, 0.3)',
          borderRadius: '28px',
          padding: '36px',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.8)',
          color: '#ffffff',
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
            onClick={() => onSelectMode('projection')}
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
              大画面モニターやプロジェクター用。4桁コードを発行し、ボタンのない全画面で表示します。
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
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                maxLength={4}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
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
                onClick={handleConnectSubmit}
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
            </div>
            {errorMessage && <p style={{ color: '#ff4b5c', fontSize: '13px', marginTop: '10px' }}>{errorMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
