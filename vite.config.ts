import { defineConfig } from 'vite';
import civetPlugin from '@danielx/civet/vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  base: "./",
  plugins: [
    civetPlugin({
      ts: "preserve",
    }),
    solidPlugin(),
  ],
  worker: {
    plugins: () => [
      civetPlugin({
        ts: "preserve",
      }),
    ],
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: 3000,
  },
});
