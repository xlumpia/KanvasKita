import React, { useState, useEffect, useRef } from 'react';
import { Download, Sparkles, Image as ImageIcon, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { SEO } from '../../components/SEO';

type QRType = 'url' | 'text' | 'email' | 'wifi';

export const QRGenerator = () => {
  const [type, setType] = useState<QRType>('url');
  
  // States for URL / Text
  const [text, setText] = useState<string>('https://kanvaskita.com');
  
  // States for Email
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  
  // States for Wi-Fi
  const [wifiSsid, setWifiSsid] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [wifiEncryption, setWifiEncryption] = useState<string>('WPA'); // WPA, WEP, nopass

  // QR Design States
  const [fgColor, setFgColor] = useState<string>('#0f172a'); // slate-900
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<number>(400);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Generate the raw string based on the chosen type
  const getQRDataString = (): string => {
    switch (type) {
      case 'url':
        return text.trim().startsWith('http://') || text.trim().startsWith('https://') 
          ? text.trim() 
          : `https://${text.trim()}`;
      case 'text':
        return text;
      case 'email':
        return `mailto:${emailAddress.trim()}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
      default:
        return '';
    }
  };

  const drawQRCode = async () => {
    if (!canvasRef.current) return;
    const qrData = getQRDataString();
    
    // Default to placeholder text if data is empty to prevent blank/error QR
    const dataToEncode = qrData.trim() === '' || qrData === 'mailto:?subject=&body=' || qrData === 'WIFI:S:;T:WPA;P:;;' 
      ? 'KanvasKita' 
      : qrData;

    try {
      // Always use High ('H') error correction level if a logo is loaded,
      // so the QR remains readable even with the center covered.
      await QRCode.toCanvas(canvasRef.current, dataToEncode, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: logo ? 'H' : 'M'
      });

      // Draw logo in the center if uploaded
      if (logo) {
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const logoImg = new Image();
        logoImg.src = logo;
        logoImg.onload = () => {
          const qrSize = canvasRef.current!.width;
          const logoSize = qrSize * 0.22; // 22% of QR size is safe for 'H' error correction
          const logoPos = (qrSize - logoSize) / 2;

          // Draw rounded background container for logo
          ctx.fillStyle = bgColor;
          
          // Draw rounded rect border for logo container
          const radius = 6;
          const x = logoPos - 4;
          const y = logoPos - 4;
          const w = logoSize + 8;
          const h = logoSize + 8;
          
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + w - radius, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
          ctx.lineTo(x + w, y + h - radius);
          ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
          ctx.lineTo(x + radius, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();

          // Draw the logo itself (also slightly clipped to round if wanted, or simple image draw)
          ctx.drawImage(logoImg, logoPos, logoPos, logoSize, logoSize);
        };
      }
    } catch (err) {
      console.error('Error rendering QR Code', err);
    }
  };

  // Re-draw whenever inputs/settings change
  useEffect(() => {
    drawQRCode();
  }, [type, text, emailAddress, emailSubject, emailBody, wifiSsid, wifiPassword, wifiEncryption, fgColor, bgColor, size, logo]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoName('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleDownload = (format: 'png' | 'jpeg') => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcode_kanvaskita.${format}`;
    link.href = canvasRef.current.toDataURL(`image/${format}`);
    link.click();
  };

  return (
    <div className="w-full">
      <SEO 
        title="Generator QR Code - Buat Kode QR Kustom Gratis" 
        description="Buat kode QR kustom secara instan untuk URL, teks, email, atau Wi-Fi. Kustomisasi warna, ukuran, dan tambahkan logo Anda sendiri secara gratis." 
        keywords="generator qr code, buat kode qr kustom, qr code gratis, qr generator dengan logo, bikin barcode, qr code wifi, kanvaskita" 
      />
      
      {/* Mini Hero Section */}
      <div className="relative w-full min-h-[400px] md:min-h-[450px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden py-16 flex flex-col justify-center select-none transition-colors duration-300">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/QR generator.png"
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
            <QrCode className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400 drop-shadow-md" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-[1.1] drop-shadow-sm dark:drop-shadow-2xl transition-colors duration-300">
            Buat QR Code<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
              Sesuai Gayamu
            </span>
          </h1>
          
          <p className="mt-2 text-base sm:text-lg text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed drop-shadow-sm transition-colors duration-300">
            Buat kode QR kustom secara instan untuk URL, teks, email, atau Wi-Fi. Kustomisasi warna, ukuran, dan logo Anda sendiri secara gratis tanpa upload ke server.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-20">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* Kolom Kiri: Form Input Data & Desain */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Card 1: Isi Data QR Code */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              1. Pilih Tipe & Isi Konten
            </h3>

            {/* Pemilihan Tipe QR */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { id: 'url', label: 'Tautan' },
                { id: 'text', label: 'Teks Bebas' },
                { id: 'email', label: 'Email' },
                { id: 'wifi', label: 'Wi-Fi' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setType(item.id as QRType)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                    type === item.id 
                      ? 'border-amber-600 bg-amber-50/50 text-amber-700 dark:border-amber-500 dark:bg-amber-950/20 dark:text-amber-400' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Form Input Dinamis Berdasarkan Tipe */}
            {type === 'url' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">URL / Tautan Situs Web</label>
                <input 
                  type="text"
                  placeholder="Contoh: google.com atau https://situsku.com"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                />
              </div>
            )}

            {type === 'text' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Teks Bebas / Pesan</label>
                <textarea 
                  placeholder="Ketik apa saja di sini..."
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 resize-y"
                />
              </div>
            )}

            {type === 'email' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alamat Email Penerima</label>
                  <input 
                    type="email"
                    placeholder="Contoh: halo@situs.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subjek</label>
                  <input 
                    type="text"
                    placeholder="Subjek email"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Isi Pesan</label>
                  <textarea 
                    placeholder="Isi pesan email..."
                    rows={3}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 resize-none"
                  />
                </div>
              </div>
            )}

            {type === 'wifi' && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Wi-Fi (SSID)</label>
                    <input 
                      type="text"
                      placeholder="Nama jaringan Wi-Fi"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipe Enkripsi</label>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Tanpa Kata Sandi (Terbuka)</option>
                    </select>
                  </div>
                </div>
                {wifiEncryption !== 'nopass' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kata Sandi Wi-Fi</label>
                    <input 
                      type="password"
                      placeholder="Masukkan kata sandi jaringan"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Kustomisasi Desain QR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              2. Kustomisasi Desain
            </h3>

            {/* Pilihan Warna */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border border-slate-150 dark:border-slate-800 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Warna Pola (Dark)</span>
                  <span className="text-[10px] text-slate-400">{fgColor}</span>
                </div>
                <input 
                  type="color" 
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-150 dark:border-slate-800 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Warna Latar (Light)</span>
                  <span className="text-[10px] text-slate-400">{bgColor}</span>
                </div>
                <input 
                  type="color" 
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent flex-shrink-0"
                />
              </div>
            </div>

            {/* Slider Ukuran */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <label className="text-slate-700 dark:text-slate-300">Resolusi Ukuran Unduh</label>
                <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                  {size} x {size} px
                </span>
              </div>
              <input 
                type="range" 
                min="200" 
                max="1000" 
                step="50"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-600 dark:accent-amber-400"
              />
            </div>

            {/* Upload Logo Tengah */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Sisipkan Logo di Tengah (Opsional)</label>
              
              {!logo ? (
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:border-amber-500 dark:hover:border-amber-400 bg-slate-50/50 dark:bg-slate-900/30 transition-all flex items-center justify-center gap-3"
                >
                  <input 
                    ref={logoInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <ImageIcon size={18} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pilih logo (png, jpg, ikon svg)</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/40 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="Uploaded logo" className="w-10 h-10 object-contain rounded bg-white p-1 border border-slate-200" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px] md:max-w-[260px]">{logoName}</p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Logo tersemat di pusat QR</p>
                    </div>
                  </div>
                  <button 
                    onClick={removeLogo}
                    className="py-1 px-3 text-[10px] font-bold rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                  >
                    Hapus Logo
                  </button>
                </div>
              )}
              <span className="text-slate-400 text-[10px]">
                *Saat logo digunakan, tingkat koreksi kesalahan (error correction) otomatis dinaikkan ke tingkat tertinggi (High) untuk menjaga agar QR berkode tetap dapat dibaca oleh pemindai.
              </span>
            </div>

          </div>

        </div>

        {/* Kolom Kanan: Hasil Render QR Code & Download */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Card Hasil */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center gap-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-amber-950/15">
            {/* Ambient neon light */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center w-full">
              <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">QR Code Berhasil Dibuat</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pindai langsung dengan smartphone Anda.</p>
            </div>

            {/* Container Canvas */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-950/80 rounded-2xl border border-slate-150 dark:border-slate-850 flex items-center justify-center shadow-inner max-w-full overflow-hidden transition-transform duration-300 hover:scale-[1.015]">
              <canvas 
                ref={canvasRef} 
                className="max-w-full aspect-square rounded-xl shadow-md border border-slate-200/50 dark:border-slate-800/80"
                style={{ width: '280px', height: '280px' }}
              />
            </div>

            {/* Tombol Unduh */}
            <div className="flex flex-col gap-2.5 w-full">
              <button 
                onClick={() => handleDownload('png')}
                className="w-full py-3 px-4 font-bold text-xs rounded-xl bg-amber-600 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-650 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} />
                Unduh Format PNG (Transparansi)
              </button>
              
              <button 
                onClick={() => handleDownload('jpeg')}
                className="w-full py-3 px-4 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Unduh Format JPEG
              </button>
            </div>

            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] mt-1 select-none">
              <Sparkles size={12} className="text-amber-500" />
              <span>Dibuat lokal & diproses aman oleh KanvasKita</span>
            </div>
          </div>

        </div>

      </div>

    </div>
    </div>
  );
};
