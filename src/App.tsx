import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Compressor } from './pages/tools/Compressor';
import { QRGenerator } from './pages/tools/QRGenerator';
import { Converter } from './pages/tools/Converter';
import { Watermark } from './pages/tools/Watermark';
import { BackgroundRemover } from './pages/tools/BackgroundRemover';
import { PDFTools } from './pages/tools/PDFTools';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { About } from './pages/About';
import { Workspace } from './pages/Workspace';
import { Templates } from './pages/Templates';
import { Admin } from './pages/Admin';
import { UtilityTools } from './pages/tools/UtilityTools';
import { OCRTranslator } from './pages/tools/OCRTranslator';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}>
          <Route index element={<Home />} />
          <Route path="kompres-gambar" element={<Compressor />} />
          <Route path="generator-qr" element={<QRGenerator />} />
          <Route path="konverter-format" element={<Converter />} />
          <Route path="watermark" element={<Watermark />} />
          <Route path="hapus-background" element={<BackgroundRemover />} />
          <Route path="alat-pdf" element={<PDFTools />} />
          <Route path="privasi" element={<Privacy />} />
          <Route path="ketentuan" element={<Terms />} />
          <Route path="tentang" element={<About />} />
          <Route path="template" element={<Templates />} />
          <Route path="kanvas" element={<Workspace />} />
          <Route path="admin" element={<Admin />} />
          <Route path="ekstraktor-warna" element={<UtilityTools />} />
          <Route path="konverter-vektor" element={<UtilityTools />} />
          <Route path="ocr-terjemah" element={<OCRTranslator />} />
          <Route path="auth" element={<Auth />} />
          <Route path="profil" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
