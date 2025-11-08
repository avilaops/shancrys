import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function Header() {
    const { isAuthenticated, user, logout } = useAuth();
    const { t } = useTranslation(['common', 'landing']);

    return (
        <header className="absolute top-0 left-0 right-0 z-50">
            <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-white">
                        Shancrys
                    </Link>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-white/90 hover:text-white transition">
                            {t('landing:footer.features')}
                        </a>
                        <a href="#pricing" className="text-white/90 hover:text-white transition">
                            {t('landing:footer.pricing')}
                        </a>
                        <a href="#" className="text-white/90 hover:text-white transition">
                            {t('landing:footer.docs')}
                        </a>
                    </div>

                    {/* Auth Buttons and Language Selector */}
                    <div className="flex items-center gap-4">
                        <LanguageSelector />

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-2 text-white/90 hover:text-white transition"
                                >
                                    <User className="w-5 h-5" />
                                    <span className="hidden md:inline">{user?.name}</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="hidden md:inline">{t('common:logout')}</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-white/90 hover:text-white transition px-4 py-2"
                                >
                                    {t('common:login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-6 py-2 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition"
                                >
                                    {t('landing:cta.start')}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
