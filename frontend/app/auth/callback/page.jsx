'use client';
import { useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { getRouteForAuthUser } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!error && session?.user) {
        router.replace(getRouteForAuthUser(session.user));
      } else {
        console.error('Auth callback error:', error?.message || 'No active session found');
        router.replace('/login?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [router, getRouteForAuthUser]);

  return (
    <div className="min-h-[60vh] flex flex-col justify-center items-center animate-fade-in-up">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-slate-400 font-black uppercase tracking-widest text-[10px]">Authenticating Session...</p>
    </div>
  );
}
