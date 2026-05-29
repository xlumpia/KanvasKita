import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, RefreshCw, FileImage, ShieldCheck, Zap } from 'lucide-react';
import { SEO } from '../../components/SEO';

export const Converter = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [convertedUrl, setConvertedUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  
  const [targetFormat, setTargetFormat] = useState<string>('webp'); // webp, png, jpeg, gif, bmp
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up original image Object URL only on component unmount or when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Clean up converted image Object URL only on component unmount or when convertedUrl changes
  useEffect(() => {
    return () => {
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, [convertedUrl]);

  // Re-convert when settings change
  useEffect(() => {
    if (image) {
      const delayDebounce = setTimeout(() => {
        handleConversion(image);
      }, 250);
      return () => clearTimeout(delayDebounce);
    }
  }, [image, targetFormat]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setupImage(e.target.files[0]);
    }
  };

  const setupImage = (file: File) => {
    setImage(file);
    setOriginalSize(file.size);
    
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
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

  const handleConversion = (file: File) => {
    setIsConverting(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsConverting(false);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Determine target MIME type
        let mimeType = 'image/webp';
        if (targetFormat === 'jpeg') mimeType = 'image/jpeg';
        else if (targetFormat === 'png') mimeType = 'image/png';
        else if (targetFormat === 'webp') mimeType = 'image/webp';
        else if (targetFormat === 'gif') mimeType = 'image/gif';
        else if (targetFormat === 'bmp') mimeType = 'image/bmp';

        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (convertedUrl) URL.revokeObjectURL(convertedUrl);
              const url = URL.createObjectURL(blob);
              setConvertedUrl(url);
              setConvertedSize(blob.size);
            }
            setIsConverting(false);
          },
          mimeType,
          0.95 // Keep high quality output for format conversion
        );
      };
    };
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getOriginalExtension = (): string => {
    if (!image) return '';
    return image.name.split('.').pop()?.toUpperCase() || '';
  };

  const getTargetExtension = (): string => {
    if (targetFormat === 'jpeg') return 'jpg';
    return targetFormat;
  };

  const handleReset = () => {
    setImage(null);
    setPreviewUrl('');
    setConvertedUrl('');
    setOriginalSize(0);
    setConvertedSize(0);
    setTargetFormat('webp');
  };

  return (
    <div className="w-full">
      <SEO 
        title="Konverter Format Gambar - Ubah JPG, PNG, WebP" 
        description="Ubah format gambar Anda ke WebP, PNG, JPEG, GIF, atau BMP dengan mudah dan instan secara lokal di browser Anda. Gratis dan 100% aman tanpa diupload." 
        keywords="konverter gambar, ubah format jpg, convert png to webp, jpg ke png, konverter foto gratis, convert image online, kanvaskita" 
      />
      
      {/* Mini Hero Section */}
      <div className="relative w-full min-h-[400px] md:min-h-[450px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden py-16 flex flex-col justify-center select-none transition-colors duration-300">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/convert image.png"
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
            <RefreshCw className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400 drop-shadow-md" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-[1.1] drop-shadow-sm dark:drop-shadow-2xl transition-colors duration-300">
            Konversi Format<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
              Super Cepat
            </span>
          </h1>
          
          <p className="mt-2 text-base sm:text-lg text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed drop-shadow-sm transition-colors duration-300">
            Ubah format gambar Anda ke WebP, PNG, JPEG, GIF, atau BMP dengan mudah dan instan secara lokal di browser Anda. Gratis dan 100% aman tanpa diupload.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-20">

      {!image ? (
        /* Upload Area */
        <div className="max-w-3xl mx-auto mt-10">
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-14 text-center cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-md bg-white/40 dark:bg-slate-900/40 ${
              dragActive 
                ? 'border-blue-500 dark:border-blue-400 bg-blue-500/10 dark:bg-blue-500/5 scale-[0.985] shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                : 'border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-550 hover:shadow-xl dark:hover:shadow-blue-950/20 hover:-translate-y-0.5'
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
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100/50 dark:border-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-9 h-9 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-slate-850 dark:text-white mb-2 tracking-tight">
              Pilih Gambar yang Ingin Dikonversi
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto text-xs leading-relaxed">
              Mendukung file gambar PNG, JPG, WebP, BMP, atau GIF secara lokal.
            </p>
            
            <button className="bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-650 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer">
              Pilih File Gambar
            </button>
          </div>

          {/* Banner Informasi Keamanan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="flex items-start gap-4 p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl backdrop-blur-md">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/30 dark:border-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">Pemrosesan 100% Offline</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  File gambar dikonversi langsung di komputer Anda. Tidak ada data yang diunggah ke server mana pun, menjamin privasi penuh.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl backdrop-blur-md">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100/30 dark:border-amber-900/20 text-amber-600 dark:text-amber-400">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">Konversi Instan</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                  Menggunakan API Canvas bawaan browser yang berkecepatan tinggi, mengubah format gambar dalam sekejap mata.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Workspace Editor */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          
          {/* Kolom Kiri: Panel Control Pengaturan */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Pengaturan Format
            </h3>

            {/* Pemilihan Format Target */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Format Target Baru</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'webp', label: 'WEBP' },
                  { id: 'png', label: 'PNG' },
                  { id: 'jpeg', label: 'JPEG (jpg)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTargetFormat(item.id)}
                    className={`py-3 px-4 text-xs font-bold rounded-xl border transition-all ${
                      targetFormat === item.id 
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400'
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
                <FileImage className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-grow">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{image.name}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                    {formatSize(originalSize)} • Format: {getOriginalExtension()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Pratinjau & Hasil Konversi */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Panel Hasil & Statistik */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Hasil Konversi</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pratinjau dan unduh gambar Anda hasil konversi.</p>
                </div>
                
                {/* Tombol aksi */}
                <div className="flex items-center gap-2 self-stretch md:self-auto">
                  <button 
                    onClick={handleReset}
                    className="flex-grow md:flex-grow-0 py-2 px-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400 transition-colors flex items-center justify-center gap-2"
                  >
                    Konversi Lain
                  </button>
                  {convertedUrl && (
                    <a
                      href={convertedUrl}
                      download={`${image.name.substring(0, image.name.lastIndexOf('.'))}.${getTargetExtension()}`}
                      className="flex-grow md:flex-grow-0 py-2 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={14} />
                      Unduh Gambar
                    </a>
                  )}
                </div>
              </div>

              {/* Statistik Perbandingan */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ukuran Awal</span>
                  <span className="text-base md:text-lg font-extrabold text-slate-850 dark:text-white">{formatSize(originalSize)}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ukuran Hasil</span>
                  {isConverting ? (
                    <span className="flex items-center justify-center h-7 text-blue-600 dark:text-blue-400">
                      <RefreshCw size={18} className="animate-spin" />
                    </span>
                  ) : (
                    <span className="text-base md:text-lg font-extrabold text-blue-600 dark:text-blue-400">
                      {formatSize(convertedSize)} (<span className="uppercase">{targetFormat}</span>)
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Gambar (Side-by-side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gambar Asli */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-550 dark:text-slate-400">Gambar Asli</span>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    {previewUrl && (
                      <img 
                        src={previewUrl} 
                        alt="Original Format Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                </div>

                {/* Gambar Hasil Konversi */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-550 dark:text-slate-400">Hasil Konversi</span>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    {isConverting ? (
                      <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-950/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Mengonversi...</span>
                      </div>
                    ) : null}
                    
                    {convertedUrl ? (
                      <img 
                        src={convertedUrl} 
                        alt="Converted Format Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Menunggu konversi...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
    </div>
  );
};
