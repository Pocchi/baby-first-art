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

/** アクリル絵の具カラーパレット定義 (各パレット: 基本4色 ＋ 差し色2色) */
export const COLOR_PALETTES: ColorPalette[] = [
  createPalette('🌊 オーシャン', [
    '#00b4d8', // ブライトシアン
    '#48cae4', // アイスブルー
    '#7209b7', // ロイヤルバイオレット
    '#f4f8fc', // プラチナパール
    '#ff70a6', // ✨ 差し色1: サンセットコーラルピンク
    '#ffd700', // ✨ 差し色2: サンシャインゴールド
  ]),
  createPalette('🌸 パステル', [
    '#ff70a6', // ネオンピンク
    '#ff9770', // コーラルオレンジ
    '#ffd670', // サンシャインイエロー
    '#70d6ff', // スカイブルー
    '#9b5de5', // ✨ 差し色1: ビビッドパープル
    '#00f2fe', // ✨ 差し色2: エレクトリックシアン
  ]),
  createPalette('👑 ロイヤル', [
    '#ffd700', // ゴールド
    '#ffffff', // ホワイト
    '#b76e79', // ローズゴールド
    '#9b5de5', // パープル
    '#ff3366', // ✨ 差し色1: クリムゾンルビー
    '#00f2fe', // ✨ 差し色2: サファイアブルー
  ]),
  createPalette('🌿 オーロラ', [
    '#00f2fe', // ネオンブルー
    '#4facfe', // シアン
    '#a8ff78', // ライムグリーン
    '#78ffd6', // ミントグリーン
    '#ff70a6', // ✨ 差し色1: マゼンタローズ
    '#ffd700', // ✨ 差し色2: アンバーゴールド
  ]),
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
