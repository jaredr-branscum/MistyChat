/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? '/MistyChat/' : '/',
    plugins: [react(), tailwindcss()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
        coverage: {
            provider: 'v8',
            enabled: true,
            thresholds: {
                statements: 90,
                branches: 90,
                functions: 90,
                lines: 90,
            },
            exclude: [
                'node_modules/**',
                'dist/**',
                'src/main.jsx',
                'eslint.config.js',
                'vite.config.js',
                'firebase-config.js',
                'src/setupTests.js',
                '**/*.test.{js,jsx}',
            ],
        },
    },
})
