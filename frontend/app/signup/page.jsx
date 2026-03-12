'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { signUp, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const res = await signUp(formData.email, formData.password, formData.name);
    if (res.success) {
      router.push('/login?message=check_email');
      return;
    }

    setError(res.error);
    setSubmitting(false);
  };

  const handleGoogleSignup = async () => {
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
            <span className="eyebrow">Create access</span>
            <h1 className="mt-6 max-w-lg text-5xl font-black leading-tight tracking-tight text-foreground">
              Set up a clean, professional event account in a few steps.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-secondary">
              Register once, then move through events, settings, and dashboards without repeated sign-ins or broken flows.
            </p>
          </div>

          <div className="grid gap-4">
            <InfoCard label="Fast onboarding" detail="Create your account and move directly into events and member features." />
            <InfoCard label="Admin-ready" detail="Approved admin emails are routed straight to the admin workspace after sign-in." />
          </div>
        </div>
      </section>

      <section className="surface-panel p-6 sm:p-8">
        <div className="mb-8">
          <Link href="/" className="text-lg font-black tracking-tight text-foreground">
            ClubPlatform
          </Link>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-foreground">Create account</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">Use your college or club email to get started.</p>
        </div>

        {error && (
          <div className="status-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            <input
              type="text"
              required
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              className="input-field"
            />
          </div>

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
              placeholder="Create a secure password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              className="input-field"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-professional w-full">
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          Or continue with
          <div className="h-px flex-1 bg-border" />
        </div>

        <button onClick={handleGoogleSignup} disabled={submitting} className="btn-outline w-full">
          Google
        </button>

        <p className="mt-6 text-center text-sm text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-foreground">
            Sign in
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
