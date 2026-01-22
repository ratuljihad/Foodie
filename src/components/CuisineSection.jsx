import { useTranslation } from 'react-i18next';

const CUISINES = [
    {
        id: 'bangladeshi',
        nameKey: 'cuisine.bangladeshi',
        icon: '🍛',
        color: 'from-orange-400 to-orange-600',
        value: 'Bangladeshi'
    },
    {
        id: 'indian',
        nameKey: 'cuisine.indian',
        icon: '🥘',
        color: 'from-red-400 to-red-600',
        value: 'Indian'
    },
    {
        id: 'chinese',
        nameKey: 'cuisine.chinese',
        icon: '🍜',
        color: 'from-rose-400 to-rose-600',
        value: 'Chinese' // Matching backend value if possible, or just used for filter
    },
    {
        id: 'italian',
        nameKey: 'cuisine.italian',
        icon: '🍝',
        color: 'from-green-400 to-green-600',
        value: 'Italian'
    },
    {
        id: 'fastfood',
        nameKey: 'cuisine.fastfood',
        icon: '🍔',
        color: 'from-yellow-400 to-yellow-600',
        value: 'Fast Food'
    },
    {
        id: 'pizza',
        nameKey: 'cuisine.pizza',
        icon: '🍕',
        color: 'from-orange-500 to-red-500',
        value: 'Pizza'
    },
];

export const CuisineSection = () => {
    const { t } = useTranslation();

    return (
        <section className="py-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
                {t('cuisine.title', 'Browse by Cuisine')}
            </h2>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                {CUISINES.map((cuisine) => {
                    return (
                        <div
                            key={cuisine.id}
                            className="group flex flex-col items-center gap-3 rounded-2xl p-4 bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:border-transparent"
                        >
                            <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-3xl shadow-sm transition-transform group-hover:scale-110 ${cuisine.color} text-white`}>
                                {cuisine.icon}
                            </div>
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                                {t(cuisine.nameKey, cuisine.value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
