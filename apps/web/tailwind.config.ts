import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Paleta VMP Corporativa (Dashboard)
                primary: {
                    DEFAULT: '#1e40af',
                    light: '#3b82f6',
                    dark: '#1e3a8a',
                },
                secondary: {
                    DEFAULT: '#64748b',
                    light: '#94a3b8',
                    dark: '#475569',
                },
                success: '#10b981',
                warning: '#f59e0b',
                background: '#ffffff',
                'background-light': '#f8fafc',

                // Paleta VMP Landing (Industrial Vial)
                'azul-petroleo': '#0A192F',
                'amarillo-vial': '#FFD700',
                'gris-asfalto': '#2D3748',
                'gris-claro': '#F7FAFC',
                'verde-aprobado': '#48BB78',
                'rojo-alerta': '#F56565',
                'naranja-advertencia': '#ED8936',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
                heading: ['var(--font-roboto-condensed)', 'Roboto Condensed', 'sans-serif'],
            },
            borderRadius: {
                lg: '0.5rem',
                md: '0.375rem',
                sm: '0.25rem',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.3s ease-out',
            },
        },
    },
    plugins: [],
};

export default config;
