import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
    plugins: [sveltekit(), wasm()],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis'
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true
                })
            ]
        }
    },
    build: {
        rollupOptions: {
            plugins: [rollupNodePolyFill()]
        }
    },
    server: {
        fs: {
            allow: ['./package.json']
        }
    }
});
