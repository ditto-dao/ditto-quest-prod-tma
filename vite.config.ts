import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl';
import preloadImagesPlugin from './vite-plugins/preload-images';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl(), preloadImagesPlugin()],
  build: {
    outDir: './docs'
  },
  //base: '/ditto-quest-tma/',
  base: '/ditto-quest-prod-tma',
});
