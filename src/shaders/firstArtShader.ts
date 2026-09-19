/**
 * ============================================================================
 * 🌌 GLSL Custom Fragment Shader - アクリル絵の具 ＋ 混色 ＋ ホログラムラメ
 * ============================================================================
 * 
 * 【シェーダーの処理概要】
 * 1. Simplex Noise / FBM (Fractal Brownian Motion):
 *    - 絵の具の輪郭を煙のように優美にゆらめかせるドメインワープノイズ
 * 2. 3D Dollop Dome Specular Highlight:
 *    - 絞り出したアクリル絵の具の盛り上がりドーム（法線計算 ＋ 白銀感ハイライト）
 * 3. Holographic Glitter Sparkles:
 *    - キラカード風の十字・星型ホログラム粒子とマルチカラー偏光スペクトル
 */

export const FirstArtShader = {
  /** 頂点シェーダー (Vertex Shader): プレーン全体にUV座標を渡す */
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,

  /** フラグメントシェーダー (Fragment Shader): 画面各ピクセルの混色・ツヤ・ラメ計算 */
  fragmentShader: `
    uniform vec2 uResolution;    // 画面解像度 (px)
    uniform float uTime;         // 経過時間 (秒)
    uniform vec4 uDroplets[32];  // ドロップ座標 (x, y, radius, colorIndex)
    uniform int uDropletCount;   // アクティブなドロップ数
    uniform vec3 uPalette[6];    // アクリル絵の具パレット (RGB Vector3 × 6色: 基本4色 ＋ 差し色2色)

    varying vec2 vUv;

    // -------------------------------------------------------------------
    // 2D Simplex Noise 算術関数 (高品質かつ高速なノイズ生成)
    // -------------------------------------------------------------------
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ) );
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // FBM (Fractal Brownian Motion: 多重重なりノイズ)
    float fbm(vec2 p) {
      float total = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 4; i++) {
        total += snoise(p) * amp;
        p *= 2.02;
        amp *= 0.5;
      }
      return total;
    }

    void main() {
      vec2 uv = vUv;
      vec2 aspectUv = uv; // 画面相対座標 (0.0 ~ 1.0)

      // ① 超低速スモークゆらめきドメイン歪み (ゆらめき速度 0.01 / 振幅 0.005)
      vec2 smokeNoise = vec2(
        snoise(aspectUv * 1.5 + vec2(uTime * 0.01, uTime * 0.008)),
        snoise(aspectUv * 1.5 + vec2(-uTime * 0.008, uTime * 0.01))
      );
      vec2 distortedUv = aspectUv + smokeNoise * 0.005;

      float noiseValue = fbm(distortedUv * 3.5);
      distortedUv += vec2(noiseValue * 0.015);

      // ② 漆黒キャンバス背景 (#03050c)
      vec3 canvasBaseColor = vec3(0.04, 0.05, 0.08); 
      vec3 finalPaintColor = canvasBaseColor;
      float totalPaintAlpha = 0.0;
      float paintThickness = 0.0;

      // ③ アクリル絵の具ドロップの混色 ＋ 3D立体ドーム法線ハイライト演算
      for (int i = 0; i < 32; i++) {
        if (i >= uDropletCount) break;

        vec4 drop = uDroplets[i];
        float currentRadius = drop.z;
        if (currentRadius <= 0.001) continue;

        vec2 dropPos = drop.xy;
        float distToDrop = distance(distortedUv, dropPos);

        // 絵の具の波打ち輪郭ノイズ
        float blobEdgeNoise = fbm(distortedUv * 10.0 + float(i) * 3.1) * 0.035;
        float effectiveDist = distToDrop + blobEdgeNoise;

        if (effectiveDist < currentRadius) {
          float alpha = smoothstep(currentRadius, currentRadius * 0.55, effectiveDist);
          int colorIdx = int(drop.w);
          vec3 dropColor = uPalette[colorIdx % 6];

          // 3Dドーム状盛り上がりの高さと法線ベクトル算出
          float normDist = clamp(effectiveDist / currentRadius, 0.0, 1.0);
          float domeHeight = sqrt(max(0.0, 1.0 - normDist * normDist));

          vec2 normDir = (distortedUv - dropPos) / (currentRadius + 0.0001);
          vec3 dollopNormal = normalize(vec3(normDir, domeHeight * 0.95));
          vec3 lightDir = normalize(vec3(-0.4, 0.6, 0.7));
          float dollopSpec = pow(max(0.0, dot(dollopNormal, lightDir)), 14.0) * 0.4 * alpha;

          // 白銀感プラチナハイライト
          float brightColorFactor = smoothstep(0.75, 0.98, (dropColor.r + dropColor.g + dropColor.b) / 3.0);
          vec3 silverPlatinumSpec = mix(vec3(dollopSpec), vec3(0.9, 1.05, 1.25) * dollopSpec * 1.6, brightColorFactor);

          vec3 richColor = dropColor + silverPlatinumSpec;

          // ドメインワープによる絵の具の美しいブレンド（混色）
          if (totalPaintAlpha < 0.01) {
            finalPaintColor = richColor;
            totalPaintAlpha = alpha;
            paintThickness = alpha * (0.8 + domeHeight * 0.4);
          } else {
            float mixFactor = alpha / (totalPaintAlpha + alpha);
            finalPaintColor = mix(finalPaintColor, richColor, mixFactor);
            totalPaintAlpha = clamp(totalPaintAlpha + alpha * 0.7, 0.0, 1.0);
            paintThickness += alpha * (0.7 + domeHeight * 0.3);
          }
        }
      }

      // キャンバス生地の微細織り目模様
      float weave = sin(uv.x * 450.0) * sin(uv.y * 450.0) * 0.02;
      vec3 resultColor = mix(canvasBaseColor + vec3(weave), finalPaintColor, totalPaintAlpha);

      // 全体環境光スペキュラー
      if (totalPaintAlpha > 0.1) {
        vec2 lightPos = vec2(0.3, 0.8);
        float lightDist = distance(uv, lightPos);
        float specular = pow(max(0.0, 1.0 - lightDist * 1.2), 8.0) * 0.3 * clamp(paintThickness, 0.0, 1.0);
        resultColor += vec3(specular);
      }

      // ④ キラカード風ホログラムラメ粒子 (Foil Sparkles & Rainbow Hologram)
      if (totalPaintAlpha > 0.12) {
        vec2 glitterUv = aspectUv * 320.0;
        vec2 gCell = floor(glitterUv);
        vec2 gLocal = fract(glitterUv) - 0.5;
        float glitterHash = fract(sin(dot(gCell, vec2(12.9898, 78.233))) * 43758.5453);

        float sweepPhase = (aspectUv.x + aspectUv.y * 1.1) * 3.0 - uTime * 0.8;
        float sweepLight = pow(clamp(sin(sweepPhase + glitterHash * 3.14), 0.0, 1.0), 6.0);

        // 七色偏光スペクトル
        vec3 rainbowColor = 0.5 + 0.5 * cos(6.28318 * (vec3(1.0) * (glitterHash * 2.0 + aspectUv.x * 1.5 + uTime * 0.2) + vec3(0.0, 0.33, 0.67)));

        // 十字・星型ラメ形状
        float starShape = clamp(1.0 - length(gLocal) * 2.4, 0.0, 1.0);
        float crossShape = pow(max(0.0, 1.0 - abs(gLocal.x) * 3.8), 4.0) + pow(max(0.0, 1.0 - abs(gLocal.y) * 3.8), 4.0);
        float foilSparkle = max(starShape, crossShape * 0.7);

        // メタリック金銀フレーク
        if (glitterHash > 0.82) {
          float flakePhase = sin(uTime * 1.2 + glitterHash * 12.0 + (aspectUv.x - aspectUv.y) * 6.0);
          float flakeSparkle = pow(clamp(flakePhase, 0.0, 1.0), 10.0) * (0.4 + sweepLight * 0.6);
          vec3 metallicTint = mix(vec3(1.0, 0.88, 0.5), vec3(0.9, 0.95, 1.0), step(0.5, fract(glitterHash * 17.0)));
          resultColor += metallicTint * flakeSparkle * foilSparkle * 0.6 * clamp(totalPaintAlpha, 0.0, 1.0);
        }

        // 虹色ホログラムラメ
        if (glitterHash > 0.92) {
          float holoPhase = sin(uTime * 1.8 + glitterHash * 20.0 + (aspectUv.x + aspectUv.y) * 8.0);
          float holoSparkle = pow(clamp(holoPhase, 0.0, 1.0), 7.0) * (0.3 + sweepLight * 0.8);
          vec3 finalHoloTint = mix(vec3(1.0), rainbowColor, 0.75);
          resultColor += finalHoloTint * holoSparkle * foilSparkle * 0.8 * clamp(totalPaintAlpha, 0.0, 1.0);
        }
      }

      gl_FragColor = vec4(resultColor, 1.0);
    }
  `
};
