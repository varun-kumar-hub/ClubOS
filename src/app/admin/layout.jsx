'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HiOutlineCalendar, HiOutlineChartPie, HiOutlineChartSquareBar, HiOutlineClipboardCheck, HiOutlineSpeakerphone } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }) {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const showWorkspaceShell = pathname !== '/admin/login';

  useEffect(() => {
    if (!loading && !admin && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [admin, loading, router, pathname]);

  if (pathname === '/admin/login') {
    return children;
  }

  if (!loading && !admin) {
    return null;
  }

  return (
    <div className="-mx-4 grid gap-6 sm:-mx-6 lg:-mx-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="surface-panel lg:sticky lg:top-28 lg:h-fit">
        <div className="border-b border-border px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Admin workspace</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-foreground">Operations Console</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">Oversee registrations, attendance, announcements, and reporting.</p>
        </div>

        <nav className="space-y-1 p-4">
          <NavItem href="/admin/dashboard" icon={HiOutlineChartSquareBar} current={pathname}>Overview</NavItem>
          <NavItem href="/admin/events" icon={HiOutlineCalendar} current={pathname} partial>Events & Registration</NavItem>
          <NavItem href="/admin/attendance" icon={HiOutlineClipboardCheck} current={pathname} partial>Attendance</NavItem>
          <NavItem href="/admin/analytics" icon={HiOutlineChartPie} current={pathname} partial>Analytics</NavItem>
          <NavItem href="/admin/announcements" icon={HiOutlineSpeakerphone} current={pathname} partial>Announcements</NavItem>
        </nav>
      </aside>

      <main className="min-w-0">
        {loading && showWorkspaceShell ? (
          <AdminPageSkeleton />
        ) : (
          <div className="animate-fade-in">{children}</div>
        )}
      </main>
    </div>
  );
}

function NavItem({ href, icon: Icon, current, partial, children }) {
  const isActive = partial ? current?.startsWith(href) : current === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
        isActive
          ? 'bg-slate-900 text-white shadow-sm'
          : 'text-secondary hover:bg-slate-50 hover:text-foreground'
      }`}
    >
      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
      {children}
    </Link>
  );
}

function AdminPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-xl bg-slate-100" />
        <div className="h-4 w-96 max-w-full rounded-lg bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="h-32 rounded-3xl border border-border bg-white" />
        <div className="h-32 rounded-3xl border border-border bg-white" />
        <div className="h-32 rounded-3xl border border-border bg-white" />
      </div>
      <div className="h-[420px] rounded-3xl border border-border bg-white" />
    </div>
  );
}
