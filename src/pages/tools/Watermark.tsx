import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Type, Image as ImageIcon, ShieldAlert, RefreshCw, ShieldCheck } from 'lucide-react';
import { SEO } from '../../components/SEO';

type WatermarkType = 'text' | 'image';
type PositionMode = 'topLeft' | 'topCenter' | 'topRight' | 'centerLeft' | 'center' | 'centerRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'tile' | 'custom';

export const Watermark = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  // Watermark Settings
  const [wmType, setWmType] = useState<WatermarkType>('text');
  
  // Text Watermark Options
  const [wmText, setWmText] = useState<string>('KanvasKita');
  const [wmColor, setWmColor] = useState<string>('#ffffff');
  const [wmFont, setWmFont] = useState<string>('sans-serif');
  const [wmStyle, setWmStyle] = useState<string>('bold'); // normal, bold, italic
  
  // Logo Watermark Options
  const [wmLogo, setWmLogo] = useState<string | null>(null);
  const [wmLogoName, setWmLogoName] = useState<string>('');

  // General Settings
  const [opacity, setOpacity] = useState<number>(40); // 10-100
  const [scale, setScale] = useState<number>(20); // 5-100 (percentage of image size)
  const [rotation, setRotation] = useState<number>(0); // -180 to 180
  const [position, setPosition] = useState<PositionMode>('bottomRight');
  const [customX, setCustomX] = useState<number>(0);
  const [customY, setCustomY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [hasApplied, setHasApplied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainImageRef = useRef<HTMLImageElement | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  // Clean up original image Object URL only on component unmount or when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Clean up watermark download Object URL only on component unmount or when downloadUrl changes
  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setupImage(e.target.files[0]);
    }
  };

  const setupImage = (file: File) => {
    setImage(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Preload the main image to prevent asynchronous canvas rendering delays
    const img = new Image();
    img.src = url;
    img.onload = () => {
      mainImageRef.current = img;
      setCustomX(img.width / 2);
      setCustomY(img.height / 2);
      drawOriginalImage();
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setWmLogoName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoData = event.target?.result as string;
        setWmLogo(logoData);

        // Preload logo image
        const img = new Image();
        img.src = logoData;
        img.onload = () => {
          logoImageRef.current = img;
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const drawOriginalImage = () => {
    const img = mainImageRef.current;
    if (!img || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl('');
  };

  const renderCanvas = (xVal?: number, yVal?: number) => {
    const mainImg = mainImageRef.current;
    if (!mainImg || !canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Set canvas size to match original image
    canvas.width = mainImg.width;
    canvas.height = mainImg.height;

    // 2. Draw original image
    ctx.drawImage(mainImg, 0, 0);

    // 3. Configure watermark properties
    ctx.save();
    ctx.globalAlpha = opacity / 100;

    // Helper function to draw watermark centered on target coordinates
    const drawWatermarkItem = (targetX: number, targetY: number, sizeRef: number) => {
      ctx.save();
      ctx.translate(targetX, targetY);
      ctx.rotate((rotation * Math.PI) / 180);

      if (wmType === 'text') {
        const fontSize = Math.max(16, Math.round(sizeRef * (scale / 100)));
        ctx.font = `${wmStyle === 'bold' ? 'bold' : ''} ${wmStyle === 'italic' ? 'italic' : ''} ${fontSize}px ${wmFont}`;
        ctx.fillStyle = wmColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(wmText, 0, 0);
      } else if (wmType === 'image' && logoImageRef.current) {
        const logoImg = logoImageRef.current;
        const logoWidth = sizeRef * (scale / 100);
        const logoHeight = logoWidth * (logoImg.height / logoImg.width);
        ctx.drawImage(logoImg, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
      }
      ctx.restore();
    };

    // Calculate size reference
    const sizeRef = Math.min(canvas.width, canvas.height);
    const margin = sizeRef * 0.08; // 8% margin

    let targetX = xVal ?? customX;
    let targetY = yVal ?? customY;
    
    const textMetricsWidth = wmType === 'text' ? ctx.measureText(wmText).width : sizeRef * (scale / 100);
    const wmWidth = Math.max(50, textMetricsWidth);
    const wmHeight = wmType === 'text' ? Math.round(sizeRef * (scale / 100)) : wmWidth;

    if (position !== 'tile') {
      if (position !== 'custom') {
        switch (position) {
          case 'topLeft':
            targetX = margin + wmWidth / 2;
            targetY = margin + wmHeight / 2;
            break;
          case 'topCenter':
            targetX = canvas.width / 2;
            targetY = margin + wmHeight / 2;
            break;
          case 'topRight':
            targetX = canvas.width - margin - wmWidth / 2;
            targetY = margin + wmHeight / 2;
            break;
          case 'centerLeft':
            targetX = margin + wmWidth / 2;
            targetY = canvas.height / 2;
            break;
          case 'center':
            targetX = canvas.width / 2;
            targetY = canvas.height / 2;
            break;
          case 'centerRight':
            targetX = canvas.width - margin - wmWidth / 2;
            targetY = canvas.height / 2;
            break;
          case 'bottomLeft':
            targetX = margin + wmWidth / 2;
            targetY = canvas.height - margin - wmHeight / 2;
            break;
          case 'bottomCenter':
            targetX = canvas.width / 2;
            targetY = canvas.height - margin - wmHeight / 2;
            break;
          case 'bottomRight':
            targetX = canvas.width - margin - wmWidth / 2;
            targetY = canvas.height - margin - wmHeight / 2;
            break;
        }
      }
      drawWatermarkItem(targetX, targetY, sizeRef);
    } else {
      const stepX = sizeRef * 0.35;
      const stepY = sizeRef * 0.35;
      
      for (let gridX = stepX / 2; gridX < canvas.width; gridX += stepX) {
        for (let gridY = stepY / 2; gridY < canvas.height; gridY += stepY) {
          drawWatermarkItem(gridX, gridY, sizeRef);
        }
      }
    }

    ctx.restore();
  };

  const drawWatermark = () => {
    const mainImg = mainImageRef.current;
    if (!mainImg || !canvasRef.current || !image) return;
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const sizeRef = Math.min(canvas.width, canvas.height);
    const margin = sizeRef * 0.08;
    const textMetricsWidth = wmType === 'text' ? canvas.getContext('2d')?.measureText(wmText).width || 100 : sizeRef * (scale / 100);
    const wmWidth = Math.max(50, textMetricsWidth);
    const wmHeight = wmType === 'text' ? Math.round(sizeRef * (scale / 100)) : wmWidth;

    let targetX = customX;
    let targetY = customY;

    if (position !== 'tile' && position !== 'custom') {
      switch (position) {
        case 'topLeft':
          targetX = margin + wmWidth / 2;
          targetY = margin + wmHeight / 2;
          break;
        case 'topCenter':
          targetX = canvas.width / 2;
          targetY = margin + wmHeight / 2;
          break;
        case 'topRight':
          targetX = canvas.width - margin - wmWidth / 2;
          targetY = margin + wmHeight / 2;
          break;
        case 'centerLeft':
          targetX = margin + wmWidth / 2;
          targetY = canvas.height / 2;
          break;
        case 'center':
          targetX = canvas.width / 2;
          targetY = canvas.height / 2;
          break;
        case 'centerRight':
          targetX = canvas.width - margin - wmWidth / 2;
          targetY = canvas.height / 2;
          break;
        case 'bottomLeft':
          targetX = margin + wmWidth / 2;
          targetY = canvas.height - margin - wmHeight / 2;
          break;
        case 'bottomCenter':
          targetX = canvas.width / 2;
          targetY = canvas.height - margin - wmHeight / 2;
          break;
        case 'bottomRight':
          targetX = canvas.width - margin - wmWidth / 2;
          targetY = canvas.height - margin - wmHeight / 2;
          break;
      }
      setCustomX(targetX);
      setCustomY(targetY);
    }

    // Now render the canvas using the resolved coordinates
    renderCanvas(targetX, targetY);
    
    // Update download URL
    canvas.toBlob((blob) => {
      if (blob) {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(URL.createObjectURL(blob));
        setHasApplied(true);
      }
      setIsProcessing(false);
    }, image.type);
  };

  // Revert canvas to original image and reset applied state when settings change
  useEffect(() => {
    if (image && previewUrl) {
      drawOriginalImage();
      setHasApplied(false);
    }
  }, [image, previewUrl, wmType, wmText, wmColor, wmFont, wmStyle, wmLogo, opacity, scale, rotation]);

  // Handle preset position changes specifically
  useEffect(() => {
    if (image && previewUrl && position !== 'custom') {
      drawOriginalImage();
      setHasApplied(false);
    }
  }, [position]);

  const updatePositionFromClient = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const displayX = clientX - rect.left;
    const displayY = clientY - rect.top;
    
    const actualX = Math.max(0, Math.min(canvas.width, (displayX / rect.width) * canvas.width));
    const actualY = Math.max(0, Math.min(canvas.height, (displayY / rect.height) * canvas.height));
    
    setCustomX(actualX);
    setCustomY(actualY);
    setPosition('custom');
    
    // Render synchronously in real-time
    renderCanvas(actualX, actualY);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || !canvasRef.current || !hasApplied) return;
    setIsDragging(true);
    updatePositionFromClient(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    updatePositionFromClient(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Update the download blob after releasing the drag
      drawWatermark();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!image || !canvasRef.current || !hasApplied || e.touches.length === 0) return;
    setIsDragging(true);
    updatePositionFromClient(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length === 0) return;
    e.preventDefault(); // prevent scroll
    updatePositionFromClient(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleDownload = () => {
    if (!downloadUrl || !image) return;
    const link = document.createElement('a');
    const nameWithoutExt = image.name.substring(0, image.name.lastIndexOf('.'));
    const ext = image.name.split('.').pop() || 'png';
    link.download = `${nameWithoutExt}_watermark.${ext}`;
    link.href = downloadUrl;
    link.click();
  };

  const handleReset = () => {
    setImage(null);
    setPreviewUrl('');
    setDownloadUrl('');
    setHasApplied(false);
    mainImageRef.current = null;
    logoImageRef.current = null;
    setWmType('text');
    setWmText('KanvasKita');
    setWmColor('#ffffff');
    setWmFont('sans-serif');
    setWmStyle('bold');
    setWmLogo(null);
    setWmLogoName('');
    setOpacity(40);
    setScale(20);
    setRotation(0);
    setPosition('bottomRight');
  };

  return (
    <div className="w-full">
      <SEO 
        title="Beri Watermark Gambar - Lindungi Hak Cipta Karya Foto" 
        description="Tambahkan teks atau logo watermark transparan pada gambar Anda secara interaktif dengan drag-and-drop. Lindungi hak cipta karya foto Anda secara offline." 
        keywords="watermark gambar, beri watermark foto, proteksi foto, buat watermark online, tambah logo ke gambar, watermark gratis, kanvaskita" 
      />
      
      {/* Mini Hero Section */}
      <div className="relative w-full min-h-[400px] md:min-h-[450px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden py-16 flex flex-col justify-center select-none transition-colors duration-300">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/watermark.webp"
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
            <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400 drop-shadow-md" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-[1.1] drop-shadow-sm dark:drop-shadow-2xl transition-colors duration-300">
            Lindungi Karyamu<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
              dengan Watermark
            </span>
          </h1>
          
          <p className="mt-2 text-base sm:text-lg text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed drop-shadow-sm transition-colors duration-300">
            Tambahkan teks atau logo watermark transparan pada gambar Anda secara interaktif. Lindungi hak cipta karya Anda dengan aman secara offline di browser.
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
                ? 'border-cyan-500 dark:border-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/5 scale-[0.985] shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 hover:shadow-xl dark:hover:shadow-cyan-950/20 hover:-translate-y-0.5'
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
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100/50 dark:border-cyan-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-9 h-9 text-cyan-600 dark:text-cyan-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-slate-850 dark:text-white mb-2 tracking-tight">
              Pilih Gambar Utama Anda
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto text-xs leading-relaxed">
              Mendukung file gambar PNG, JPG, dan WebP secara lokal.
            </p>
            
            <button className="bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-650 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer">
              Pilih Gambar
            </button>
          </div>
        </div>
      ) : (
        /* Editor Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          
          {/* Kolom Kiri: Panel Control Watermark */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
            
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-105 dark:border-slate-800">
                Pengaturan Watermark
              </h3>
            </div>

            {/* Toggle Watermark Type */}
            <div className="flex gap-2">
              <button
                onClick={() => setWmType('text')}
                className={`flex-grow py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  wmType === 'text' 
                    ? 'border-cyan-600 bg-cyan-50/50 text-cyan-700 dark:border-cyan-500 dark:bg-cyan-950/20 dark:text-cyan-400' 
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400'
                }`}
              >
                <Type size={14} />
                Format Teks
              </button>
              <button
                onClick={() => setWmType('image')}
                className={`flex-grow py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  wmType === 'image' 
                    ? 'border-cyan-600 bg-cyan-50/50 text-cyan-700 dark:border-cyan-500 dark:bg-cyan-950/20 dark:text-cyan-400' 
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400'
                }`}
              >
                <ImageIcon size={14} />
                Format Logo
              </button>
            </div>

            {/* Text options */}
            {wmType === 'text' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Teks Watermark</label>
                  <input 
                    type="text"
                    value={wmText}
                    onChange={(e) => setWmText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Warna Teks</label>
                    <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 bg-white dark:bg-slate-950">
                      <input 
                        type="color" 
                        value={wmColor}
                        onChange={(e) => setWmColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent flex-shrink-0"
                      />
                      <span className="text-[10px] uppercase font-bold text-slate-500">{wmColor}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Font</label>
                    <select
                      value={wmFont}
                      onChange={(e) => setWmFont(e.target.value)}
                      className="px-2.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-none"
                    >
                      <option value="sans-serif">Sans-serif</option>
                      <option value="serif">Serif</option>
                      <option value="monospace">Mono</option>
                      <option value="Impact">Impact</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gaya Font</label>
                  <div className="flex gap-1.5 mt-0.5">
                    {['normal', 'bold', 'italic'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setWmStyle(style)}
                        className={`flex-grow py-1 px-2 text-[10px] font-bold rounded-lg border uppercase ${
                          wmStyle === style 
                            ? 'border-cyan-600 bg-cyan-50/20 text-cyan-600 dark:text-cyan-400' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Logo Options */}
            {wmType === 'image' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Unggah Gambar Logo (Format PNG transparan dianjurkan)</label>
                {!wmLogo ? (
                  <div 
                    onClick={() => logoInputRef.current?.click()}
                    className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:border-cyan-500 dark:hover:border-cyan-400 bg-slate-50/50 dark:bg-slate-900/30 transition-all flex items-center justify-center gap-3"
                  >
                    <input 
                      ref={logoInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    <ImageIcon size={18} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500">Pilih logo gambar watermark...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-cyan-50/20 dark:bg-cyan-950/10 border border-cyan-100 dark:border-cyan-900/40 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <img src={wmLogo} alt="Uploaded logo" className="w-10 h-10 object-contain rounded bg-white p-1 border border-slate-200" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px] md:max-w-[200px]">{wmLogoName}</p>
                        <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">Logo watermark aktif</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setWmLogo(null)}
                      className="py-1 px-2.5 text-[9px] font-bold rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Position Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Posisi Penempatan</label>
              
              {/* Presets grid */}
              <div className="grid grid-cols-3 gap-1 max-w-[260px] mx-auto p-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                {[
                  { id: 'topLeft', label: '↖️' },
                  { id: 'topCenter', label: '⬆️' },
                  { id: 'topRight', label: '↗️' },
                  { id: 'centerLeft', label: '⬅️' },
                  { id: 'center', label: '⏺️' },
                  { id: 'centerRight', label: '➡️' },
                  { id: 'bottomLeft', label: '↙️' },
                  { id: 'bottomCenter', label: '⬇️' },
                  { id: 'bottomRight', label: '↘️' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPosition(item.id as PositionMode)}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm border transition-all ${
                      position === item.id 
                        ? 'bg-white dark:bg-slate-800 border-cyan-500 text-cyan-600 shadow-sm' 
                        : 'border-transparent text-slate-400 hover:text-slate-700'
                    }`}
                    title={item.id}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Tile toggle option */}
              <button
                onClick={() => setPosition(position === 'tile' ? 'bottomRight' : 'tile')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 mt-2 transition-all ${
                  position === 'tile' 
                    ? 'border-cyan-600 bg-cyan-50/50 text-cyan-700 dark:border-cyan-500 dark:bg-cyan-950/20 dark:text-cyan-400' 
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400'
                }`}
              >
                Pola Ubin / Penuh Gambar (Tile)
              </button>

              {/* Custom selection display */}
              <button
                onClick={() => setPosition('custom')}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 mt-2 transition-all ${
                  position === 'custom' 
                    ? 'border-cyan-600 bg-cyan-50/50 text-cyan-700 dark:border-cyan-500 dark:bg-cyan-950/20 dark:text-cyan-400' 
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-655 dark:text-slate-400'
                }`}
              >
                Posisi Kustom (Klik/Seret Gambar)
              </button>
            </div>

            {/* Sliders */}
            <div className="flex flex-col gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              
              {/* Opacity slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-slate-700 dark:text-slate-300">Transparansi (Opacity)</label>
                  <span className="text-cyan-600 dark:text-cyan-400">{opacity}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-400"
                />
              </div>

              {/* Scale size slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-slate-700 dark:text-slate-300">Ukuran Skala Watermark</label>
                  <span className="text-cyan-600 dark:text-cyan-400">{scale}%</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-400"
                />
              </div>

              {/* Rotation slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-slate-700 dark:text-slate-300">Sudut Rotasi</label>
                  <span className="text-cyan-600 dark:text-cyan-400">{rotation}°</span>
                </div>
                <input 
                  type="range" 
                  min="-180" 
                  max="180" 
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-400"
                />
              </div>

            </div>

            {/* Tombol Terapkan di bawah panel kontrol */}
            <button
              onClick={drawWatermark}
              disabled={isProcessing}
              className="w-full py-3 px-4 font-bold text-sm rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white shadow-md transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                'Terapkan Watermark'
              )}
            </button>

          </div>

          {/* Kolom Kanan: Pratinjau Kanvas & Unduh */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Action buttons & info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Hasil Watermark</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pratinjau gambar Anda langsung secara presisi.</p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 self-stretch md:self-auto">
                  <button 
                    onClick={handleReset}
                    className="flex-grow md:flex-grow-0 py-2 px-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-655 dark:text-slate-400 transition-colors"
                  >
                    Ganti Gambar
                  </button>
                  <button 
                    onClick={handleDownload}
                    disabled={isProcessing || !hasApplied || !downloadUrl}
                    className="flex-grow md:flex-grow-0 py-2 px-5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:shadow-none text-white shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    Unduh Gambar
                  </button>
                </div>
              </div>

              {/* Canvas viewport wrapper */}
              <div className="relative p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-center shadow-inner max-h-[50vh] overflow-auto select-none">
                <canvas 
                  ref={canvasRef} 
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                  className={`max-w-full rounded-lg shadow-sm border border-slate-200 dark:border-slate-850 object-contain bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] ${
                    hasApplied ? 'cursor-move' : 'cursor-default'
                  }`}
                />
                
                {!hasApplied && (
                  <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-slate-900/85 dark:bg-slate-800/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md text-center max-w-[280px]">
                      Sesuaikan pengaturan di kiri dan klik "Terapkan Watermark" untuk melihat pratinjau
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-[10px] mt-4">
                <ShieldAlert size={12} className="text-cyan-500" />
                <span>Privasi Penuh: Operasi canvas pemolesan gambar ini 100% diproses di perangkat lokal Anda.</span>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
    </div>
  );
};
