import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, RefreshCw, FileImage, ShieldCheck, Zap, X, Wand2, Info } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import { SEO } from '../../components/SEO';

type ProcessMethod = 'ai' | 'chroma';

export const BackgroundRemover = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [resultSize, setResultSize] = useState<number>(0);

  // Settings
  const [method, setMethod] = useState<ProcessMethod>('ai');
  const [chromaColor, setChromaColor] = useState<string>('#ffffff');
  const [tolerance, setTolerance] = useState<number>(40);
  const [feather, setFeather] = useState<number>(10);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox States
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');

  // Lightbox keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxUrl(null);
      }
    };
    if (lightboxUrl) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxUrl]);

  // Clean up original image Object URL only on component unmount or when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Clean up result image Object URL only on component unmount or when resultUrl changes
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  // Reset result when method changes
  useEffect(() => {
    setResultUrl('');
    setResultSize(0);
    setError('');
  }, [method]);

  // Auto-process Chroma Key on setting changes
  useEffect(() => {
    if (image && method === 'chroma' && previewUrl) {
      const delayDebounce = setTimeout(() => {
        const img = new Image();
        img.src = previewUrl;
        img.onload = () => {
          processChromaKey(img, chromaColor, tolerance, feather);
        };
      }, 150);
      return () => clearTimeout(delayDebounce);
    }
  }, [image, method, previewUrl, chromaColor, tolerance, feather]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setupImage(file);
    }
  };

  const setupImage = (file: File) => {
    setImage(file);
    setOriginalSize(file.size);
    setResultUrl('');
    setResultSize(0);
    setError('');
    
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-detect color from top-left pixel
    autoDetectBgColor(url);
  };

  const autoDetectBgColor = (imgUrl: string) => {
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 1;
      canvas.height = 1;
      ctx.drawImage(img, 0, 0, 1, 1);
      const pixel = ctx.getImageData(0, 0, 1, 1).data;
      
      const rgbToHex = (r: number, g: number, b: number) => {
        const toHex = (c: number) => {
          const hex = c.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
      };
      
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setChromaColor(hex);
    };
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

  const handleRemoveBackground = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(0);
    setProgressStage('Menyiapkan mesin pemroses...');
    setError('');

    try {
      const resultBlob = await removeBackground(image, {
        progress: (stage: string, current: number, total: number) => {
          let stageText = 'Memproses...';
          if (stage.includes('fetch')) {
            stageText = 'Mengunduh model AI (~30MB) - hanya untuk pertama kali...';
          } else if (stage.includes('compute')) {
            stageText = 'Menganalisis & memisahkan latar belakang...';
          }
          setProgressStage(stageText);
          
          if (total > 0) {
            const percentage = Math.round((current / total) * 100);
            setProgress(percentage);
          }
        }
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(resultBlob);
      setResultUrl(url);
      setResultSize(resultBlob.size);
    } catch (err) {
      console.error(err);
      setError('Gagal menghapus latar belakang. Pastikan format gambar valid dan coba kembali.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Pure Client-side JS Pixel manipulation for Chroma Key background removal
  const processChromaKey = (img: HTMLImageElement, hexColor: string, tol: number, smooth: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Convert hex target color to RGB
    const targetR = parseInt(hexColor.slice(1, 3), 16);
    const targetG = parseInt(hexColor.slice(3, 5), 16);
    const targetB = parseInt(hexColor.slice(5, 7), 16);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Euclidean distance in RGB color space
      const distance = Math.sqrt(
        (r - targetR) ** 2 +
        (g - targetG) ** 2 +
        (b - targetB) ** 2
      );

      if (distance < tol) {
        data[i + 3] = 0; // Completely Transparent
      } else if (distance < tol + smooth) {
        // Linear interpolation for smooth/feathered edge
        const ratio = (distance - tol) / smooth;
        data[i + 3] = Math.round(ratio * 255);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultSize(blob.size);
      }
    }, 'image/png');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleReset = () => {
    setImage(null);
    setPreviewUrl('');
    setResultUrl('');
    setOriginalSize(0);
    setResultSize(0);
    setProgress(0);
    setProgressStage('');
    setError('');
    setMethod('ai');
  };

  return (
    <div className="w-full">
      <SEO 
        title="Hapus Background Gambar - Hilangkan Latar Belakang Foto Instan" 
        description="Hapus latar belakang foto Anda secara otomatis dan instan langsung di browser. Tersedia metode Deteksi AI presisi tinggi dan metode Chroma Key instan tanpa unduhan." 
        keywords="hapus background, hapus latar belakang, remove bg gratis, potong foto online, hilangkan background, edit foto transparan, chroma key online, kanvaskita" 
      />

      {/* Mini Hero Section */}
      <div className="relative w-full min-h-[400px] md:min-h-[450px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden py-16 flex flex-col justify-center select-none transition-colors duration-300">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/hapus background.png"
            alt="Hero Background"
            className="w-full h-full object-cover object-center opacity-85 dark:opacity-40 select-none pointer-events-none transition-opacity duration-300"
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-slate-950/45 dark:bg-slate-950/70 transition-colors duration-300" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(4,6,10,0.75)_80%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15)_0%,rgba(3,1,9,0.85)_80%)] transition-colors duration-300" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950/95 dark:from-slate-950/95 via-transparent to-transparent pointer-events-none transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-50 dark:from-slate-50 via-transparent to-transparent pointer-events-none transition-colors duration-300" />
        </div>
        
        {/* Left-Aligned Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in flex flex-col items-start text-left">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/10 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-700/50 shadow-xl mb-6">
            <Wand2 className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400 drop-shadow-md" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-[1.1] drop-shadow-sm dark:drop-shadow-2xl transition-colors duration-300">
            Hapus Background<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
              Otomatis & Presisi
            </span>
          </h1>
          
          <p className="mt-2 text-base sm:text-lg text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed drop-shadow-sm transition-colors duration-300">
            Hapus latar belakang foto Anda secara otomatis dan instan langsung di browser tanpa upload ke server.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-20">

      <style>{`
        .checkerboard-pattern {
          background-color: #f8fafc;
          background-image: radial-gradient(#cbd5e1 20%, transparent 20%), radial-gradient(#cbd5e1 20%, transparent 20%);
          background-size: 16px 16px;
          background-position: 0 0, 8px 8px;
        }
        .dark .checkerboard-pattern {
          background-color: #020617;
          background-image: radial-gradient(#334155 20%, transparent 20%), radial-gradient(#334155 20%, transparent 20%);
          background-size: 16px 16px;
          background-position: 0 0, 8px 8px;
        }
      `}</style>
      

      {!image ? (
        /* Tampilan Area Upload (Dropzone) */
        <div className="max-w-3xl mx-auto mt-10">
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-3xl p-14 text-center cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-md bg-white/40 dark:bg-slate-900/40 ${
              dragActive 
                ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/5 scale-[0.985] shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:-translate-y-0.5'
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
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-9 h-9 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-slate-850 dark:text-white mb-2 tracking-tight">
              Seret & Letakkan Gambar
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto text-xs leading-relaxed">
              Atau klik untuk memilih berkas dari folder lokal. Mendukung JPG, PNG, dan WebP.
            </p>
            
            <button className="bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-650 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer">
              Pilih Gambar
            </button>
          </div>

          {/* Banner Privasi & Informasi Kecepatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="flex items-start gap-4 p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl backdrop-blur-md">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/30 dark:border-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">100% Aman & Privat</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  Proses penghapusan latar belakang dilakukan secara lokal di browser Anda. Tidak ada data gambar yang diunggah ke server kami.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl backdrop-blur-md">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100/30 dark:border-amber-900/20 text-amber-600 dark:text-amber-400">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">Pilihan Metode Cerdas</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  Gunakan Deteksi AI cerdas untuk latar belakang yang rumit, atau Chroma Key instan untuk menghilangkan satu warna background secara cepat.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Workspace Editor */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          
          {/* Panel Kontrol & Info Gambar */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6 h-fit">
            
            {/* Pemilihan Metode */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Metode Hapus Latar</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-850">
                <button
                  onClick={() => setMethod('ai')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
                    method === 'ai'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Deteksi AI (Rapi)
                </button>
                <button
                  onClick={() => setMethod('chroma')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
                    method === 'chroma'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Chroma Key (Instan)
                </button>
              </div>
            </div>

            {/* Opsi Metode 1: AI */}
            {method === 'ai' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                  <FileImage className="w-8 h-8 text-indigo-500 flex-shrink-0" />
                  <div className="min-w-0 flex-grow">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{image.name}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                      {formatSize(originalSize)} {resultSize > 0 && `➜ ${formatSize(resultSize)}`}
                    </p>
                  </div>
                </div>

                {/* Status Pemrosesan */}
                {isProcessing && (
                  <div className="flex flex-col gap-2 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl animate-pulse">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      <span className="truncate max-w-[200px]">{progressStage}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 dark:bg-indigo-400 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Info Pertama Kali */}
                {!resultUrl && !isProcessing && (
                  <div className="flex gap-2.5 p-3.5 bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
                    <Info size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Catatan:</strong> Deteksi AI memisahkan latar belakang secara otomatis untuk semua jenis gambar. Menggunakan model AI (~30MB) lokal yang diunduh pada pemakaian pertama.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Opsi Metode 2: Chroma Key */}
            {method === 'chroma' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                  <FileImage className="w-8 h-8 text-indigo-500 flex-shrink-0" />
                  <div className="min-w-0 flex-grow">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{image.name}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                      {formatSize(originalSize)} {resultSize > 0 && `➜ ${formatSize(resultSize)}`}
                    </p>
                  </div>
                </div>

                {/* Pilih Warna Latar */}
                <div className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <label>Warna Latar untuk Dihapus</label>
                    <button 
                      onClick={() => autoDetectBgColor(previewUrl)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded hover:bg-indigo-100 transition-colors"
                      title="Deteksi warna piksel dari ujung kiri-atas gambar"
                    >
                      Reset Warna Otomatis
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <input 
                      type="color" 
                      value={chromaColor}
                      onChange={(e) => setChromaColor(e.target.value)}
                      className="w-11 h-11 rounded-lg cursor-pointer border-0 bg-transparent flex-shrink-0"
                    />
                    <div className="flex-grow">
                      <input 
                        type="text" 
                        value={chromaColor.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('#') && val.length <= 7) {
                            setChromaColor(val);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs font-bold font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Slider Toleransi */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <label className="text-slate-700 dark:text-slate-300">Toleransi Warna</label>
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                      {tolerance}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="200" 
                    value={tolerance}
                    onChange={(e) => setTolerance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
                  />
                  <span className="text-[10px] text-slate-400 leading-normal">
                    Nilai lebih besar akan menghapus rentang warna serupa yang lebih luas.
                  </span>
                </div>

                {/* Slider Kehalusan Tepi (Feather) */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <label className="text-slate-700 dark:text-slate-300">Kehalusan Tepi (Feather)</label>
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                      {feather} px
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={feather}
                    onChange={(e) => setFeather(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
                  />
                  <span className="text-[10px] text-slate-400 leading-normal">
                    Menghaluskan transisi tepi potongan agar tidak tajam/bergerigi.
                  </span>
                </div>
              </div>
            )}

            {/* Pesan Kesalahan */}
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold leading-relaxed">
                {error}
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex flex-col gap-2.5 mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
              {method === 'ai' && !resultUrl && !isProcessing && (
                <button
                  onClick={handleRemoveBackground}
                  className="w-full py-3 px-4 font-semibold text-sm rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Wand2 size={16} />
                  Hapus Latar Belakang
                </button>
              )}

              {resultUrl && (
                <a
                  href={resultUrl}
                  download={`nobg_${image.name.split('.')[0]}.png`}
                  className="w-full py-3 px-4 font-semibold text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Unduh PNG Transparan
                </a>
              )}

              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="w-full py-3 px-4 font-semibold text-sm rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ganti Gambar
              </button>
            </div>
          </div>

          {/* Panel Preview Gambar (Kolom Kanan) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">
                Pratinjau Hasil
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gambar Asli */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Gambar Asli</span>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    {previewUrl && (
                      <img 
                        src={previewUrl} 
                        alt="Original Image" 
                        className="max-w-full max-h-full object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setLightboxUrl(previewUrl);
                          setLightboxTitle("Gambar Asli");
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Gambar Hasil Hapus Background */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Hasil Transparan</span>
                  <div className="relative aspect-square rounded-2xl overflow-hidden checkerboard-pattern border border-slate-200 dark:border-slate-850 flex items-center justify-center">
                    {isProcessing && (
                      <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-950/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                        <RefreshCw size={28} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Menghapus latar belakang...</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{progress}%</span>
                      </div>
                    )}
                    
                    {resultUrl ? (
                      <img 
                        src={resultUrl} 
                        alt="Background Removed Result" 
                        className="max-w-full max-h-full object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setLightboxUrl(resultUrl);
                          setLightboxTitle("Hasil Transparan");
                        }}
                      />
                    ) : (
                      !isProcessing && (
                        <div className="text-center p-6 flex flex-col items-center gap-2">
                          {method === 'ai' ? (
                            <>
                              <Wand2 size={24} className="text-slate-300 dark:text-slate-650" />
                              <span className="text-xs text-slate-400">Klik "Hapus Latar Belakang" untuk memulai proses AI</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw size={24} className="text-slate-300 dark:text-slate-650 animate-spin-slow" />
                              <span className="text-xs text-slate-400">Memproses instan Chroma Key...</span>
                            </>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Lightbox Overlay */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
            <span className="text-white font-semibold text-xs md:text-sm bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              {lightboxTitle}
            </span>
            <button
              onClick={() => setLightboxUrl(null)}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors shadow-lg cursor-pointer"
              aria-label="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
          
          <div 
            className="relative max-w-full max-h-[85vh] md:max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxTitle === "Hasil Transparan" ? (
              <div className="checkerboard-pattern p-2 rounded-2xl border border-slate-800 shadow-2xl">
                <img 
                  src={lightboxUrl} 
                  alt={lightboxTitle} 
                  className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-xl"
                />
              </div>
            ) : (
              <img 
                src={lightboxUrl} 
                alt={lightboxTitle} 
                className="max-w-full max-h-[85vh] md:max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
              />
            )}
          </div>
        </div>
      )}

    </div>
    </div>
  );
};
