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

    // 2Dアニメーションループ
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ① 波紋リング描画
      const ripples = ripplesRef.current || [];
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 6;
        r.alpha *= 0.91;
        if (r.alpha < 0.02) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 5;
        ctx.globalAlpha = r.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = r.color;
        ctx.stroke();
        ctx.restore();
      }

      // ② 2Dスプラッシュ粒子描画
      const particles = particlesRef.current || [];
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // 重力加速度
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
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;

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
          ctx.font = `${Math.floor(p.size * 1.4)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✨', 0, 0);
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
