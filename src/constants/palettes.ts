/**
 * ============================================================================
 * 🎨 カラーパレット ＆ ホログラムパーティクル定数定義
 * ============================================================================
 */

import * as THREE from 'three';
import { ColorPalette } from '../types/firstArt';

/** パレット生成ヘルパー */
export function createPalette(name: string, hexes: string[]): ColorPalette {
  return {
    name,
    hexes,
    colors: hexes.map((hex) => new THREE.Color(hex)),
  };
}

/** アクリル絵の具カラーパレット定義 */
export const COLOR_PALETTES: ColorPalette[] = [
  createPalette('🌊 オーシャンブリーズ', [
    '#00b4d8', // ブライトシアン
    '#f4f8fc', // プラチナシルバーパールホワイト
    '#7209b7', // ロイヤルバイオレット
    '#48cae4', // アイスブルー
  ]),

  /* 💡 今後新しいカラーパレットを追加する際は以下をアンコメントして追加可能です
  createPalette('👑 ロイヤルゴールド＆シルバー', ['#ffd700', '#e0e0e0', '#b76e79', '#f7e7ce']),
  createPalette('🌸 パステルキャンディ', ['#ff70a6', '#ff9770', '#ffd670', '#70d6ff']),
  */
];

/** 2Dスプラッシュ粒子の独立ホログラムカラー配列 */
export const HOLOGRAM_PARTICLE_COLORS = [
  '#00f2fe',
  '#ffd700',
  '#ff70a6',
  '#a8ff78',
  '#ffffff',
  '#e0e0e0',
  '#b76e79',
];
