import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 transition-colors duration-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <img
            src="/KanvasKita.png"
            alt="KanvasKita"
            className="h-10 md:h-12 object-contain"
          />
          <span className="sr-only">KanvasKita</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center md:text-left">
          © {new Date().getFullYear()} KanvasKita. Dibangun dengan fokus pada privasi dan kecepatan.
        </p>
        <div className="flex space-x-6">
          <Link to="/tentang" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Tentang Kami</Link>
          <Link to="/privasi" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Privasi</Link>
          <Link to="/ketentuan" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Ketentuan</Link>
        </div>
      </div>
    </footer>
  );
};
