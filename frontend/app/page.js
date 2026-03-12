'use client';
import Link from 'next/link';
import { HiArrowRight, HiOutlineChartBar, HiOutlineCollection, HiOutlineSpeakerphone } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading, getDefaultRoute } = useAuth();
  const primaryHref = loading ? '#' : (user ? getDefaultRoute(user.role) : '/login');

  return (
    <div className="space-y-10 pb-10">
      <section className="surface-panel overflow-hidden">
        <div className="grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.3fr_0.7fr] lg:px-12 lg:py-14">
          <div className="animate-fade-in-up">
            <span className="eyebrow mb-5">Professional event management</span>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Run club operations from one clean, dependable workspace.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-secondary sm:text-lg">
              Manage event publishing, registrations, attendance, announcements, and reporting with a calmer interface built for day-to-day student operations.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                aria-disabled={loading}
                className={`btn-professional ${loading ? 'pointer-events-none opacity-70' : ''}`}
              >
                Enter Platform
                <HiArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/events" className="btn-outline">
                Browse Events
              </Link>
            </div>
          </div>

          <div className="surface-panel-muted grid gap-4 p-6 animate-fade-in-up">
            <Metric label="Published events" value="12" meta="Live and archived programming" />
            <Metric label="Member participation" value="1.2k" meta="Registrations and attendance logs" />
            <Metric label="Admin workflows" value="5" meta="Events, attendance, analytics, notices" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <FeatureCard
          icon={<HiOutlineCollection className="h-6 w-6" />}
          title="Structured registration"
          description="Support individual and team-based registrations with predictable flows and usable admin controls."
        />
        <FeatureCard
          icon={<HiOutlineChartBar className="h-6 w-6" />}
          title="Operational visibility"
          description="Track event performance, participation, and attendance without hunting through disconnected pages."
        />
        <FeatureCard
          icon={<HiOutlineSpeakerphone className="h-6 w-6" />}
          title="Clear communication"
          description="Publish announcements and keep members aligned with current schedules, deadlines, and updates."
        />
      </section>
    </div>
  );
}

function Metric({ label, value, meta }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-secondary">{meta}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="surface-panel p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-foreground">
        {icon}
      </div>
      <h2 className="mt-5 text-xl font-black tracking-tight text-foreground">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-secondary">{description}</p>
    </div>
  );
}
