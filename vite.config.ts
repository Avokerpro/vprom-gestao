import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Permite que o build funcione em caminhos relativos ou subpastas
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});