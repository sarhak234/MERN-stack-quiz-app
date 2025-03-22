import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(), // React plugin
    tailwindcss(), // Tailwind CSS plugin
  ],
  base: '/',
  build: {
    outDir: 'dist',
  },
  server: {
    historyApiFallback: true, // Fixes 404 errors on page reload in SPA
  },
});
