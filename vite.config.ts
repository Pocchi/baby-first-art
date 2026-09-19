import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 相対パス指定により GitHub Pages や任意のサブディレクトリでそのまま動作
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
