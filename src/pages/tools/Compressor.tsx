import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, RefreshCw, FileImage, ShieldCheck, Zap, X, Minimize } from 'lucide-react';
import { SEO } from '../../components/SEO';

export const Compressor = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  
  const [quality, setQuality] = useState<number>(80); // 10-100
  const [scale, setScale] = useState<number>(100); // 10-100
  const [outputFormat, setOutputFormat] = useState<string>('original'); // original, jpeg, png, webp
  
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Clean up compressed image Object URL only on component unmount or when compressedUrl changes
  useEffect(() => {
    return () => {
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [compressedUrl]);

  // Re-compress when settings change
  useEffect(() => {
    if (image) {
      const delayDebounce = setTimeout(() => {
        handleCompression(image);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [image, quality, scale, outputFormat]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setupImage(file);
    }
  };

  const setupImage = (file: File) => {
    setImage(file);
    setOriginalSize(file.size);
    
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
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

  const handleCompression = (file: File) => {
    setIsCompressing(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsCompressing(false);
          return;
        }

        const width = img.width * (scale / 100);
        const height = img.height * (scale / 100);
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // Determine target MIME type
        let mimeType = file.type;
        if (outputFormat === 'jpeg') mimeType = 'image/jpeg';
        else if (outputFormat === 'png') mimeType = 'image/png';
        else if (outputFormat === 'webp') mimeType = 'image/webp';
        else if (outputFormat === 'original') {
          // If original is PNG, we can fall back to jpeg if quality is changed, 
          // because PNG is lossless and quality settings won't change size.
          // However, we respect outputFormat = original
          mimeType = file.type;
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (compressedUrl) URL.revokeObjectURL(compressedUrl);
              const url = URL.createObjectURL(blob);
              setCompressedUrl(url);
              setCompressedSize(blob.size);
            }
            setIsCompressing(false);
          },
          mimeType,
          quality / 100
        );
      };
    };
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

  const getSavings = (): { percent: number; text: string } => {
    if (originalSize === 0 || compressedSize === 0) return { percent: 0, text: '' };
    const diff = originalSize - compressedSize;
    const percent = Math.round((diff / originalSize) * 100);
    return {
      percent,
      text: percent > 0 ? `Hemat ${percent}%` : `Ukuran bertambah ${Math.abs(percent)}%`
    };
  };

  const getFileExtension = (format: string): string => {
    if (format === 'jpeg') return 'jpg';
    if (format === 'png') return 'png';
    if (format === 'webp') return 'webp';
    if (image) {
      const parts = image.name.split('.');
      return parts.length > 1 ? parts[parts.length - 1] : 'jpg';
    }
    return 'jpg';
  };

  const handleReset = () => {
    setImage(null);
    setPreviewUrl('');
    setCompressedUrl('');
    setOriginalSize(0);
    setCompressedSize(0);
    setQuality(80);
    setScale(100);
    setOutputFormat('original');
  };

  const savings = getSavings();

  return (
    <div className="w-full">
      <SEO 
        title="Kompres Gambar - Perkecil Ukuran Foto JPG, PNG & WebP" 
        description="Perkecil ukuran file gambar JPG, PNG, dan WebP Anda secara gratis tanpa mengurangi kualitas visual secara drastis. 100% aman dan diproses secara lokal di browser Anda." 
        keywords="kompres gambar, perkecil foto, compress jpg, perkecil png, kompres webp, resize foto online, kompres gambar gratis, kanvaskita" 
      />
      
      {/* Mini Hero Section */}
      <div className="relative w-full min-h-[400px] md:min-h-[450px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden py-16 flex flex-col justify-center select-none transition-colors duration-300">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/image compress.png"
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
            <Minimize className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400 drop-shadow-md" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-[1.1] drop-shadow-sm dark:drop-shadow-2xl transition-colors duration-300">
            Kompres Gambar<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
              Tanpa Pecah
            </span>
          </h1>
          
          <p className="mt-2 text-base sm:text-lg text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed drop-shadow-sm transition-colors duration-300">
            Optimalkan ukuran file gambar JPG, PNG, dan WebP Anda secara gratis tanpa mengurangi kualitas visual secara drastis. 100% aman dan diproses secara lokal.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-20">

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
                ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/5 scale-[0.985] shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl dark:hover:shadow-emerald-950/20 hover:-translate-y-0.5'
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
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100/50 dark:border-emerald-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-9 h-9 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-slate-850 dark:text-white mb-2 tracking-tight">
              Seret & Letakkan Gambar
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto text-xs leading-relaxed">
              Atau klik untuk memilih berkas dari folder lokal. Mendukung JPG, PNG, dan WebP.
            </p>
            
            <button className="bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-650 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer">
              Pilih File Gambar
            </button>
          </div>

          {/* Privasi & Informasi Kecepatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="flex items-start gap-4 p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl backdrop-blur-md">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/30 dark:border-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">100% Aman & Privat</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  Gambar Anda diproses secara lokal di browser Anda menggunakan Web Canvas. Tidak ada data yang diunggah ke server.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl backdrop-blur-md">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100/30 dark:border-amber-900/20 text-amber-600 dark:text-amber-400">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">Proses Kilat Offline</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  Ditenagai oleh HTML5 Canvas modern, memberikan hasil kompresi optimal dalam hitungan milidetik secara instan.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tampilan Workspace Editor */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          
          {/* Kolom Kiri: Panel Kontrol Pengaturan */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Pengaturan Kompresi
            </h3>

            {/* Pengaturan Kualitas */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <label className="text-slate-700 dark:text-slate-300">Kualitas Gambar</label>
                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-xs">
                  {quality}%
                </span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
              />
              <span className="text-slate-400 text-[11px] leading-relaxed">
                Menurunkan kualitas dapat mengurangi ukuran file secara drastis dengan sedikit perbedaan visual.
              </span>
            </div>

            {/* Pengaturan Resolusi Skala */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <label className="text-slate-700 dark:text-slate-300">Skala Dimensi</label>
                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded text-xs">
                  {scale}%
                </span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
              />
              <span className="text-slate-400 text-[11px] leading-relaxed">
                Mengubah ukuran resolusi gambar. Sangat cocok jika resolusi gambar asli terlalu besar.
              </span>
            </div>

            {/* Format Hasil */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Format Output</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  { id: 'original', label: 'Asli' },
                  { id: 'jpeg', label: 'JPEG (jpg)' },
                  { id: 'png', label: 'PNG' },
                  { id: 'webp', label: 'WebP' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setOutputFormat(item.id)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      outputFormat === item.id 
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Detail Informasi File Asli */}
            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Informasi File Asli</h4>
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                <FileImage className="w-8 h-8 text-indigo-500 flex-shrink-0" />
                <div className="min-w-0 flex-grow">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{image.name}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">{formatSize(originalSize)} • {image.type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Pratinjau & Hasil Kompresi */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Panel Hasil & Statistik */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Hasil Optimasi</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bandingkan file dan unduh hasilnya secara langsung.</p>
                </div>
                
                {/* Tombol aksi */}
                <div className="flex items-center gap-2 self-stretch md:self-auto">
                  <button 
                    onClick={handleReset}
                    className="flex-grow md:flex-grow-0 py-2 px-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors flex items-center justify-center gap-2"
                  >
                    Kompres Lain
                  </button>
                  {compressedUrl && (
                    <a
                      href={compressedUrl}
                      download={`compressed_${image.name.split('.')[0]}.${getFileExtension(outputFormat)}`}
                      className="flex-grow md:flex-grow-0 py-2 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={14} />
                      Unduh Gambar
                    </a>
                  )}
                </div>
              </div>

              {/* Grid Statistik Perbandingan */}
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ukuran Awal</span>
                  <span className="text-base md:text-lg font-extrabold text-slate-800 dark:text-white">{formatSize(originalSize)}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ukuran Hasil</span>
                  {isCompressing ? (
                    <span className="flex items-center justify-center h-7 text-emerald-600 dark:text-emerald-400">
                      <RefreshCw size={18} className="animate-spin" />
                    </span>
                  ) : (
                    <span className="text-base md:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{formatSize(compressedSize)}</span>
                  )}
                </div>
                <div className={`p-4 rounded-2xl border ${
                  savings.percent > 0 
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500'
                }`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Penghematan</span>
                  {isCompressing ? (
                    <span className="flex items-center justify-center h-7 text-slate-400">
                      <RefreshCw size={18} className="animate-spin" />
                    </span>
                  ) : (
                    <span className="text-base md:text-lg font-extrabold block truncate">
                      {savings.percent > 0 ? `${savings.percent}%` : '0%'}
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Gambar (Side-by-side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gambar Asli */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Gambar Asli</span>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    {previewUrl && (
                      <img 
                        src={previewUrl} 
                        alt="Original Preview" 
                        className="max-w-full max-h-full object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setLightboxUrl(previewUrl);
                          setLightboxTitle("Gambar Asli");
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Gambar Hasil Kompresi */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Hasil Kompresi</span>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    {isCompressing ? (
                      <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-950/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Mengoptimalkan...</span>
                      </div>
                    ) : null}
                    
                    {compressedUrl ? (
                      <img 
                        src={compressedUrl} 
                        alt="Compressed Preview" 
                        className="max-w-full max-h-full object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setLightboxUrl(compressedUrl);
                          setLightboxTitle("Hasil Kompresi");
                        }}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Menunggu optimasi...</span>
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
            <img 
              src={lightboxUrl} 
              alt={lightboxTitle} 
              className="max-w-full max-h-[85vh] md:max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
          </div>
        </div>
      )}

    </div>
    </div>
  );
};
