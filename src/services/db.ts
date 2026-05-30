import { supabase } from './supabaseClient';

export interface CustomTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  creator: string;
  creator_id?: string;
  status: 'pending' | 'approved';
  data: any;
  createdAt?: string;
}

export interface CustomAsset {
  id?: string;
  name: string;
  url: string;
  category: string;
}

export interface UserAccount {
  id?: string;
  name: string;
  email: string;
  provider: 'email' | 'google' | 'github';
  avatarUrl?: string;
  createdAt: string;
  role?: 'user' | 'admin';
}

// 1. Templates Management
export const getPublishedTemplates = async (): Promise<CustomTemplate[]> => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get templates:', error);
    return [];
  }

  return (data || []).map(t => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    category: t.category,
    thumbnail: t.thumbnail_url,
    creator: t.creator_name,
    creator_id: t.creator_id,
    status: t.status as 'pending' | 'approved',
    data: t.data,
    createdAt: t.created_at
  }));
};

export const publishTemplate = async (template: Omit<CustomTemplate, 'status'>): Promise<void> => {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from('templates')
    .insert({
      title: template.title,
      description: template.description,
      category: template.category,
      thumbnail_url: template.thumbnail,
      creator_id: user?.id || null,
      creator_name: template.creator,
      data: template.data,
      status: 'pending'
    });

  if (error) {
    console.error('Failed to publish template:', error);
    throw new Error(error.message);
  }
};

export const approvePublishedTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('templates')
    .update({ status: 'approved' })
    .eq('id', id);

  if (error) {
    console.error('Failed to approve template:', error);
    throw new Error(error.message);
  }
};

export const deletePublishedTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete template:', error);
    throw new Error(error.message);
  }
};

// 2. Custom Assets (Stickers) Management
export const getCustomAssets = async (): Promise<CustomAsset[]> => {
  const { data, error } = await supabase
    .from('custom_assets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get custom assets:', error);
    return [];
  }

  return (data || []).map(a => ({
    id: a.id,
    name: a.name,
    url: a.url,
    category: a.category
  }));
};

export const addCustomAsset = async (asset: Omit<CustomAsset, 'id'>): Promise<void> => {
  const session = await supabase.auth.getSession();
  const creatorId = session.data.session?.user?.id || null;
  const { error } = await supabase
    .from('custom_assets')
    .insert({
      name: asset.name,
      url: asset.url,
      category: asset.category,
      creator_id: creatorId
    });

  if (error) {
    console.error('Failed to add custom asset:', error);
    throw new Error(error.message);
  }
};

export const deleteCustomAsset = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('custom_assets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete custom asset:', error);
    throw new Error(error.message);
  }
};

// 3. Analytics & Usage Stats Management
export const getToolsUsageStats = async (): Promise<{ [key: string]: number }> => {
  const { data, error } = await supabase
    .from('tools_usage_stats')
    .select('tool_name, count');

  if (error) {
    console.error('Failed to get tools usage stats:', error);
    return {};
  }

  const stats: { [key: string]: number } = {};
  (data || []).forEach(row => {
    stats[row.tool_name] = row.count;
  });
  return stats;
};

export const incrementToolUsage = async (toolName: string): Promise<void> => {
  try {
    const { data, error: selectError } = await supabase
      .from('tools_usage_stats')
      .select('count')
      .eq('tool_name', toolName)
      .maybeSingle();

    if (selectError) throw selectError;

    const newCount = (data?.count || 0) + 1;
    const { error: upsertError } = await supabase
      .from('tools_usage_stats')
      .upsert(
        { tool_name: toolName, count: newCount, updated_at: new Date().toISOString() },
        { onConflict: 'tool_name' }
      );

    if (upsertError) throw upsertError;
  } catch (e) {
    console.error('Failed to update tool usage stats:', e);
  }
};

// 4. Real Authentication with Supabase Auth
export const registerUser = async (name: string, email: string, password?: string): Promise<UserAccount | string> => {
  if (!password) return 'Kata sandi diperlukan!';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name
      }
    }
  });

  if (error) {
    return error.message;
  }

  if (!data.user) return 'Registrasi gagal!';

  return {
    id: data.user.id,
    name,
    email,
    provider: 'email',
    createdAt: data.user.created_at
  };
};

export const loginUser = async (email: string, password?: string): Promise<UserAccount | string> => {
  if (!password) return 'Kata sandi diperlukan!';
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return error.message === 'Invalid login credentials' ? 'Email atau kata sandi salah!' : error.message;
  }

  if (!data.user) return 'Login gagal!';

  // Fetch the created profile from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  return {
    id: data.user.id,
    name: profile?.name || data.user.user_metadata?.name || 'User',
    email: data.user.email || email,
    provider: 'email',
    avatarUrl: profile?.avatar_url,
    createdAt: data.user.created_at,
    role: profile?.role as 'user' | 'admin'
  };
};

export const loginWithOAuth = async (provider: 'google' | 'github'): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth`
    }
  });

  if (error) {
    console.error('OAuth login error:', error.message);
    throw new Error(error.message);
  }
};

export const getCurrentUser = async (): Promise<UserAccount | null> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  // Retrieve matching profile from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const identities = user.identities || [];
  const identityProvider = identities[0]?.provider === 'google' || identities[0]?.provider === 'github'
    ? identities[0].provider
    : 'email';

  return {
    id: user.id,
    name: profile?.name || user.user_metadata?.name || user.user_metadata?.full_name || 'User',
    email: user.email || '',
    provider: identityProvider as 'email' | 'google' | 'github',
    avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url,
    createdAt: user.created_at,
    role: (profile?.role || 'user') as 'user' | 'admin'
  };
};

export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error);
  }
};

export const getProfilesCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Failed to get profiles count:', error);
    return 0;
  }
  return count || 0;
};

