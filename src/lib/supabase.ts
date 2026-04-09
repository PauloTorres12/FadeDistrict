// Supabase client configuration
// Replace these with your actual Supabase credentials when ready
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export { SUPABASE_URL, SUPABASE_ANON_KEY };

// Mock Supabase client for development
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Simulate auth
      if (email === 'admin@fadedistrict.com' && password === 'admin123') {
        return { data: { user: { id: '1', email } }, error: null };
      }
      return { data: null, error: { message: 'Invalid credentials' } };
    },
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
  },
  from: (table: string) => ({
    select: async () => ({ data: [], error: null }),
    insert: async (data: Record<string, unknown>) => ({ data, error: null }),
    update: async (data: Record<string, unknown>) => ({ data, error: null }),
    delete: async () => ({ data: null, error: null }),
  }),
};
