import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../services/db';
import { supabase } from '../services/supabaseClient';
import { 
  Sparkles, 
  Moon, 
  Menu, 
  X, 
  Home, 
  Compass, 
  ArrowUp,
  LayoutTemplate,
  User
} from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Navbar = ({ isDarkMode, setIsDarkMode }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const [reachedBottom, setReachedBottom] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();

    // Listen to real-time auth changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    const handleAuthChange = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    window.addEventListener('auth_change', handleAuthChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth_change', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const threshold = 120; // pixels from the bottom
      const scrolledToBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - threshold);
      setReachedBottom(scrolledToBottom);
    };

    // Reset state on load
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, location.pathname]);

  const handleGoHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleScrollToTools = (e: React.MouseEvent) => {
    if (isHomePage) {
      e.preventDefault();
      const el = document.getElementById('tools');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* Top Header Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand Name */}
            <div onClick={handleGoHome} className="flex items-center gap-2 cursor-pointer">
              <img 
                src="/Logo.png" 
                alt="Logo KanvasKita" 
                className="w-8 h-8 object-contain" 
              />
              <img 
                src="/KanvasKita.png" 
                alt="KanvasKita" 
                className="h-12 md:h-14 object-contain" 
              />
              <span className="sr-only">KanvasKita</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" onClick={handleGoHome} className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Beranda</Link>
              <a href="/#tools" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Semua Tools</a>
              <Link 
                to="/template" 
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors cursor-pointer"
              >
                Template
              </Link>
            </div>

            {/* Tombol Aksi & Toggle Tema (Desktop & Mobile) */}
            <div className="flex items-center gap-4">
              {/* Toggle Dark/Neon Mode */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer flex items-center justify-center"
                aria-label="Toggle Theme Mode"
                title={isDarkMode ? "Ganti ke Mode Slate" : "Ganti ke Mode Neon"}
              >
                {isDarkMode ? (
                  <Sparkles size={20} className="text-indigo-400 animate-pulse-slow" />
                ) : (
                  <Moon size={20} className="text-indigo-400" />
                )}
              </button>

              {/* Tombol Kanvas (Hanya Desktop) */}
              <div className="hidden md:block">
                <button onClick={() => navigate('/kanvas')} className="bg-[#d946ef] hover:bg-[#c026d3] text-white px-5 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 duration-200 cursor-pointer">
                  Kanvas
                </button>
              </div>

              {/* Avatar Profil Elegan (Hanya Desktop) */}
              <button 
                onClick={() => navigate(currentUser ? '/profil' : '/auth')}
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-850 text-slate-650 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-all cursor-pointer overflow-hidden shadow-xs hover:scale-105 active:scale-95 duration-200"
                title={currentUser ? "Profil Saya" : "Masuk / Daftar"}
              >
                {currentUser && currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} />
                )}
              </button>

              {/* Tombol Hamburger Mobile (Hidden on Homepage) */}
              {!isHomePage && (
                <div className="md:hidden flex items-center">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-slate-600 dark:text-slate-300 focus:outline-none"
                  >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Mobile (Hidden on Homepage) */}
        {!isHomePage && isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2 shadow-lg transition-colors duration-300">
            <Link to="/" onClick={handleGoHome} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800">Beranda</Link>
            <a href="/#tools" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800">Semua Tools</a>
            <Link 
              to="/template"
              onClick={() => setIsMenuOpen(false)} 
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Template
            </Link>
            <button 
              onClick={() => { navigate(currentUser ? '/profil' : '/auth'); setIsMenuOpen(false); }} 
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer text-left"
            >
              Profil
            </button>
            <button onClick={() => { navigate('/kanvas'); setIsMenuOpen(false); }} className="w-full mt-4 bg-[#d946ef] hover:bg-[#c026d3] text-white px-5 py-3 rounded-xl font-semibold transition-all cursor-pointer">
              Kanvas
            </button>
          </div>
        )}
      </nav>

      {/* Floating Bottom Navbar (Only on Homepage) */}
      {isHomePage && (
        <div 
          className={`fixed z-50 transition-all duration-500 ease-out ${
            reachedBottom 
              ? 'bottom-20 sm:bottom-24 md:bottom-8 right-6 md:right-8 left-auto translate-x-0 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer border border-indigo-500/50' 
              : 'bottom-6 left-1/2 -translate-x-1/2 bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl px-4 py-2.5 rounded-2xl md:rounded-full shadow-[0_0_25px_rgba(99,102,241,0.15)] dark:shadow-[0_0_25px_rgba(168,85,247,0.22)] flex items-center justify-between max-w-sm w-[calc(100%-2rem)] md:hidden'
          }`}
        >
          {reachedBottom ? (
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full h-full flex items-center justify-center cursor-pointer text-white"
              title="Kembali ke Atas"
            >
              <ArrowUp size={24} className="animate-bounce" />
            </button>
          ) : (
            <div className="flex items-center w-full justify-between gap-1">
              {/* Beranda */}
              <div className="flex-1 flex justify-center">
                <button 
                  onClick={handleGoHome}
                  className="flex flex-col items-center gap-0.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <Home size={18} />
                  <span className="text-[9px] font-bold tracking-tight">Beranda</span>
                </button>
              </div>

              {/* Template */}
              <div className="flex-1 flex justify-center">
                <button 
                  onClick={() => navigate('/template')}
                  className="flex flex-col items-center gap-0.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <LayoutTemplate size={18} />
                  <span className="text-[9px] font-bold tracking-tight">Template</span>
                </button>
              </div>

              {/* Kanvas (Ungu, No Icon, Center) */}
              <div className="flex-1 flex justify-center">
                <button 
                  onClick={() => navigate('/kanvas')}
                  className="bg-[#d946ef] hover:bg-[#c026d3] text-white px-6 py-2 rounded-full font-bold text-xs sm:text-sm shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Kanvas
                </button>
              </div>

              {/* Tools */}
              <div className="flex-1 flex justify-center">
                <a 
                  href="#tools" 
                  onClick={handleScrollToTools}
                  className="flex flex-col items-center gap-0.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-center"
                >
                  <Compass size={18} />
                  <span className="text-[9px] font-bold tracking-tight">Tools</span>
                </a>
              </div>

              {/* Profil */}
              <div className="flex-1 flex justify-center">
                <button 
                  onClick={() => navigate(currentUser ? '/profil' : '/auth')}
                  className="flex flex-col items-center gap-0.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <User size={18} />
                  <span className="text-[9px] font-bold tracking-tight">Profil</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
