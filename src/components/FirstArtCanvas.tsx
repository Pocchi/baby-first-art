/**
 * ============================================================================
 * 🖼️ FirstArtCanvas コンポーネント (React Three Fiber 3D Canvas)
 * ============================================================================
 * 
 * 【概要】
 * GLSLシェーダーメッシュを Three.js Canvas 内で描画し、
 * 毎フレーム（60FPS）uniforms（時間 `uTime` や絵の具座標 `uDroplets`）を動的に更新します。
 */

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FirstArtShader } from '../shaders/firstArtShader';
import { COLOR_PALETTES } from '../constants/palettes';
import { Droplet, Mode } from '../types/firstArt';

interface FirstArtMeshProps {
  paletteIdx: number;
  dropletsRef: React.RefObject<Droplet[]>;
}

/** 毎フレーム Uniforms を更新する内部メッシュコンポーネント */
const FirstArtMesh = ({ paletteIdx, dropletsRef }: FirstArtMeshProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Uniforms 初期構築
  const uniforms = useMemo(() => {
    const dropVecs = Array.from({ length: 32 }, () => new THREE.Vector4(0, 0, 0, 0));
    const activePalette = COLOR_PALETTES[0].colors;
    const paletteVecs = activePalette.map((c) => c.clone());

    return {
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uTime: { value: 0.0 },
      uDroplets: { value: dropVecs },
      uDropletCount: { value: 0 },
      uPalette: { value: paletteVecs },
    };
  }, []);

  // 60FPS レンダリングループ
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(state.size.width, state.size.height);
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

      // アクティブなカラーパレットの適用
      const targetPalette = COLOR_PALETTES[paletteIdx % COLOR_PALETTES.length] || COLOR_PALETTES[0];
      const activePalette = targetPalette.colors;
      const uPaletteVecs = materialRef.current.uniforms.uPalette.value as THREE.Color[];
      for (let i = 0; i < 4; i++) {
        uPaletteVecs[i].copy(activePalette[i]);
      }

      // 絵の具ドロップ配列の更新
      const currentDroplets = dropletsRef.current || [];
      const dropVecs = materialRef.current.uniforms.uDroplets.value as THREE.Vector4[];
      const count = Math.min(32, currentDroplets.length);
      materialRef.current.uniforms.uDropletCount.value = count;

      for (let i = 0; i < 32; i++) {
        if (i < count) {
          const d = currentDroplets[i];
          dropVecs[i].set(d.x, d.y, d.r, d.colorIdx);
        } else {
          dropVecs[i].set(0, 0, 0, 0);
        }
      }
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={FirstArtShader.vertexShader}
        fragmentShader={FirstArtShader.fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

interface FirstArtCanvasProps {
  paletteIdx: number;
  dropletsRef: React.RefObject<Droplet[]>;
  vjMode: Mode;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
}

/** WebGL R3F Canvas 外枠ラップコンポーネント */
export const FirstArtCanvas: React.FC<FirstArtCanvasProps> = ({
  paletteIdx,
  dropletsRef,
  vjMode,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) => {
  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: vjMode === 'projection' ? 'default' : 'pointer',
        zIndex: 10,
        pointerEvents: vjMode === 'projection' ? 'none' : 'auto', // 投影PC時はマウスタッチ全無効化
      }}
    >
      <Canvas camera={{ position: [0, 0, 1] }} style={{ width: '100%', height: '100%', display: 'block' }}>
        <FirstArtMesh paletteIdx={paletteIdx} dropletsRef={dropletsRef} />
      </Canvas>
    </div>
  );
};
