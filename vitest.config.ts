import path from 'path';
import { defineConfig } from 'vitest/config';

const srcDir = path.join(__dirname, 'src');

export default defineConfig({
    resolve: {
        alias: {
            '@': srcDir
        }
    },
    test: {
        globals: false,
        environment: 'happy-dom',
        include: ['src/**/*.{test,spec}.{ts,tsx,mts,cts}'],
        coverage: {
            reporter: 'text',
            exclude: ['src/test/**/*']
        }
    }
});
