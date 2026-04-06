// Force reload
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        screens: {
            'xs': '320px',
            'sm': '480px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1440px',
            '2xl': '1920px',
        },
        extend: {
            colors: {
                // Tema SDS: Negro, Rojo, Blanco
                sds: {
                    black: '#0a0a0a',
                    red: '#dc2626',
                    'red-dark': '#991b1b',
                    'red-light': '#ef4444',
                    gray: '#1f2937',
                    'gray-light': '#374151',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            },
            animation: {
                marquee: 'marquee 15s linear infinite',
            }
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                '.text-fluid-h1': {
                    'font-size': 'clamp(3rem, 10vw, 13rem)',
                    'line-height': '0.9',
                },
                '.text-fluid-h2': {
                    'font-size': 'clamp(2rem, 5vw, 4rem)',
                    'line-height': '1.1',
                },
                '.text-fluid-h3': {
                    'font-size': 'clamp(1.5rem, 3vw, 2.5rem)',
                    'line-height': '1.2',
                },
                '.text-fluid-p': {
                    'font-size': 'clamp(1rem, 1.2vw, 1.125rem)',
                    'line-height': '1.5',
                },
            });
        }
    ],
}
