import { Info, ShieldCheck, Zap, Heart, Cpu, Lock, Server } from 'lucide-react';
import { SEO } from '../components/SEO';

export const About = () => {
  return (
    <div className="w-full">
      <SEO
        title="Tentang Kami - KanvasKita"
        description="Pelajari visi, misi, dan bagaimana KanvasKita menyediakan alat pengolah gambar yang 100% privat, cepat, dan diproses langsung di browser Anda tanpa server."
        keywords="tentang kanvaskita, visi misi kanvaskita, pengolah gambar lokal, pemrosesan offline browser"
      />

      {/* Mini Hero Section */}
      <div className="relative w-full min-h-[320px] bg-slate-950 overflow-hidden py-14 flex flex-col justify-center select-none">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.2)_0%,transparent_60%)]" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-950 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in flex flex-col items-start text-left">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#ffffff]/10 backdrop-blur-md border border-[#ffffff]/20 shadow-xl mb-6">
            <Info className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400 drop-shadow-md" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
            <span className="text-[#ffffff]">Tentang</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              KanvasKita
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
            Misi kami adalah memberikan kebebasan penuh bagi Anda untuk mengolah gambar secara instan, aman, dan tanpa batasan.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-20">
        <div className="space-y-16">
          
          {/* Vision & Mission */}
          <section className="bg-slate-100/50 border border-slate-200/50 rounded-3xl p-8 md:p-10 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Visi & Misi Kami</h2>
            <p className="text-slate-700 leading-relaxed text-base md:text-lg">
              Kami percaya bahwa privasi data di era digital saat ini adalah hak, bukan opsi. Banyak alat pengolah gambar yang mengharuskan Anda mengunggah file sensitif ke server mereka. 
              <strong className="text-indigo-600"> KanvasKita hadir untuk mendobrak pola tersebut. </strong> 
              Visi kami adalah menciptakan ekosistem utilitas grafis yang berjalan sepenuhnya di sisi klien (client-side) tanpa mengompromikan performa, biaya, maupun kerahasiaan gambar Anda.
            </p>
          </section>

          {/* Three Key Pillars */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">3 Pilar Utama Layanan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xs flex flex-col items-start hover:-translate-y-1 transition-all duration-300">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">100% Privat</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Semua file diolah langsung di memori browser Anda. Tidak ada data yang dikirim ke server cloud mana pun.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xs flex flex-col items-start hover:-translate-y-1 transition-all duration-300">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Performa Cepat</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Memanfaatkan kekuatan komputasi lokal perangkat Anda secara efisien, bebas dari hambatan internet lemot.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xs flex flex-col items-start hover:-translate-y-1 transition-all duration-300">
                <div className="p-3 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Gratis & Tanpa Iklan</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Kami berkomitmen menyediakan utilitas berkualitas premium secara gratis tanpa popup iklan yang mengganggu.
                </p>
              </div>

            </div>
          </section>

          {/* Workflow Comparison */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Bagaimana Data Anda Diproses?</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Server-Based */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 text-rose-500">
                    <Server className="h-5 w-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">Aplikasi Cloud Biasa</span>
                  </div>
                  <ul className="space-y-3.5 text-slate-650 dark:text-slate-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="bg-rose-500/10 text-rose-500 h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                      <span>Gambar Anda diunggah melalui internet ke server cloud pihak ketiga.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-rose-500/10 text-rose-500 h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                      <span>Server menyimpan & memproses gambar Anda (risiko kebocoran data).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-rose-500/10 text-rose-500 h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                      <span>Hasil harus diunduh kembali dari server cloud ke perangkat Anda.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 text-xs text-rose-500 font-semibold bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 text-center">
                  ⚠️ Ada risiko kebocoran privasi dan pemrosesan terhambat koneksi internet.
                </div>
              </div>

              {/* Client-Based (KanvasKita) */}
              <div className="p-6 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 text-indigo-500">
                    <Lock className="h-5 w-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">KanvasKita (Client-Side)</span>
                  </div>
                  <ul className="space-y-3.5 text-slate-700 dark:text-slate-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-500 text-white h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                      <span>Gambar dimasukkan langsung ke sandbox tab browser Anda secara lokal.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-500 text-white h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                      <span>Browser/WASM memproses gambar secara langsung memanfaatkan CPU/GPU lokal.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-500 text-white h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                      <span>Hasil langsung siap diunduh secara instan dan 100% aman.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-center">
                  ✅ 100% Aman & Amanah. File Anda tidak pernah keluar dari perangkat Anda!
                </div>
              </div>

            </div>
          </section>

          {/* Tech Stack */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Teknologi di Balik Layar</h2>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-500 shrink-0">
                <Cpu className="h-10 w-10 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Modern Web Tech Stack</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">
                  KanvasKita dibangun menggunakan teknologi modern mutakhir untuk performa terbaik:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-700">React 18</span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-700">WebAssembly (WASM)</span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-700">Vite</span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-700">Tailwind CSS v4</span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-700">Lucide Icons</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
