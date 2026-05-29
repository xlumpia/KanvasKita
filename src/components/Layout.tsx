import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { incrementToolUsage } from '../services/db';

interface LayoutProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Layout = ({ isDarkMode, setIsDarkMode }: LayoutProps) => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let toolKey = '';
    
    if (path === '/kompres-gambar') toolKey = 'Kompres Gambar';
    else if (path === '/generator-qr') toolKey = 'QR Code Generator';
    else if (path === '/konverter-format') toolKey = 'Konverter Format';
    else if (path === '/watermark') toolKey = 'Watermark';
    else if (path === '/hapus-background') toolKey = 'Hapus Background';
    else if (path === '/alat-pdf') toolKey = 'Alat PDF';
    else if (path === '/kanvas') toolKey = 'Kanvas Kreatif';
    else if (path === '/template') toolKey = 'Template Galeri';
    else if (path === '/ekstraktor-warna') toolKey = 'Ekstraktor Warna';
    else if (path === '/konverter-vektor') toolKey = 'Konverter SVG ke PNG';
    else if (path === '/ocr-terjemah') toolKey = 'Pemindai OCR & Terjemah';

    if (toolKey) {
      incrementToolUsage(toolKey);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
