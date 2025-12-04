/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
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
            }
        },
    },
    plugins: [],
}
