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
                // Paleta VMP - EDTECH (Identidad de marca - Verde Teal)
                primary: {
                    DEFAULT: '#3AAFA9', // Teal principal de la marca VMP
                    light: '#5CC8C1',   // Teal claro
                    dark: '#2D9E93',    // Teal oscuro
                    50: '#F0FDFA',
                    100: '#CCFBF1',
                    200: '#99F6E4',
                    300: '#5EEAD4',
                    400: '#4ECDC4',
                    500: '#3AAFA9',
                    600: '#2D9E93',
                    700: '#267D76',
                    800: '#1F635E',
                    900: '#1A4F4B',
                },
                secondary: {
                    DEFAULT: '#0F172A', // Slate 900 - Azul oscuro corporativo
                    light: '#1E293B',   // Slate 800
                    dark: '#020617',    // Slate 950
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                },
                accent: {
                    teal: '#14B8A6',    // Teal 500 - Acento verde agua
                    emerald: '#10B981', // Emerald 500 - Verde profesional
                    blue: '#3B82F6',    // Blue 500 - Azul confianza
                    slate: '#64748B',   // Slate 500 - Gris corporativo
                },
                success: '#10B981',     // Emerald 500
                warning: '#F59E0B',     // Amber 500
                error: '#EF4444',       // Red 500
                info: '#3B82F6',        // Blue 500
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                heading: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.5s ease-out',
                slideUp: 'slideUp 0.6s ease-out',
                slideDown: 'slideDown 0.4s ease-out',
                scaleIn: 'scaleIn 0.5s ease-out',
                shimmer: 'shimmer 2s linear infinite',
                float: 'float 3s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
};

export default config;
