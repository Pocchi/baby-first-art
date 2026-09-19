/**
 * ============================================================================
 * 🎨 Baby's First Art - 型定義モジュール (TypeScript Definitions)
 * ============================================================================
 */

import * as THREE from 'three';

/** 2Dキャンバス上を飛び散る粒子（手元限定スプラッシュ） */
export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'star' | 'heart' | 'circle' | 'sparkle';
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
}

/** タッチ波紋リング */
export interface Ripple {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
}

/** アクリル絵の具ドロップ（キャンバス上の絞り出し絵の具） */
export interface Droplet {
  x: number;
  y: number;
  r: number;
  colorIdx: number;
}

/** 動作モード */
export type Mode = 'select' | 'standalone' | 'controller' | 'projection';

/** カラーパレット型 */
export interface ColorPalette {
  name: string;
  hexes: string[];
  colors: THREE.Color[];
}
