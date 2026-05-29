import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Languages, 
  Copy, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import { SEO } from '../../components/SEO';

interface LanguageOption {
  code: string;       // Tesseract code
  gtCode: string;     // Google Translate code
  name: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'eng', gtCode: 'en', name: 'Bahasa Inggris (English)' },
  { code: 'ind', gtCode: 'id', name: 'Bahasa Indonesia' },
  { code: 'jpn', gtCode: 'ja', name: 'Bahasa Jepang (日本語)' },
  { code: 'chi_sim', gtCode: 'zh-CN', name: 'Bahasa Mandarin (简体中文)' },
  { code: 'ara', gtCode: 'ar', name: 'Bahasa Arab (العربية)' },
  { code: 'spa', gtCode: 'es', name: 'Bahasa Spanyol (Español)' },
  { code: 'fra', gtCode: 'fr', name: 'Bahasa Prancis (Français)' },
  { code: 'deu', gtCode: 'de', name: 'Bahasa Jerman (Deutsch)' }
];

export const OCRTranslator = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<string>('eng');
  
  // OCR Progress State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  
  // Text Outputs
  const [ocrText, setOcrText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  
  // Copy Statuses
  const [copiedOcr, setCopiedOcr] = useState<boolean>(false);
  const [copiedTrans, setCopiedTrans] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up Object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setupImage(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setupImage(file);
      }
    }
  };

  const setupImage = (file: File) => {
    setImage(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    
    // Clear outputs
    setOcrText('');
    setTranslatedText('');
    setProgress(0);
    setProgressStatus('');
  };

  const handleProcessOCR = () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(0);
    setProgressStatus('Memuat mesin OCR...');

    Tesseract.recognize(
      image,
      sourceLang,
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setProgressStatus(`Membaca teks: ${Math.round(m.progress * 100)}%`);
          } else {
            setProgressStatus(m.status);
          }
        }
      }
    ).then(({ data: { text } }) => {
      setOcrText(text || 'Tidak ada teks yang terdeteksi.');
      setIsProcessing(false);
      setProgress(100);
      setProgressStatus('Selesai dipindai!');
    }).catch(err => {
      console.error(err);
      setProgressStatus('Terjadi kesalahan pemindaian.');
      setIsProcessing(false);
    });
  };

  const handleTranslate = async () => {
    if (!ocrText || ocrText === 'Tidak ada teks yang terdeteksi.') return;
    setIsTranslating(true);
    
    const selectedLangObj = LANGUAGES.find(l => l.code === sourceLang);
    const sl = selectedLangObj ? selectedLangObj.gtCode : 'auto';

    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=id&dt=t&q=${encodeURIComponent(ocrText)}`);
      const json = await res.json();
      if (json && json[0]) {
        const translation = json[0].map((item: any) => item[0]).join('');
        setTranslatedText(translation);
      } else {
        setTranslatedText('Gagal menerjemahkan teks.');
      }
    } catch (e) {
      console.error(e);
      setTranslatedText('Terjadi gangguan jaringan saat menerjemahkan.');
    } finally {
      setIsTranslating(false);
    }
  };

  const copyText = (text: string, type: 'ocr' | 'trans') => {
    navigator.clipboard.writeText(text);
    if (type === 'ocr') {
      setCopiedOcr(true);
      setTimeout(() => setCopiedOcr(false), 2000);
    } else {
      setCopiedTrans(true);
      setTimeout(() => setCopiedTrans(false), 2000);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreviewUrl('');
    setOcrText('');
    setTranslatedText('');
    setProgress(0);
    setProgressStatus('');
  };

  return (
    <div className="w-full">
      <SEO 
        title="Pemindai OCR & Penerjemah Gambar - Deteksi Teks Instan" 
        description="Pindai tulisan dari foto/gambar dokumen secara offline dan terjemahkan langsung ke Bahasa Indonesia dengan cepat, gratis, dan aman." 
        keywords="ocr gratis, scanner gambar, deteksi teks foto, translate tulisan gambar, scan dokumen online, kanvaskita" 
      />

      {/* Mini Hero Section */}
      <div className="relative w-full min-h-[400px] md:min-h-[450px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden py-16 flex flex-col justify-center select-none transition-colors duration-300">
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <div className="absolute inset-0 bg-slate-950/45 dark:bg-slate-950/70 transition-colors duration-300" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12)_0%,rgba(3,1,9,0.85)_80%)] transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-50 dark:from-slate-50 via-transparent to-transparent pointer-events-none" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in flex flex-col items-start text-left">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-violet-500/10 backdrop-blur-md border border-violet-550/20 shadow-xl mb-6">
            <Languages className="h-8 w-8 text-violet-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
            Pemindai OCR &<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-purple-400 to-pink-400">
              Penerjemah Gambar
            </span>
          </h1>
          <p className="mt-2 text-base sm:text-lg text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed">
            Ekstrak teks dari gambar dokumen atau foto asing secara instan di browser Anda menggunakan teknologi OCR lokal, lalu terjemahkan ke Bahasa Indonesia dalam satu klik.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-20">
        {!image ? (
          /* Upload Area */
          <div className="max-w-3xl mx-auto mt-6">
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-14 text-center cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-md bg-white/40 dark:bg-slate-900/40 ${
                dragActive 
                  ? 'border-violet-500 dark:border-violet-400 bg-violet-500/10 dark:bg-violet-500/5 scale-[0.985] shadow-[0_0_20px_rgba(139,92,246,0.2)]' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 hover:shadow-xl dark:hover:shadow-violet-950/20 hover:-translate-y-0.5'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              
              {/* Glowing ambient light */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="w-20 h-20 mx-auto rounded-2xl bg-violet-50 dark:bg-violet-950/50 border border-violet-100/50 dark:border-violet-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-9 h-9 text-violet-600 dark:text-violet-400 animate-pulse" />
              </div>
              
              <h3 className="text-xl font-black text-slate-850 dark:text-white mb-2 tracking-tight">Pilih Foto atau Dokumen Gambar</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-xs leading-relaxed max-w-sm mx-auto">Mendukung gambar JPG, JPEG, PNG, atau WebP secara lokal.</p>
              
              <button className="bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-650 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer">
                Pilih File Gambar
              </button>
            </div>

            {/* Informational Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="flex items-start gap-4 p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl backdrop-blur-md">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/30 dark:border-indigo-900/20 text-indigo-650 dark:text-indigo-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">Privasi Dokumen Terjamin</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                    Pengenalan teks (OCR) diproses langsung oleh browser Anda menggunakan teknologi Tesseract.js. Gambar tidak akan pernah dikirim ke server luar.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl backdrop-blur-md">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100/30 dark:border-amber-900/20 text-amber-650 dark:text-amber-400">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">Deteksi Multibahasa</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                    Mendukung pemindaian karakter bahasa Inggris, Jepang, Mandarin, Jerman, Arab, Spanyol, dan Prancis secara akurat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            
            {/* Left Column: Image view & Actions */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-150 dark:border-slate-800">
                  Sumber Gambar & Bahasa
                </h3>

                {/* Select language */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-450 uppercase">Bahasa Teks Pada Gambar</label>
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    disabled={isProcessing}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-sm outline-none text-slate-700 dark:text-slate-200"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                {/* Preview Image */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <img src={previewUrl} alt="Preview OCR" className="max-w-full max-h-full object-contain" />
                </div>

                {/* Progress bar */}
                {isProcessing && (
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-violet-500 animate-pulse">{progressStatus}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-violet-600 h-full rounded-full transition-all duration-350" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {/* Main Action buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleReset}
                    disabled={isProcessing}
                    className="flex-grow py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-semibold text-slate-500 transition-colors cursor-pointer"
                  >
                    Ganti Gambar
                  </button>
                  <button
                    onClick={handleProcessOCR}
                    disabled={isProcessing}
                    className="flex-grow py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Pindai Gambar (OCR)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Extracted text & Translate */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col gap-5">
                
                {/* OCR Output Textarea */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
                      <FileText size={14} className="text-violet-500" />
                      Hasil Pemindaian Teks (OCR)
                    </span>
                    {ocrText && (
                      <button
                        onClick={() => copyText(ocrText, 'ocr')}
                        className="text-[10px] font-bold text-slate-450 hover:text-violet-500 transition-colors flex items-center gap-1"
                      >
                        {copiedOcr ? (
                          <span className="text-emerald-500 flex items-center gap-0.5"><Check size={10} /> Tersalin</span>
                        ) : (
                          <span className="flex items-center gap-0.5"><Copy size={10} /> Salin Teks</span>
                        )}
                      </button>
                    )}
                  </div>
                  <textarea
                    readOnly
                    value={ocrText}
                    placeholder="Klik tombol 'Pindai Gambar (OCR)' di sebelah kiri untuk mendeteksi tulisan..."
                    className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none resize-none text-slate-700 dark:text-slate-200"
                  />
                </div>

                {/* Translate Divider */}
                <div className="flex justify-center my-2">
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating || !ocrText || ocrText === 'Tidak ada teks yang terdeteksi.'}
                    className="py-2.5 px-6 bg-indigo-500 hover:bg-indigo-650 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isTranslating ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Languages size={14} />
                    )}
                    Terjemahkan ke Bahasa Indonesia
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* Translation Output Textarea */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
                      <Languages size={14} className="text-indigo-500" />
                      Teks Terjemahan (Bahasa Indonesia)
                    </span>
                    {translatedText && (
                      <button
                        onClick={() => copyText(translatedText, 'trans')}
                        className="text-[10px] font-bold text-slate-450 hover:text-indigo-500 transition-colors flex items-center gap-1"
                      >
                        {copiedTrans ? (
                          <span className="text-emerald-500 flex items-center gap-0.5"><Check size={10} /> Tersalin</span>
                        ) : (
                          <span className="flex items-center gap-0.5"><Copy size={10} /> Salin Teks</span>
                        )}
                      </button>
                    )}
                  </div>
                  <textarea
                    readOnly
                    value={translatedText}
                    placeholder="Hasil terjemahan bahasa Indonesia akan muncul di sini setelah Anda mengklik tombol terjemah..."
                    className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none resize-none text-slate-700 dark:text-slate-200"
                  />
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
