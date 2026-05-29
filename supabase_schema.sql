-- =====================================================================
-- SKEMA SQL DATABASE KANVASKITA
-- Salin dan jalankan seluruh kode ini di SQL Editor di Dasbor Supabase Anda.
-- =====================================================================

-- 1. TABEL PROFIL PENGGUNA
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Aktifkan RLS (Row Level Security) pada tabel profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS Profiles
CREATE POLICY "Semua orang dapat melihat profil" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Pengguna dapat memperbarui profil sendiri" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);


-- 2. AUTOMATIC TRIGGER PROFIL SAAT DAFTAR/SIGNUP
-- Fungsi ini otomatis menyalin user baru dari auth.users ke public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Pengguna KanvasKita'),
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      'https://api.dicebear.com/7.x/initials/svg?seed=' || COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    ),
    'user' -- Default role sebagai user biasa
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger setelah insert baru pada auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. TABEL TEMPLATE DESAIN
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved')) NOT NULL,
  data JSONB NOT NULL, -- Menyimpan object state canvas editor secara penuh
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS Templates
CREATE POLICY "Semua orang dapat melihat template yang disetujui" 
  ON public.templates FOR SELECT 
  USING (status = 'approved' OR auth.uid() = creator_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Pengguna terotentikasi dapat membuat template baru" 
  ON public.templates FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Pembuat atau Admin dapat memperbarui template sendiri" 
  ON public.templates FOR UPDATE 
  USING (auth.uid() = creator_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Pembuat atau Admin dapat menghapus template sendiri" 
  ON public.templates FOR DELETE 
  USING (auth.uid() = creator_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));


-- 4. TABEL ASET/STIKER KUSTOM
CREATE TABLE IF NOT EXISTS public.custom_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL, -- base64 atau path Supabase Storage
  category TEXT NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.custom_assets ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS Custom Assets
CREATE POLICY "Semua orang dapat membaca stiker/aset" 
  ON public.custom_assets FOR SELECT 
  USING (true);

CREATE POLICY "Pengguna terotentikasi dapat menambah stiker kustom" 
  ON public.custom_assets FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Pemilik stiker atau Admin dapat menghapus stiker sendiri" 
  ON public.custom_assets FOR DELETE 
  USING (auth.uid() = creator_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));


-- 5. TABEL STATISTIK PENGGUNAAN ALAT
CREATE TABLE IF NOT EXISTS public.tools_usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name TEXT NOT NULL UNIQUE,
  count INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tools_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Semua orang dapat membaca statistik penggunaan" 
  ON public.tools_usage_stats FOR SELECT 
  USING (true);

-- Untuk memudahkan pelacakan statistik dari sisi klien secara offline/publik
CREATE POLICY "Siapapun dapat menambah statistik/counter" 
  ON public.tools_usage_stats FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Siapapun dapat memperbarui counter statistik" 
  ON public.tools_usage_stats FOR UPDATE 
  USING (true);
