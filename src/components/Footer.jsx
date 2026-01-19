import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    const footerSections = [
        {
            title: 'company',
            links: [
                { key: 'about', to: '/about' },
                { key: 'careers', to: '/careers' },
                { key: 'blog', to: '/blog' },
                { key: 'business', to: '/business' },
            ],
        },
        {
            title: 'contact',
            links: [
                { key: 'help', to: '/help' },
                { key: 'faq', to: '/faq' },
                { key: 'partner', to: '/partner' },
                { key: 'download', to: '/download' },
            ],
        },
        {
            title: 'legal',
            links: [
                { key: 'terms', to: '/terms' },
                { key: 'privacy', to: '/privacy' },
                { key: 'policy', to: '/rights' },
                { key: 'refund', to: '/refund' },
            ],
        },
        {
            title: 'locations',
            links: [
                { key: 'dhaka', to: '/city/dhaka' },
                { key: 'chittagong', to: '/city/chittagong' },
                { key: 'sylhet', to: '/city/sylhet' },
                { key: 'rajshahi', to: '/city/rajshahi' },
            ],
        },
    ];

    return (
        <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                                {t(`footer.${section.title}.title`)}
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.key}>
                                        <Link
                                            to={link.to}
                                            className="text-sm text-slate-600 hover:text-brand-600 transition-colors"
                                        >
                                            {t(`footer.${section.title}.${link.key}`)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 border-t border-slate-200 pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-md text-sm">K</span>
                            KhaiKhai
                        </div>
                        <p className="text-sm text-slate-500 text-center md:text-left">
                            © {currentYear} KhaiKhai Technologies. {t('footer.copyright')}
                        </p>
                        <div className="flex gap-4">
                            {/* Social placeholders */}
                            <a href="#" className="text-slate-400 hover:text-slate-600"><span className="sr-only">Facebook</span>FB</a>
                            <a href="#" className="text-slate-400 hover:text-slate-600"><span className="sr-only">Twitter</span>TW</a>
                            <a href="#" className="text-slate-400 hover:text-slate-600"><span className="sr-only">Instagram</span>IG</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
