import { defineConfig } from 'vite';
import civetPlugin from '@danielx/civet/vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  base: "./",
  plugins: [
    civetPlugin({
      ts: "preserve",
      //typecheck: true,
    }),
    solidPlugin(),
  ],
  build: {
    target: 'esnext',
  },
  server: {
    port: 3000,
  },
});
