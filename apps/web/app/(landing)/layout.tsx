import { Inter, Roboto_Condensed } from 'next/font/google';
import './landing.css';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const robotoCondensed = Roboto_Condensed({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-roboto-condensed',
    display: 'swap',
});

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${inter.variable} ${robotoCondensed.variable} font-sans`}>
            {children}
            <WhatsAppButton />
        </div>
    );
}
