import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const rootDir = import.meta.dirname;
const base = process.env.VITE_BASE || './';

export default defineConfig({
  base,
  resolve: {
    alias: {
      '@app': resolve(rootDir, 'src/app'),
      '@shared': resolve(rootDir, 'src/shared'),
      '@features': resolve(rootDir, 'src/features'),
    },
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'icons/favicon-16.png',
        'icons/favicon-32.png',
        'icons/apple-touch-icon.png',
        'icons/icon.svg',
        'icons/icon-maskable.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-maskable-192.png',
        'icons/icon-maskable-512.png',
      ],
      manifest: {
        name: 'Flashcards',
        short_name: 'Flashcards',
        description: 'Lokal studiehjelper med repetisjonskort',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#f4f1ea',
        theme_color: '#0b4f4a',
        lang: 'no',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
});
