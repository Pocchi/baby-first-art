import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 📱 PWA Service Worker 登録 (オフライン動作 ＆ インストール可能化)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('[PWA] Service Worker registration failed:', err);
    });
  });
}

// 👶 赤ちゃん誤操作ガード（右クリック・長押しメニュー・ピンチズーム・ダブルタップ防止）
if (typeof window !== 'undefined') {
  // 1. 長押しコンテキストメニュー / 右クリック防止
  window.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });

  // 2. Safari iOS ピンチズーム（gesturestart / gesturechange）防止
  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });

  // 3. ダブルタップによるズーム防止
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
