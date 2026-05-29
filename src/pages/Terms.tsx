import { ScrollText, CheckCircle, AlertTriangle, XCircle, Scale, Mail } from 'lucide-react';
import { SEO } from '../components/SEO';

export const Terms = () => {
  return (
    <div className="w-full">
      <SEO
        title="Ketentuan Penggunaan - KanvasKita"
        description="Baca ketentuan penggunaan layanan KanvasKita. Layanan ini gratis, aman, dan memproses gambar Anda 100% secara lokal di browser tanpa mengunggah ke server."
        keywords="ketentuan penggunaan, syarat layanan, terms of service, kanvaskita"
      />

      {/* Mini Hero Section */}
      <div className="relative w-full min-h-[320px] bg-slate-950 overflow-hidden py-14 flex flex-col justify-center select-none">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.2)_0%,transparent_60%)]" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-950 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in flex flex-col items-start text-left">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#ffffff]/10 backdrop-blur-md border border-[#ffffff]/20 shadow-xl mb-6">
            <ScrollText className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400 drop-shadow-md" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
            <span className="text-[#ffffff]">Ketentuan</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
              Penggunaan
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-20">
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">

          {/* Intro */}
          <div className="p-6 rounded-2xl bg-slate-100/50 border border-slate-200/50">
            <p className="text-slate-700 text-base leading-relaxed m-0">
              Dengan menggunakan layanan KanvasKita, Anda menyetujui ketentuan penggunaan yang tercantum di bawah ini. Harap baca dengan seksama sebelum menggunakan layanan kami.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">Penggunaan Layanan</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              KanvasKita menyediakan alat pengolah gambar berbasis browser secara <strong>gratis</strong> untuk penggunaan personal maupun komersial. Layanan yang tersedia meliputi:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              {['Hapus Background Gambar (AI & Chroma Key)', 'Kompres Gambar (JPG, PNG, WebP)', 'Konversi Format Gambar', 'Alat PDF (Gabung, Pisah, Kompres, Gambar ke PDF)', 'Generator QR Code Kustom', 'Watermark Gambar (Teks & Logo)'].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">Hak Kekayaan Intelektual</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Anda tetap memiliki hak penuh atas semua gambar dan file yang Anda proses menggunakan KanvasKita. Kami tidak mengklaim kepemilikan atas konten yang Anda buat atau modifikasi melalui layanan ini. Anda bertanggung jawab penuh untuk memastikan bahwa gambar yang Anda gunakan tidak melanggar hak cipta atau hak kekayaan intelektual pihak lain.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">Penggunaan yang Dilarang</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Anda dilarang menggunakan KanvasKita untuk:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              {[
                'Memproses konten yang melanggar hukum, pornografi, atau materi berbahaya lainnya',
                'Membuat konten yang melanggar hak cipta atau hak kekayaan intelektual orang lain',
                'Menyebarkan disinformasi atau memanipulasi gambar untuk tujuan menipu',
                'Melakukan serangan siber atau upaya untuk merusak integritas layanan',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">Batasan Tanggung Jawab</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              KanvasKita disediakan dalam kondisi "sebagaimana adanya" (<em>as-is</em>) tanpa jaminan apapun, baik tersurat maupun tersirat. Kami tidak bertanggung jawab atas:
            </p>
            <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
              {[
                'Kehilangan atau kerusakan file yang diproses (selalu simpan salinan cadangan)',
                'Akurasi hasil pemrosesan AI (seperti hapus background)',
                'Gangguan layanan akibat pembaruan browser atau perangkat',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-900/40">
                <Mail className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">Perubahan Ketentuan</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Kami berhak memperbarui ketentuan penggunaan ini kapan saja. Dengan terus menggunakan layanan KanvasKita setelah perubahan diterbitkan, Anda dianggap telah menyetujui ketentuan yang diperbarui. Jika Anda tidak setuju dengan ketentuan ini, harap hentikan penggunaan layanan.
            </p>
          </section>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Jika Anda memiliki pertanyaan mengenai ketentuan ini, silakan hubungi kami. Ketentuan ini tunduk pada hukum yang berlaku di Indonesia.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
