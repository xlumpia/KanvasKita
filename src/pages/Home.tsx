import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Scissors, 
  Image as ImageIcon, 
  ArrowRightLeft, 
  QrCode, 
  Droplet, 
  FileText, 
  ArrowRight,
  Palette,
  FileCode,
  Languages
} from 'lucide-react';
import { SEO } from '../components/SEO';

const ScrollReveal = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.05,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-[0.98] pointer-events-none'
      }`}
    >
      {children}
    </div>
  );
};

export const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Data dummy untuk tools yang tersedia
  const tools = [
    {
      id: 1,
      title: 'Hapus Background',
      description: 'Hapus latar belakang foto secara otomatis dalam hitungan detik. 100% diproses aman di perangkat Anda.',
      icon: Scissors,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
      tag: 'Populer',
      tagColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      image: '/hapus background.png',
      path: '/hapus-background'
    },
    {
      id: 2,
      title: 'Kompres Gambar',
      description: 'Perkecil ukuran file gambar tanpa mengurangi kualitas visual secara drastis.',
      icon: ImageIcon,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      tag: 'Populer',
      tagColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      image: '/image compress.png',
      path: '/kompres-gambar'
    },
    {
      id: 3,
      title: 'Konverter Format',
      description: 'Ubah format gambar dari JPG, PNG, WEBP, dan lainnya dengan mudah.',
      icon: ArrowRightLeft,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      tag: '',
      tagColor: '',
      image: '/convert image.png',
      path: '/konverter-format'
    },
    {
      id: 4,
      title: 'Generator   QR Code',
      description: 'Buat kode QR kustom untuk tautan, teks, atau kontak dengan berbagai warna.',
      icon: QrCode,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/30',
      tag: 'Baru',
      tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      image: '/QR generator.png',
      path: '/generator-qr'
    },
    {
      id: 5,
      title: 'Beri Watermark',
      description: 'Lindungi karya Anda dengan menambahkan teks atau logo transparan pada gambar.',
      icon: Droplet,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/30',
      tag: '',
      tagColor: '',
      image: '/watermark.png',
      path: '/watermark'
    },
    {
      id: 6,
      title: 'Alat PDF Lengkap',
      description: 'Ubah gambar ke PDF, gabungkan beberapa PDF, pisahkan halaman, atau perkecil ukuran file PDF secara offline.',
      icon: FileText,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-900/30',
      tag: 'Baru',
      tagColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      image: '/pdf tools.png',
      path: '/alat-pdf'
    }
  ];

  // Data dummy untuk tools tambahan / utilitas
  const additionalTools = [
    {
      id: 101,
      title: 'Ekstraktor Warna',
      description: 'Ekstrak palet warna dominan dan kode HEX/RGB dari gambar unggahan secara instan.',
      icon: Palette,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-900/30',
      tag: 'Praktis',
      tagColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      image: '/color extractor.png',
      path: '/ekstraktor-warna'
    },
    {
      id: 103,
      title: 'Konverter SVG ke PNG',
      description: 'Ubah grafik vektor berbasis SVG menjadi gambar berformat PNG transparan resolusi tinggi.',
      icon: FileCode,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/30',
      tag: 'Vektor',
      tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      image: '/svg to png.png',
      path: '/konverter-vektor'
    },
    {
      id: 104,
      title: 'Pemindai OCR & Terjemah',
      description: 'Ekstrak teks dari foto dokumen atau gambar secara instan dan terjemahkan langsung ke Bahasa Indonesia.',
      icon: Languages,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-900/30',
      tag: 'AI Pintar',
      tagColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      image: '/ocr translator.png',
      path: '/ocr-terjemah'
    }
  ];

  // Filter tools berdasarkan pencarian
  const filteredTools = tools.filter(tool => 
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdditionalTools = additionalTools.filter(tool =>
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <SEO 
        title="Beranda - Semua Kebutuhan Visualmu" 
        description="KanvasKita adalah kumpulan alat pengolahan gambar gratis, cepat, dan aman. Mengompres gambar, mengonversi format, memberi watermark, dan membuat QR code secara offline di browser Anda tanpa upload ke server." 
        keywords="pengolah gambar, kompres gambar online, konverter gambar, pembuat qr code, watermark gambar, ocr gratis, alat foto offline, kanvaskita" 
      />
      {/* Hero Section */}
      <div className="relative w-full min-h-[550px] md:min-h-[650px] lg:min-h-[720px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden py-24 md:py-36 flex flex-col justify-center items-center select-none transition-colors duration-300">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/Hero.png"
            alt="Hero Background"
            className="w-full h-full object-cover object-center opacity-55 dark:opacity-35 select-none pointer-events-none transition-opacity duration-300"
          />
          {/* Overlays */}
          {/* Base dark overlay for text legibility */}
          <div className="absolute inset-0 bg-slate-950/45 dark:bg-slate-950/70 transition-colors duration-300" />
          {/* Radial Gradient overlay for spotlight effect, fading to slate-950 / black-purple at the edges */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(4,6,10,0.75)_80%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15)_0%,rgba(3,1,9,0.85)_80%)] transition-colors duration-300" />
          {/* Top-down fade to blend with header navbar */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950/95 dark:from-slate-950/95 via-transparent to-transparent pointer-events-none transition-colors duration-300" />
          {/* Bottom-up fade to blend with next section background */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-50 dark:from-slate-50 via-transparent to-transparent pointer-events-none transition-colors duration-300" />
        </div>
        
        {/* Hero Content (Overlay on top) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in flex flex-col items-center">
          {/* Glowing Badge */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 mb-8 backdrop-blur-sm shadow-sm select-none">
            ✨ Semua Alat Pengolah Gambar Secara Lokal & Gratis
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1] max-w-4xl mx-auto drop-shadow-sm dark:drop-shadow-2xl transition-colors duration-300">
            Satu Tempat untuk <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
              Semua Kebutuhan Visualmu
            </span>
          </h1>
          
          <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm transition-colors duration-300">
            Kumpulan alat pengolah gambar gratis, cepat, dan aman. 
            Diproses langsung di browsermu secara lokal tanpa perlu mengunggah ke server.
          </p>

          {/* Centered Search Bar */}
          <div className="max-w-xl w-full mx-auto relative group px-4">
            <div className="absolute inset-y-0 left-4 pl-4 flex items-center pointer-events-none z-20">
              <Search className="h-5 w-5 text-slate-450 dark:text-slate-550 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 md:py-4.5 border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl leading-5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 sm:text-base shadow-lg dark:shadow-2xl transition-all duration-300 relative z-10"
              placeholder="Cari alat (misal: hapus background, kompres...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bagian Grid Tools */}
      <div id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Alat Tersedia</h2>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full transition-colors duration-300">
            {filteredTools.length} Alat
          </span>
        </div>

        {filteredTools.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredTools.map((tool, index) => (
              <ScrollReveal key={tool.id} delay={(index % 3) * 100}>
                <Link 
                  to={tool.path}
                  className="group tool-card relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/20 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* Banner Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 flex items-center justify-center">
                    <img 
                      src={tool.image} 
                      alt={tool.title} 
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 select-none pointer-events-none"
                    />
                    
                    {/* Left-to-right dark gradient overlay for text protection */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none z-10" />

                    {/* Badge Label */}
                    {tool.tag && (
                      <div className="absolute top-4 right-4 z-25">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${tool.tagColor} backdrop-blur-xs`}>
                          {tool.tag}
                        </span>
                      </div>
                    )}

                    {/* Overlaid Icon & Gradient Title on the left side of the image */}
                    <div className="absolute left-4 top-4 z-20 flex flex-col items-start gap-2.5 w-[45%] select-none">
                      <div className="w-10 h-10 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <tool.icon className={`w-5 h-5 ${tool.color}`} />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-tight transition-all duration-300 pr-1">
                        {tool.title}
                      </h3>
                    </div>
                  </div>

                  {/* Bottom Section (Description & Action) */}
                  <div className="p-6 flex flex-col flex-grow select-none">
                    {/* Description */}
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow leading-relaxed transition-colors duration-300">
                      {tool.description}
                    </p>

                    {/* Action Link */}
                    <div className="flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-auto">
                      Gunakan Alat
                      <ArrowRight size={14} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Bagian Alat Utilitas Tambahan */}
        {filteredAdditionalTools.length > 0 && (
          <div className={`${filteredTools.length > 0 ? 'mt-20 border-t border-slate-200/60 dark:border-slate-800/60 pt-16' : ''}`}>
            <div className="flex flex-col mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Alat Utilitas & Tambahan</h2>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full transition-colors duration-300">
                  {filteredAdditionalTools.length} Alat
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">Kumpulan alat pembantu praktis untuk menyempurnakan alur kerja desain Anda secara instan.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredAdditionalTools.map((tool, index) => (
                <ScrollReveal key={tool.id} delay={(index % 3) * 100}>
                  <Link 
                    to={tool.path}
                    className="group tool-card relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/20 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Banner Image Container */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 flex items-center justify-center">
                      <img 
                        src={tool.image} 
                        alt={tool.title} 
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 select-none pointer-events-none"
                      />
                      
                      {/* Left-to-right dark gradient overlay for text protection */}
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none z-10" />

                      {/* Badge Label */}
                      {tool.tag && (
                        <div className="absolute top-4 right-4 z-25">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${tool.tagColor} backdrop-blur-xs`}>
                            {tool.tag}
                          </span>
                        </div>
                      )}

                      {/* Overlaid Icon & Gradient Title on the left side of the image */}
                      <div className="absolute left-4 top-4 z-20 flex flex-col items-start gap-2.5 w-[45%] select-none">
                        <div className="w-10 h-10 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                          <tool.icon className={`w-5 h-5 ${tool.color}`} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-tight transition-all duration-300 pr-1">
                          {tool.title}
                        </h3>
                      </div>
                    </div>

                    {/* Bottom Section (Description & Action) */}
                    <div className="p-6 flex flex-col flex-grow select-none">
                      {/* Description */}
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow leading-relaxed transition-colors duration-300">
                        {tool.description}
                      </p>

                      {/* Action Link */}
                      <div className="flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-auto">
                        Gunakan Alat
                        <ArrowRight size={14} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}

        {filteredTools.length === 0 && filteredAdditionalTools.length === 0 && (
          /* Tampilan jika pencarian tidak ditemukan */
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed transition-colors duration-300">
            <Search className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Alat tidak ditemukan</h3>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Coba gunakan kata kunci lain untuk mencari alat.</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Hapus pencarian
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
