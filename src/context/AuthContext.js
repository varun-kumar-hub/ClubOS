'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

// Admins are determined by the NEXT_PUBLIC_ADMIN_EMAILS env variable
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'cvarunkumar455@gmail.com,cvkvarun7@gmail.com')
  .split(',')
  .map(email => email.trim().toLowerCase());

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const userBuildPromisesRef = useRef(new Map());

  const determineRole = (email) => {
    return ADMIN_EMAILS.includes(email?.toLowerCase()) ? 'admin' : 'student';
  };

  const isAdminUser = (role) => role === 'admin' || role === 'club_admin';
  const getDefaultRoute = (role) => (isAdminUser(role) ? '/admin/dashboard' : '/dashboard');
  const getRouteForAuthUser = (authUser) => getDefaultRoute(authUser?.role || determineRole(authUser?.email));
  const withTimeout = async (promise, timeoutMs, message) => (
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs)),
    ])
  );

  const fetchUserProfile = async (userId, email) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const isIgnorableLockError =
        error?.name === 'AbortError' ||
        error?.message?.includes("Lock broken by another request with the 'steal' option.");

      if (error && error.code !== 'PGRST116' && !isIgnorableLockError) {
        console.error('Failed to fetch profile:', error.message);
      }

      const role = profile?.role || determineRole(email);
      return { ...profile, role };
    } catch (error) {
      const isIgnorableLockError =
        error?.name === 'AbortError' ||
        error?.message?.includes("Lock broken by another request with the 'steal' option.");

      if (!isIgnorableLockError) {
        console.error('Failed to fetch profile:', error.message);
      }

      return { role: determineRole(email) };
    }
  };

  const buildUserData = async (session) => {
    if (!session?.user) return null;

    const existingPromise = userBuildPromisesRef.current.get(session.user.id);
    if (existingPromise) {
      return existingPromise;
    }

    const buildPromise = (async () => {
      const profile = await fetchUserProfile(session.user.id, session.user.email);
      return { ...session.user, ...profile };
    })();

    userBuildPromisesRef.current.set(session.user.id, buildPromise);

    try {
      return await buildPromise;
    } finally {
      userBuildPromisesRef.current.delete(session.user.id);
    }
  };

  const mergeUserProfile = (currentUser, profileUpdates) => {
    if (!currentUser) return currentUser;

    return {
      ...currentUser,
      ...profileUpdates,
      user_metadata: {
        ...currentUser.user_metadata,
        ...(profileUpdates.full_name ? { full_name: profileUpdates.full_name } : {}),
      },
    };
  };

  const clearStoredSession = () => {
    if (typeof window === 'undefined') return;

    const clearStore = (store) => {
      try {
        const keysToRemove = [];
        for (let i = 0; i < store.length; i += 1) {
          const key = store.key(i);
          if (key?.startsWith('sb-') || key?.includes('supabase') || key?.includes('auth-token')) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach((key) => store.removeItem(key));
      } catch (error) {
        console.error('Failed to clear auth storage:', error);
      }
    };

    clearStore(window.localStorage);
    clearStore(window.sessionStorage);

    document.cookie = 'admin_token=; Max-Age=0; path=/';
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Failed to read session:', error.message);
        }

        if (session) {
          const userData = await buildUserData(session);
          setUser(userData);

          // Redirect if on login or signup page
          if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/signup')) {
            router.replace(getDefaultRoute(userData.role));
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session bootstrap failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session) {
            const userData = await buildUserData(session);
            setUser(userData);

            if (event === 'SIGNED_IN') {
              router.replace(getDefaultRoute(userData.role));
            } else if (event === 'USER_UPDATED') {
              setUser(userData);
            }
          } else {
            setUser(null);

            if (event === 'SIGNED_OUT') {
              router.replace('/');
            }
          }
        } catch (error) {
          console.error('Auth state change failed:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const signUp = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      setLoggingOut(true);
      await withTimeout(
        supabase.auth.signOut({ scope: 'local' }),
        4000,
        'Sign out timed out.'
      );
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearStoredSession();
      setUser(null);
      setLoggingOut(false);
      router.replace('/');
      router.refresh();

      if (typeof window !== 'undefined') {
        window.location.assign('/');
      }
    }

    return { success: true };
  };

  const updateProfile = async (profileUpdates) => {
    if (!user) {
      return { success: false, error: 'No active user session.' };
    }

    try {
      const normalizedName = profileUpdates.full_name?.trim();
      const payload = {
        id: user.id,
        full_name: normalizedName || user.user_metadata?.full_name || user.name || '',
        department: profileUpdates.department?.trim() || null,
        year: profileUpdates.year?.trim() || null,
        phone: profileUpdates.phone?.trim() || null,
        role: user.role,
      };

      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single(),
        7000,
        'Profile update timed out. Please try again.'
      );

      if (error) throw error;

      if (normalizedName && normalizedName !== user.user_metadata?.full_name) {
        const { error: authError } = await withTimeout(
          supabase.auth.updateUser({
            data: { full_name: normalizedName },
          }),
          7000,
          'Profile sync timed out. Please try again.'
        );

        if (authError) throw authError;
      }

      setUser((currentUser) => mergeUserProfile(currentUser, data));
      return { success: true, data };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: error.message || 'Failed to update profile.' };
    }
  };

  const sendPasswordReset = async () => {
    if (!user?.email) {
      return { success: false, error: 'No active user email found.' };
    }

    try {
      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(user.email, {
          redirectTo: `${window.location.origin}/login`,
        }),
        7000,
        'Password reset request timed out. Please try again.'
      );

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Password reset failed:', error);
      return { success: false, error: error.message || 'Failed to send password reset email.' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      admin: isAdminUser(user?.role),
      isAuthenticated: Boolean(user),
      getDefaultRoute,
      getRouteForAuthUser,
      loading, 
      loggingOut,
      signUp,
      signIn,
      loginWithGoogle, 
      logout,
      updateProfile,
      sendPasswordReset,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
