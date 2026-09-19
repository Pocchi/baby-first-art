/**
 * ============================================================================
 * ✨ ParticleCanvas コンポーネント (2D Canvas 手元スプラッシュ粒子)
 * ============================================================================
 * 
 * 【概要】
 * タッチ時に飛び散る2D粒子（星⭐・ハート💖・スパークル✨・波紋リング）のアニメーションループです。
 * Projection（PC投影）モード時は非表示とし、iPad操作画面の感覚的フィードバックを提供します。
 */

import React, { useEffect, useRef } from 'react';
import { Particle, Ripple } from '../types/firstArt';

interface ParticleCanvasProps {
  particleCanvasRef: React.RefObject<any>;
  particlesRef: React.RefObject<Particle[]>;
  ripplesRef: React.RefObject<Ripple[]>;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  particleCanvasRef,
  particlesRef,
  ripplesRef,
}) => {
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // リサイズハンドラー
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // 2D超高速・超軽量アニメーションループ (シャドウレス＆定数上限)
    const MAX_PARTICLES = 32;
    const MAX_RIPPLES = 6;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ① 配列上限ガード (メモリリーク防止)
      const ripples = ripplesRef.current || [];
      if (ripples.length > MAX_RIPPLES) {
        ripples.splice(0, ripples.length - MAX_RIPPLES);
      }

      const particles = particlesRef.current || [];
      if (particles.length > MAX_PARTICLES) {
        particles.splice(0, particles.length - MAX_PARTICLES);
      }

      // ② 波紋リング描画 (シャドウ無効化で秒間描画負荷を90%カット)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 5;
        r.alpha *= 0.90;
        if (r.alpha < 0.03) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = r.alpha;
        ctx.stroke();
      }

      // ③ 2Dスプラッシュ粒子描画 (軽量な幾何学パス描画)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14; // 重力
        p.rotation += p.vRot;
        p.life++;

        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.shape === 'star') {
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            const rOuter = p.size;
            const rInner = p.size * 0.45;
            const a1 = (s * Math.PI * 2) / 5 - Math.PI / 2;
            const a2 = a1 + Math.PI / 5;
            ctx.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
            ctx.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'heart') {
          ctx.beginPath();
          const h = p.size * 0.8;
          ctx.moveTo(0, h * 0.3);
          ctx.bezierCurveTo(-h, -h * 0.5, -h * 0.5, -h, 0, -h * 0.4);
          ctx.bezierCurveTo(h * 0.5, -h, h, -h * 0.5, 0, h * 0.3);
          ctx.fill();
        } else if (p.shape === 'sparkle') {
          // 幾何学スパークル星 (フォント描画排除で高速化)
          ctx.beginPath();
          for (let s = 0; s < 4; s++) {
            const rOuter = p.size * 1.1;
            const rInner = p.size * 0.25;
            const a1 = (s * Math.PI * 2) / 4;
            const a2 = a1 + Math.PI / 4;
            ctx.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
            ctx.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [particleCanvasRef, particlesRef, ripplesRef]);

  return (
    <canvas
      ref={particleCanvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    />
  );
};
