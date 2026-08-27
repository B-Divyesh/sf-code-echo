import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

const fromSite = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  root: fromSite('.'),
  publicDir: fromSite('public'),
  build: {
    outDir: fromSite('../dist/site'),
    emptyOutDir: true,
    target: 'es2022',
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    rollupOptions: {
      input: {
        home: fromSite('index.html'),
        privacy: fromSite('privacy/index.html'),
        terms: fromSite('terms/index.html')
      }
    }
  },
  server: { fs: { allow: [fromSite('..')] } }
});
