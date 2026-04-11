import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
//import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: "./",
  plugins: [
    svelte(),
    /*
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Catch the lion',
        short_name: 'Catch the lion',
        start_url: '/catch-the-lion/',
        scope: '/catch-the-lion/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0000ff',
        icons: [
          {
            src: '/catch-the-lion/icons/icon192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/catch-the-lion/icons/icon512.png',
            sizes: '512x512',
            type: 'image/png'
          },
        ]
      },
      workbox: {
        ** todo remove space on ** /* 
        globPatterns: ['** /*.{js,css,html,ico,png,webm,webp}']
      }
    })
    */
  ],
  worker: {
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: 3000,
  },
});
