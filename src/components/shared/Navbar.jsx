'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HiOutlineCog, HiOutlineLogout, HiOutlineMenuAlt3, HiOutlineUserCircle } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, loading, loggingOut, logout, getDefaultRoute } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAdminRoute = pathname?.startsWith('/admin');
  const isAdmin = user?.role === 'admin' || user?.role === 'club_admin';
  const displayName = user?.user_metadata?.full_name || user?.full_name || user?.name || user?.email?.split('@')[0];

  useEffect(() => {
    const routes = user
      ? [getDefaultRoute(user.role), '/settings', '/events', '/announcements']
      : ['/login', '/events', '/announcements', '/signup'];

    routes.forEach((route) => router.prefetch(route));
  }, [router, user, getDefaultRoute]);

  return (
    <nav className="sticky top-0 z-[100] border-b border-border bg-white/92 backdrop-blur">
      <div className="app-shell flex h-20 items-center justify-between gap-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white">
              CP
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-foreground">ClubPlatform</p>
              <p className="text-xs font-medium text-muted-foreground">Event operations workspace</p>
            </div>
          </Link>

          {!isAdminRoute && (
            <div className="hidden items-center gap-2 rounded-2xl border border-border bg-slate-50 p-1.5 md:flex">
              <NavLink href="/events" current={pathname}>Events</NavLink>
              <NavLink href="/announcements" current={pathname}>Announcements</NavLink>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-11 w-32 rounded-2xl bg-slate-100 animate-pulse" />
          ) : user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {isAdmin ? 'System Admin' : 'Member Space'}
                </p>
                <p className="text-sm font-bold text-foreground">{displayName}</p>
              </div>

              <div className="flex items-center gap-1 rounded-2xl border border-border bg-slate-50 p-1.5">
                {isAdmin ? (
                  !isAdminRoute && (
                    <ActionLink href={getDefaultRoute(user.role)} label="Workspace" disabled={loggingOut}>
                      <HiOutlineMenuAlt3 className="h-5 w-5 rotate-90" />
                    </ActionLink>
                  )
                ) : (
                  <ActionLink href="/dashboard" label="Dashboard" disabled={loggingOut}>
                    <HiOutlineUserCircle className="h-5 w-5" />
                  </ActionLink>
                )}

                <ActionLink href="/settings" label="Settings" disabled={loggingOut}>
                  <HiOutlineCog className="h-5 w-5" />
                </ActionLink>

                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to sign out?')) {
                      return;
                    }
                    await logout();
                  }}
                  disabled={loggingOut}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Sign out"
                >
                  <HiOutlineLogout className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <Link href="/login" className="btn-professional">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, current, children }) {
  const isActive = current === href || current?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
        isActive ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </Link>
  );
}

function ActionLink({ href, label, children, disabled = false }) {
  if (disabled) {
    return (
      <span
        title={label}
        className="inline-flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-xl text-slate-400 opacity-60"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      title={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-white hover:text-foreground"
    >
      {children}
    </Link>
  );
}
