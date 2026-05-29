import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { LayoutTemplate, Search, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { DEFAULT_TEMPLATES } from '../constants/defaultTemplates';

import { getPublishedTemplates } from '../services/db';

interface Template {
  id: string;
  title: string;
  creator: string;
  thumbnail?: string;
  data: any;
  createdAt?: string;
}
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
};

export const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLg = useMediaQuery('(min-width: 1024px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const columnCount = isLg ? 4 : isMd ? 3 : 2;

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const parsed = await getPublishedTemplates();
        // Exclude system default templates to prevent duplication if they are stored in user list
        const allUserTemplates = parsed.filter((t: any) => !t.id.startsWith('default-'));
        
        // For rendering, only show user templates that are approved (or legacy undefined status)
        const approvedUserTemplates = allUserTemplates.filter((t: any) => t.status === 'approved' || t.status === undefined);
        
        const loadedTemplates = [...DEFAULT_TEMPLATES, ...approvedUserTemplates];
        setTemplates(loadedTemplates);
      } catch (err) {
        console.error('Failed to load gallery templates:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const handleUseTemplate = (template: Template) => {
    // Pass only the template ID to avoid localStorage quota issues
    // (templates with images can be several MB, duplicating them would exceed the ~5MB limit)
    localStorage.setItem('template_to_load_id', template.id);
    navigate('/kanvas');
  };

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Distribute templates into columns mathematically to guarantee even filling
  const columnsData = Array.from({ length: columnCount }, () => [] as Template[]);
  filteredTemplates.forEach((template, index) => {
    columnsData[index % columnCount].push(template);
  });

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen pb-16">
      <SEO 
        title="Galeri Template - KanvasKita" 
        description="Jelajahi dan gunakan berbagai template desain kreatif yang dibagikan oleh komunitas KanvasKita." 
      />

      {/* Mini Hero Section */}
      <div className="relative w-full min-h-[320px] bg-slate-50 dark:bg-slate-950 overflow-hidden py-14 flex flex-col justify-center select-none transition-colors duration-300">
        {/* Background Image Container - same overlay system as Home page */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/Hero.png"
            alt="Hero Background"
            className="w-full h-full object-cover object-center opacity-55 dark:opacity-35 select-none pointer-events-none transition-opacity duration-300"
          />
          {/* Base dark overlay for text legibility */}
          <div className="absolute inset-0 bg-slate-950/45 dark:bg-slate-950/70 transition-colors duration-300" />
          {/* Radial Gradient overlay for spotlight effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(4,6,10,0.75)_80%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15)_0%,rgba(3,1,9,0.85)_80%)] transition-colors duration-300" />
          {/* Top-down fade to blend with header navbar */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950/95 dark:from-slate-950/95 via-transparent to-transparent pointer-events-none transition-colors duration-300" />
          {/* Bottom-up fade to blend with next section */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent pointer-events-none transition-colors duration-300" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in flex flex-col items-start text-left">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#ffffff]/10 backdrop-blur-md border border-[#ffffff]/20 shadow-xl mb-6">
            <LayoutTemplate className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400 drop-shadow-md" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
            <span className="text-[#ffffff]">Galeri</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Template
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
            Gunakan template yang dibagikan oleh komunitas. Edit sesuka hati dan buat kreasi Anda sendiri dalam hitungan detik.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-20">
        
        {/* Search Bar Section */}
        <div className="mb-8">
          <div className="w-full sm:max-w-md relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-slate-450 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-sm"
              placeholder="Cari nama template atau kreator..."
            />
          </div>
        </div>

        {/* Separator Line */}
        <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-8" />

        {/* Templates Grid (Pinterest-like masonry columns layout) */}
        {isLoading ? (
          <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="text-sm font-black text-slate-700 dark:text-slate-350 tracking-wider uppercase">Memuat Galeri...</span>
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="flex gap-6 w-full items-start">
            {columnsData.map((colItems, colIndex) => (
              <div key={colIndex} className="flex-1 flex flex-col gap-6">
                {colItems.map((template) => (
                  <button 
                    key={template.id} 
                    onClick={() => setSelectedTemplate(template)}
                    className="w-full group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:shadow-indigo-950/20 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:scale-[1.03] transition-all duration-300 cursor-pointer text-left flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="w-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                      {template.thumbnail ? (
                        <img 
                          src={template.thumbnail} 
                          alt={template.title} 
                          className="w-full h-auto object-contain select-none pointer-events-none"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-950 text-center">
                          <LayoutTemplate size={28} className="text-slate-350 dark:text-slate-700" />
                          <span className="text-xs font-semibold text-slate-450 dark:text-slate-550">Pratinjau Kosong</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Clean Hover Overlay with Title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <h4 className="font-bold text-sm text-white line-clamp-2 leading-tight">
                        {template.title}
                      </h4>
                      <p className="text-[10px] text-slate-300 mt-1 truncate">
                        oleh {template.creator || 'Anonim'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <LayoutTemplate size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-6" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Belum ada template</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              {searchQuery 
                ? `Tidak ditemukan template dengan kata kunci "${searchQuery}".` 
                : "Jadilah yang pertama mempublikasikan karya Anda dari KanvasKita dan bagikan kepada dunia!"}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => navigate('/kanvas')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                Buat Desain Sekarang
              </button>
            )}
          </div>
        )}

      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          {/* Modal Container */}
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]">
            
            {/* Close Button on Top Right (for mobile/tablet convenience) */}
            <button 
              onClick={() => setSelectedTemplate(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-450 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Side: Preview Area */}
            <div className="w-full md:w-3/5 bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center border-r border-slate-100 dark:border-slate-850/80 min-h-[320px] md:min-h-0 overflow-y-auto">
              {selectedTemplate.thumbnail ? (
                <img 
                  src={selectedTemplate.thumbnail} 
                  alt={selectedTemplate.title} 
                  className="max-w-full max-h-[40vh] md:max-h-[65vh] object-contain rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <LayoutTemplate size={48} className="text-slate-300 dark:text-slate-700" />
                  <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">Tidak ada pratinjau</span>
                </div>
              )}
            </div>

            {/* Right Side: Detail Info & Actions */}
            <div className="w-full md:w-2/5 p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950 mb-4">
                  <LayoutTemplate size={12} />
                  Komunitas Template
                </span>
                
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                  {selectedTemplate.title}
                </h2>

                <div className="space-y-4 py-4 border-t border-b border-slate-105 dark:border-slate-850">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm uppercase">
                      {selectedTemplate.creator ? selectedTemplate.creator.charAt(0) : 'A'}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Dibuat oleh</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {selectedTemplate.creator || 'Anonim'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Dipublikasikan pada</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {selectedTemplate.createdAt ? new Date(selectedTemplate.createdAt).toLocaleDateString('id-ID', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950/30 rounded-2xl p-4">
                  <p className="text-xs leading-relaxed text-indigo-600/80 dark:text-indigo-400/80">
                    💡 Template ini siap digunakan. Klik tombol di bawah untuk membukanya langsung di editor kanvas Anda.
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button 
                  onClick={() => handleUseTemplate(selectedTemplate)}
                  className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 cursor-pointer"
                >
                  Gunakan Template <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => setSelectedTemplate(null)}
                  className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-semibold flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

