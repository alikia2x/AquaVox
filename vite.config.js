import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
    plugins: [sveltekit()],
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
    }
});
