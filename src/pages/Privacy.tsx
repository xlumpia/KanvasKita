import { Shield, Eye, Server, Cookie, Lock, Mail } from 'lucide-react';
import { SEO } from '../components/SEO';

export const Privacy = () => {
  return (
    <div className="w-full">
      <SEO
        title="Kebijakan Privasi - KanvasKita"
        description="KanvasKita berkomitmen untuk melindungi privasi Anda. Semua pemrosesan gambar dilakukan 100% secara lokal di browser Anda tanpa mengirim data ke server manapun."
        keywords="kebijakan privasi, privasi kanvaskita, keamanan data, privasi gambar, offline image tool"
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
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400 drop-shadow-md" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
            <span className="text-[#ffffff]">Kebijakan</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Privasi
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
              KanvasKita adalah kumpulan alat pengolah gambar yang dirancang dengan prinsip utama: <strong className="text-indigo-600">privasi penuh untuk pengguna</strong>. Halaman ini menjelaskan secara transparan bagaimana kami menangani (atau lebih tepatnya, <em>tidak</em> menangani) data Anda.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                <Server className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">Tidak Ada Upload ke Server</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Semua pemrosesan gambar — mulai dari menghapus background, mengompres, mengonversi format, menambahkan watermark, hingga membuat QR code — dilakukan <strong>sepenuhnya di dalam browser Anda</strong>. File gambar yang Anda pilih tidak pernah dikirimkan ke server kami atau pihak ketiga manapun. Data Anda tetap berada di perangkat Anda.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40">
                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">Tidak Ada Pengumpulan Data Pribadi</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Kami tidak mengharuskan Anda membuat akun, login, atau memberikan informasi pribadi apapun. Kami tidak mengumpulkan nama, alamat email, alamat IP, atau informasi identitas lainnya. Anda dapat menggunakan seluruh fitur KanvasKita secara anonim sepenuhnya.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-900/40">
                <Cookie className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">Penggunaan Cookie & Penyimpanan Lokal</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              KanvasKita hanya menggunakan <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">localStorage</code> browser untuk menyimpan preferensi tampilan Anda (seperti pilihan tema Dark Mode atau Neon Mode). Data ini tersimpan di perangkat Anda sendiri dan tidak pernah dikirim ke mana pun. Kami tidak menggunakan cookie pelacak, analitik pihak ketiga (seperti Google Analytics), atau iklan.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">Keamanan Data Anda</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Karena tidak ada data yang meninggalkan perangkat Anda, risiko kebocoran data dari sisi server adalah nol. Keamanan gambar dan file Anda sepenuhnya berada di tangan Anda. Pastikan Anda menggunakan browser yang selalu diperbarui untuk mendapatkan proteksi terbaik dari sisi klien.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40">
                <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">Hubungi Kami</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Jika Anda memiliki pertanyaan atau kekhawatiran terkait privasi saat menggunakan KanvasKita, silakan hubungi kami. Kami berkomitmen untuk menjawab setiap pertanyaan dengan transparan.
            </p>
          </section>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Kebijakan privasi ini berlaku untuk layanan KanvasKita yang tersedia di situs ini. Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan signifikan akan diinformasikan melalui halaman ini.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
