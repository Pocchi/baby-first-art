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
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          minHeight: '100dvh',
          zIndex: 100,
          backgroundColor: 'rgba(3, 5, 12, 0.94)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 'calc(env(safe-area-inset-top, 16px) + 20px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 60px)',
          paddingLeft: '16px',
          paddingRight: '16px',
          overflowY: 'auto',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '850px',
            width: '100%',
            margin: '0 auto',
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid rgba(255, 112, 166, 0.35)',
            borderRadius: '24px',
            padding: '28px 20px',
            boxShadow: '0 30px 90px rgba(0, 0, 0, 0.85)',
            color: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#ff70a6', margin: '0 0 8px 0' }}>
              baby first art
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
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ff70a6', margin: '0 0 8px 0' }}>
                コントローラー
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
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#00f2fe', margin: '0 0 8px 0' }}>
                モニター
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
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: '0 0 8px 0' }}>
                単体スタンドアロン
              </h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                通信を使用せず、この端末単体でアートキャンバスをプレイします。
              </p>
            </div>
          </div>

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
              <strong>iPad の場合:</strong> Safari の共有ボタン ➔ 「ホーム画面に追加」でアドレスバーのないネイティブアプリとしてインストールできます。
            </div>
            <div>
              <strong>PC の場合:</strong> Chrome / Edge のアドレスバー右側にある「アプリとしてインストール」ボタンから、ブラウザ枠なしで全画面起動できます。
            </div>
          </div>
        </div>
      </div>

      {/* 📡 コントローラー接続用 専用ポップアップモーダル */}
      {selectedCard === 'controller' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            zIndex: 110,
            backgroundColor: 'rgba(3, 5, 12, 0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              maxWidth: '440px',
              width: '100%',
              background: 'rgba(15, 23, 42, 0.98)',
              border: '1px solid rgba(255, 112, 166, 0.5)',
              borderRadius: '24px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9)',
              color: '#ffffff',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>📡</div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#ff70a6', margin: '0 0 8px 0' }}>
              投影モニターに接続
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '24px' }}>
              プロジェクター・モニター画面に表示されている<br />
              <strong style={{ color: '#ffcd75' }}>4桁の部屋コード</strong> を入力してください。
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConnectSubmit();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}
            >
              <input
                type="text"
                maxLength={4}
                autoFocus
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
                  padding: '14px 20px',
                  borderRadius: '16px',
                  border: '2px solid rgba(255, 112, 166, 0.6)',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: 900,
                  letterSpacing: '6px',
                  textAlign: 'center',
                  width: '180px',
                  boxShadow: '0 0 20px rgba(255, 112, 166, 0.2)',
                  outline: 'none',
                }}
              />

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff70a6 0%, #ff9770 100%)',
                  color: '#000000',
                  fontSize: '16px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(255, 112, 166, 0.35)',
                }}
              >
                送信機として接続 🚀
              </button>
            </form>

            {errorMessage && (
              <p style={{ color: '#ff4b5c', fontSize: '13px', marginTop: '16px', fontWeight: 600 }}>
                {errorMessage}
              </p>
            )}

            <button
              onClick={() => setSelectedCard('none')}
              style={{
                marginTop: '20px',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'transparent',
                color: '#94a3b8',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ← モード選択に戻る
            </button>
          </div>
        </div>
      )}
    </>
  );
};
