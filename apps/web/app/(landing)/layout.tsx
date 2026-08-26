import CookieConsentBanner from '@/components/common/CookieConsentBanner';
import './landing.css';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="font-sans">
            {children}
            <CookieConsentBanner />
        </div>
    );
}
