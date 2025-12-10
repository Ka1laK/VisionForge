/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Neuroscience Lab Theme
                'neuro': {
                    'bg-primary': '#0a0a0f',
                    'bg-secondary': '#12121a',
                    'bg-tertiary': '#1a1a2e',
                    'bg-card': '#16162a',
                    'accent': '#00d4ff',
                    'accent-secondary': '#0099cc',
                    'accent-glow': 'rgba(0, 212, 255, 0.2)',
                    'neural-active': '#00ff88',
                    'neural-warning': '#ffaa00',
                    'neural-inactive': '#334455',
                    'text-primary': '#ffffff',
                    'text-secondary': '#a0a0b0',
                    'text-muted': '#666680',
                    'border': '#2a2a4a',
                }
            },
            fontFamily: {
                'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
                'sans': ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'neuro': '0 0 20px rgba(0, 212, 255, 0.3)',
                'neuro-lg': '0 0 40px rgba(0, 212, 255, 0.4)',
                'neural-glow': '0 0 30px rgba(0, 255, 136, 0.5)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'scan-line': 'scanLine 2s linear infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' },
                },
                scanLine: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
            },
            backgroundImage: {
                'grid-pattern': `linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)`,
            },
            backgroundSize: {
                'grid': '20px 20px',
            },
        },
    },
    plugins: [],
}
