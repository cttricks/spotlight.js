import { defineConfig } from 'tsup';

export default defineConfig([
  // 1. Library bundle: ESM (.js) and CJS (.cjs) with TypeScript declarations
  {
    entry: {
      index: 'src/index.ts'
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
    treeshake: true,
    minify: false,
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.js' : '.cjs'
      };
    }
  },
  // 2. Standalone browser bundle (IIFE for CDN / <script> tag): dist/spotlight.global.js
  {
    entry: {
      spotlight: 'src/index.ts'
    },
    format: ['iife'],
    globalName: 'Spotlight',
    sourcemap: true,
    clean: false,
    outDir: 'dist',
    minify: false,
    outExtension() {
      return {
        js: '.global.js'
      };
    }
  },
  // 3. Minified standalone browser bundle: dist/spotlight.min.js
  {
    entry: {
      'spotlight.min': 'src/index.ts'
    },
    format: ['iife'],
    globalName: 'Spotlight',
    sourcemap: true,
    clean: false,
    outDir: 'dist',
    minify: true,
    outExtension() {
      return {
        js: '.js'
      };
    }
  }
]);
