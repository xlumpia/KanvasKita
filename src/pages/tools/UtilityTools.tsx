import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Palette, 
  FileCode, 
  Upload, 
  Copy, 
  Check, 
  Download 
} from 'lucide-react';
import { SEO } from '../../components/SEO';

export const UtilityTools = () => {
  const location = useLocation();
  const path = location.pathname;

  // Determine active tool
  let activeTool: 'color' | 'svg' = 'color';
  if (path === '/konverter-vektor') activeTool = 'svg';

  // State for Color Extractor
  const [_colorImage, setColorImage] = useState<File | null>(null);
  const [colorPreview, setColorPreview] = useState<string>('');
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // State for SVG to PNG
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [pngUrl, setPngUrl] = useState<string>('');
  const svgInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop states
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleColorDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setColorImage(file);
        if (colorPreview) URL.revokeObjectURL(colorPreview);
        const url = URL.createObjectURL(file);
        setColorPreview(url);
        extractColorsFromImage(url);
      }
    }
  };

  const handleSvgDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.svg') || file.type === 'image/svg+xml') {
        setSvgFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setSvgContent(text);
          convertSvgToPng(text);
        };
        reader.readAsText(file);
      }
    }
  };

  // Effect to handle URL cleanups
  useEffect(() => {
    return () => {
      if (colorPreview) URL.revokeObjectURL(colorPreview);
      if (pngUrl) URL.revokeObjectURL(pngUrl);
    };
  }, [colorPreview, pngUrl]);

  // Handle Color Extractor File Upload
  const handleColorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setColorImage(file);
      if (colorPreview) URL.revokeObjectURL(colorPreview);
      const url = URL.createObjectURL(file);
      setColorPreview(url);
      extractColorsFromImage(url);
    }
  };

  const extractColorsFromImage = (url: string) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);

      const imgData = ctx.getImageData(0, 0, 100, 100).data;
      const points = [
        { x: 25, y: 25 },
        { x: 75, y: 25 },
        { x: 50, y: 50 },
        { x: 25, y: 75 },
        { x: 75, y: 75 },
        { x: 50, y: 20 }
      ];

      const colors: string[] = points.map(pt => {
        const idx = (pt.y * 100 + pt.x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];
        const toHex = (c: number) => {
          const hex = c.toString(16);
          return hex.length === 1 ? '0' : '' + hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
      });

      // Filter unique
      setExtractedColors(Array.from(new Set(colors)));
    };
  };

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };



  // SVG to PNG Conversion
  const handleSvgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSvgFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setSvgContent(text);
        convertSvgToPng(text);
      };
      reader.readAsText(file);
    }
  };

  const convertSvgToPng = (svgText: string) => {
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    
    const img = new Image();
    img.src = blobUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Higher resolution output
      canvas.width = img.width || 800;
      canvas.height = img.height || 800;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          if (pngUrl) URL.revokeObjectURL(pngUrl);
          setPngUrl(URL.createObjectURL(pngBlob));
        }
        URL.revokeObjectURL(blobUrl);
      }, 'image/png');
    };
  };

  return (
    <div className="w-full">
      {activeTool === 'color' && (
        <>
          <SEO 
            title="Ekstraktor Warna Gambar - Ambil Palet HEX & RGB" 
            description="Unggah foto Anda untuk mengekstrak kode warna HEX dan RGB secara instan langsung di browser Anda secara offline." 
            keywords="ekstraktor warna, ambil warna foto, color picker online, hex code generator, kanvaskita" 
          />
          
          <div className="relative w-full min-h-[350px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden py-16 flex flex-col justify-center select-none transition-colors duration-300">
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
              <div className="absolute inset-0 bg-slate-950/45 dark:bg-slate-950/70 transition-colors duration-300" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1)_0%,rgba(3,1,9,0.85)_80%)] transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-50 dark:from-slate-50 via-transparent to-transparent pointer-events-none" />
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in flex flex-col items-start text-left">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-rose-500/10 backdrop-blur-md border border-rose-550/20 shadow-xl mb-6">
                <Palette className="h-8 w-8 text-rose-500" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
                Ekstraktor Warna<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-400 to-indigo-400">
                  Palet Gambar
                </span>
              </h1>
              <p className="mt-2 text-base text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed">
                Ekstrak palet warna indah dari gambar Anda secara otomatis. Cari tahu nilai kode HEX/RGB warna dengan sekali klik, 100% offline.
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-8 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Uploader Card */}
              <div className="md:col-span-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
                <h3 className="font-bold text-base mb-4">Unggah Gambar</h3>
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleColorDrop}
                  onClick={() => colorInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-md bg-white/40 dark:bg-slate-900/40 aspect-video flex flex-col justify-center items-center ${
                    dragActive 
                      ? 'border-rose-500 dark:border-rose-450 bg-rose-500/10 dark:bg-rose-500/5 scale-[0.985] shadow-[0_0_20px_rgba(244,63,94,0.15)]' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500 hover:shadow-lg dark:hover:shadow-rose-950/20'
                  }`}
                >
                  <input 
                    ref={colorInputRef} 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleColorFileChange} 
                  />
                  {colorPreview ? (
                    <img src={colorPreview} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                  ) : (
                    <>
                      {/* Glowing ambient light */}
                      <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                      <Upload className="w-8 h-8 text-rose-500 mb-3 animate-pulse" />
                      <p className="text-xs font-black text-slate-800 dark:text-white tracking-tight">Pilih Gambar Anda</p>
                      <p className="text-[10px] text-slate-400 mt-1">Seret & lepas foto atau klik di sini secara lokal</p>
                    </>
                  )}
                </div>
              </div>

              {/* Palette Card */}
              <div className="md:col-span-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base mb-2">Palet Warna Hasil Ekstrak</h3>
                  <p className="text-[11px] text-slate-400 mb-6">Klik pada kode warna di bawah untuk menyalin kode HEX langsung ke clipboard.</p>
                  
                  {extractedColors.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400 font-medium">
                      Silakan unggah gambar di sebelah kiri untuk melihat palet warna.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {extractedColors.map(color => (
                        <button
                          key={color}
                          onClick={() => copyToClipboard(color)}
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-150 dark:border-slate-800 hover:border-rose-500 transition-colors text-left"
                        >
                          <span className="w-8 h-8 rounded-lg shrink-0 shadow-inner border border-black/10" style={{ backgroundColor: color }} />
                          <div className="min-w-0 flex-grow">
                            <p className="text-xs font-black text-slate-800 dark:text-white truncate">{color}</p>
                            <span className="text-[9px] font-bold text-slate-450 uppercase flex items-center gap-1">
                              {copiedColor === color ? (
                                <span className="text-emerald-500 flex items-center gap-0.5"><Check size={8} /> Tersalin</span>
                              ) : (
                                <span className="flex items-center gap-0.5"><Copy size={8} /> Salin</span>
                              )}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {extractedColors.length > 0 && (
                  <button 
                    onClick={() => {
                      setColorImage(null);
                      setColorPreview('');
                      setExtractedColors([]);
                    }}
                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl mt-6 transition-colors"
                  >
                    Reset Gambar
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}



      {activeTool === 'svg' && (
        <>
          <SEO 
            title="Konverter SVG ke PNG - Render Vektor ke Gambar" 
            description="Unggah file vektor SVG Anda dan konversikan langsung ke file gambar raster PNG transparan secara cepat dan offline." 
            keywords="svg ke png, konverter svg, render svg online, format gambar vektor, kanvaskita" 
          />
          
          <div className="relative w-full min-h-[350px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden py-16 flex flex-col justify-center select-none transition-colors duration-300">
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
              <div className="absolute inset-0 bg-slate-950/45 dark:bg-slate-950/70 transition-colors duration-300" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1)_0%,rgba(3,1,9,0.85)_80%)] transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-50 dark:from-slate-50 via-transparent to-transparent pointer-events-none" />
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in flex flex-col items-start text-left">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-550/20 shadow-xl mb-6">
                <FileCode className="h-8 w-8 text-amber-500" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
                Konverter SVG<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400">
                  ke PNG Transparan
                </span>
              </h1>
              <p className="mt-2 text-base text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed">
                Ubah gambar vektor SVG Anda menjadi format file raster PNG transparan dengan resolusi tinggi. Instan dan 100% diproses offline.
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-8 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Uploader Card */}
              <div className="md:col-span-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
                <h3 className="font-bold text-base mb-4">Unggah File SVG</h3>
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleSvgDrop}
                  onClick={() => svgInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-md bg-white/40 dark:bg-slate-900/40 aspect-video flex flex-col justify-center items-center ${
                    dragActive 
                      ? 'border-amber-500 dark:border-amber-450 bg-amber-500/10 dark:bg-amber-500/5 scale-[0.985] shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-lg dark:hover:shadow-amber-950/20'
                  }`}
                >
                  <input 
                    ref={svgInputRef} 
                    type="file" 
                    className="hidden" 
                    accept=".svg" 
                    onChange={handleSvgChange} 
                  />
                  {svgContent ? (
                    <div 
                      className="max-w-full max-h-full overflow-hidden shrink-0 pointer-events-none scale-90"
                      dangerouslySetInnerHTML={{ __html: svgContent }} 
                    />
                  ) : (
                    <>
                      {/* Glowing ambient light */}
                      <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

                      <Upload className="w-8 h-8 text-amber-500 mb-3 animate-pulse" />
                      <p className="text-xs font-black text-slate-885 dark:text-white tracking-tight">Pilih Berkas SVG</p>
                      <p className="text-[10px] text-slate-400 mt-1">Seret & letakkan berkas SVG di sini secara lokal</p>
                    </>
                  )}
                </div>
              </div>

              {/* Render Card */}
              <div className="md:col-span-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base mb-2">Hasil PNG Transparan</h3>
                  <p className="text-[11px] text-slate-450 mb-6">Gunakan tombol unduh di bawah setelah SVG Anda dikonversi.</p>
                  
                  {pngUrl ? (
                    <div className="aspect-video rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 overflow-hidden flex items-center justify-center p-3 relative bg-[radial-gradient(circle_at_center,#ccc_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,#333_1px,transparent_1px)] [background-size:16px_16px]">
                      <img src={pngUrl} alt="PNG Render" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="text-center py-10 text-xs text-slate-400 font-medium">
                      Silakan pilih berkas SVG di sebelah kiri untuk merender ke PNG.
                    </div>
                  )}
                </div>

                {pngUrl && (
                  <div className="flex gap-2 mt-6">
                    <button 
                      onClick={() => {
                        setSvgFile(null);
                        setSvgContent('');
                        setPngUrl('');
                      }}
                      className="flex-grow py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-355 font-bold text-xs rounded-xl transition-colors"
                    >
                      Reset
                    </button>
                    <a 
                      href={pngUrl}
                      download={svgFile ? svgFile.name.replace('.svg', '.png') : 'vector.png'}
                      className="flex-grow py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Download size={14} />
                      Unduh PNG
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
