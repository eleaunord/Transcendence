import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  
  plugins: [],
  optimizeDeps: {
    include: [
      "@babylonjs/core",
      "@babylonjs/gui",
      "@babylonjs/loaders"
    ]
  }
});
