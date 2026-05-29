import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Calendar, 
  LogOut, 
  LayoutTemplate,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { getCurrentUser, logoutUser, getPublishedTemplates } from '../services/db';
import type { CustomTemplate } from '../services/db';
import { SEO } from '../components/SEO';

export const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [myTemplates, setMyTemplates] = useState<CustomTemplate[]>([]);

  // Fetch session on load
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate('/auth');
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Session lookup failed:', err);
        navigate('/auth');
      } finally {
        setLoadingSession(false);
      }
    };
    fetchSession();
  }, [navigate]);

  // Fetch templates once user session is resolved
  useEffect(() => {
    if (!user) return;
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const allTemplates = await getPublishedTemplates();
        const filtered = allTemplates.filter(t => 
          t.creator_id === user.id ||
          t.creator.toLowerCase() === user.name.toLowerCase() ||
          t.creator.toLowerCase() === user.email.toLowerCase()
        );
        setMyTemplates(filtered);
      } catch (err) {
        console.error('Failed to load user templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();
    // Dispatch auth change event to navbar
    window.dispatchEvent(new Event('auth_change'));
    navigate('/auth');
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-3 text-indigo-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs font-black tracking-wider uppercase">Memuat Sesi...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return 'Tanggal tidak valid';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 transition-colors duration-300">
      <SEO title="Profil Saya - KanvasKita" description="Kelola detail profil Anda dan lihat riwayat publikasi template." />

      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md flex items-center justify-center bg-slate-100 shrink-0 select-none">
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-2xl font-black text-slate-850 dark:text-white">{user.name}</h1>
              
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-xs font-bold text-slate-450">
                <span className="flex items-center justify-center md:justify-start gap-1.5">
                  <Mail size={14} className="text-indigo-500" />
                  {user.email}
                </span>
                <span className="flex items-center justify-center md:justify-start gap-1.5">
                  <Calendar size={14} className="text-indigo-500" />
                  Bergabung: {formatDate(user.createdAt)}
                </span>
              </div>
              
              <span className="inline-block text-[9px] font-black tracking-wider bg-slate-100 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full uppercase">
                Metode: {user.provider === 'email' ? 'Email & Sandi' : user.provider === 'google' ? 'Google OAuth' : 'GitHub OAuth'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-red-500/20 shrink-0 self-stretch md:self-auto justify-center"
          >
            <LogOut size={14} />
            Keluar Sesi
          </button>
        </div>

        {/* Templates Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-slate-850 dark:text-white flex items-center gap-2">
            <LayoutTemplate size={20} className="text-indigo-500" />
            Template yang Saya Ajukan ({myTemplates.length})
          </h2>

          {loadingTemplates ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-indigo-500 select-none flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-bold">Memuat template...</span>
            </div>
          ) : myTemplates.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 select-none">
              <LayoutTemplate size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Belum ada template diajukan</h3>
              <p className="text-xs mt-1 max-w-xs mx-auto leading-relaxed">
                Ayo buat desain keren Anda di Kanvas Kreatif dan publikasikan agar bisa diakses oleh komunitas KanvasKita!
              </p>
              <button 
                onClick={() => navigate('/kanvas')}
                className="mt-5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Mulai Mendesain
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {myTemplates.map(template => (
                <div 
                  key={template.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xs relative group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 flex items-center justify-center overflow-hidden">
                    <img src={template.thumbnail} alt={template.title} className="max-w-full max-h-full object-contain" />
                    
                    {/* Status Badge Overlaid */}
                    <div className="absolute top-3 right-3 z-10">
                      {template.status === 'approved' ? (
                        <span className="flex items-center gap-1 text-[9px] font-black tracking-wide uppercase px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-xs">
                          <CheckCircle size={10} /> Disetujui
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] font-black tracking-wide uppercase px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-xs">
                          <Clock size={10} /> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex flex-col flex-grow select-none justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{template.title}</h4>
                      <p className="text-[10px] text-slate-450 mt-1">Diajukan: {formatDate(template.createdAt || '')}</p>
                    </div>
                    {template.status === 'approved' && (
                      <button
                        onClick={() => {
                          localStorage.setItem('template_to_load_id', template.id);
                          navigate('/kanvas');
                        }}
                        className="w-full mt-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        Buka di Kanvas
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
