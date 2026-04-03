'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, loading: authLoading, loginWithGoogle, signIn, getDefaultRoute } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user && !authLoading) {
      router.replace(getDefaultRoute(user.role));
    }
  }, [user, authLoading, router, getDefaultRoute]);

  if (authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  const message = searchParams.get('message');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const res = await signIn(formData.email, formData.password);
    if (!res.success) {
      setError(res.error);
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setError('');
    const res = await loginWithGoogle();
    if (!res.success) {
      setError(res.error);
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
      <section className="surface-panel hidden overflow-hidden lg:block">
        <div className="flex h-full flex-col justify-between p-10">
          <div>
            <span className="eyebrow">Member access</span>
            <h1 className="mt-6 max-w-lg text-5xl font-black leading-tight tracking-tight text-foreground">
              Sign in to manage registrations, attendance, and member communication.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-secondary">
              Built for clean daily operations. No clutter, no guesswork, just the tools your club team needs to stay organized.
            </p>
          </div>

          <div className="grid gap-4">
            <InfoCard label="One workspace" detail="Access member features and admin tools from a single signed-in session." />
            <InfoCard label="Reliable routing" detail="Users land in the right dashboard automatically after authentication." />
          </div>
        </div>
      </section>

      <section className="surface-panel p-6 sm:p-8">
        <div className="mb-8">
          <Link href="/" className="text-lg font-black tracking-tight text-foreground">
            ClubPlatform
          </Link>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-foreground">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">Use your account to continue into the platform.</p>
        </div>

        {message && (
          <div className="status-info mb-4">
            Check your email to verify your account, then sign in here.
          </div>
        )}

        {error && (
          <div className="status-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Email Address</label>
            <input
              type="email"
              required
              name="email"
              placeholder="name@college.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-text">Password</label>
            <input
              type="password"
              required
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              className="input-field"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-professional w-full">
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          Or continue with
          <div className="h-px flex-1 bg-border" />
        </div>

        <button onClick={handleGoogleLogin} disabled={submitting} className="btn-outline w-full">
          Google
        </button>

        <p className="mt-6 text-center text-sm text-secondary">
          Do not have an account?{' '}
          <Link href="/signup" className="font-bold text-foreground">
            Create one
          </Link>
        </p>
      </section>
    </div>
  );
}

function InfoCard({ label, detail }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <p className="text-sm font-bold text-foreground">{label}</p>
      <p className="mt-2 text-sm leading-6 text-secondary">{detail}</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
