'use client';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function StudentDashboard() {
  const { user, admin, loading } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [registrationsError, setRegistrationsError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if (!loading && admin) {
      router.replace('/admin/dashboard');
    }
  }, [user, admin, loading, router]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user || admin) return;

      setRegistrationsLoading(true);
      setRegistrationsError('');

      try {
        const res = await api.get('/participants/me/registrations');
        setRegistrations(res.data || []);
      } catch (err) {
        console.error('Failed to load registrations', err);
        setRegistrationsError(
          err.response?.data?.error || err.message || 'Failed to load your registrations.'
        );
      } finally {
        setRegistrationsLoading(false);
      }
    };

    fetchRegistrations();
  }, [user, admin]);

  const handleDownloadTicket = async () => {
    if (!ticketRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `ticket-${selectedTicket.event?.name?.replace(/\s+/g, '-') || selectedTicket.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to download ticket', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !user || admin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  const displayName =
    user.name || user.full_name || user.user_metadata?.full_name || user.email;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <span className="eyebrow mb-3">My Account</span>
        <h1 className="section-title mt-2">Student Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back, {displayName}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="surface-panel overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-slate-800 to-slate-600" />
            <div className="px-6 pb-6">
              <div className="-mt-8 mb-5 flex items-start">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md border border-border text-2xl font-bold text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground">{displayName}</h3>
              <p className="text-sm text-muted-foreground mb-5">{user.email}</p>

              <div className="space-y-4">
                <div>
                  <p className="label-text">Role</p>
                  <p className="text-sm font-medium text-foreground">{user.role || 'Student'}</p>
                </div>
                {(user.department || user.year) && (
                  <div>
                    <p className="label-text">Academic Details</p>
                    <p className="text-sm font-medium text-foreground">
                      {user.department}
                      {user.year && ` — ${user.year}`}
                    </p>
                  </div>
                )}
                {user.phone && (
                  <div>
                    <p className="label-text">Phone</p>
                    <p className="text-sm font-medium text-foreground">{user.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Registrations */}
        <div className="lg:col-span-2">
          <div className="surface-panel p-6 h-full min-h-[400px]">
            <h2 className="text-xl font-bold text-foreground border-b border-border pb-4 mb-6">
              My Registered Events
            </h2>

            {registrationsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
              </div>
            ) : registrationsError ? (
              <div className="status-error">{registrationsError}</div>
            ) : registrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-48 bg-surface-alt rounded-xl border border-dashed border-border p-8">
                <svg className="w-14 h-14 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-base font-semibold text-foreground mb-1">No registrations yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven&apos;t registered for any upcoming events.
                </p>
                <button
                  onClick={() => router.push('/events')}
                  className="btn-outline text-sm px-4 py-2"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="rounded-xl border border-border bg-surface-alt p-5 hover:border-border-strong transition-colors"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-foreground truncate">
                          {registration.event?.name || 'Event'}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {registration.event?.date
                            ? format(new Date(registration.event.date), 'MMMM d, yyyy')
                            : 'Date unavailable'}
                          {registration.event?.time ? ` · ${registration.event.time}` : ''}
                          {registration.event?.venue ? ` · ${registration.event.venue}` : ''}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="eyebrow">
                            {registration.event?.event_type === 'TEAM'
                              ? 'Team Event'
                              : 'Individual Event'}
                          </span>
                          {registration.event?.status && (
                            <span className={`eyebrow
                              ${registration.event.status === 'REGISTRATION_OPEN'
                                ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                : registration.event.status === 'COMPLETED'
                                ? 'border-gray-200 text-gray-500'
                                : ''}`}>
                              {registration.event.status.replaceAll('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                        <button
                          onClick={() => router.push(`/events/${registration.event_id}`)}
                          className="btn-outline text-xs px-3 py-2"
                        >
                          View Event
                        </button>
                        <button
                          onClick={() => setSelectedTicket(registration)}
                          className="btn-primary text-xs px-3 py-2"
                        >
                          Show Ticket
                        </button>
                      </div>
                    </div>

                    {registration.team && (
                      <div className="mt-4 rounded-lg border border-border bg-white px-4 py-3">
                        <p className="label-text">Team Registration</p>
                        <p className="mt-1.5 text-sm font-bold text-foreground">
                          {registration.team.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                          Code: {registration.team.code}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Ticket Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedTicket(null); }}
        >
          <div className="relative w-full max-w-sm animate-fade-in-up">
            {/* Close button outside the printable card */}
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors z-10"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Printable ticket card */}
            <div
              ref={ticketRef}
              className="rounded-2xl shadow-2xl overflow-hidden bg-white"
              style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
            >
              {/* Ticket header strip */}
              <div 
                className="px-6 py-5"
                style={{ background: '#1e293b', color: '#ffffff' }}
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Event Ticket</p>
                <h3 className="text-lg font-bold leading-tight">
                  {selectedTicket.event?.name || 'Event'}
                </h3>
                {selectedTicket.event?.date && (
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {format(new Date(selectedTicket.event.date), 'MMMM d, yyyy')}
                    {selectedTicket.event?.time ? ` · ${selectedTicket.event.time}` : ''}
                  </p>
                )}
                {selectedTicket.event?.venue && (
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{selectedTicket.event.venue}</p>
                )}
              </div>

              {/* Dashed divider */}
              <div className="flex items-center px-6 pt-4">
                <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: '#e2e8f0' }} />
              </div>

              {/* QR section */}
              <div className="px-6 pt-4 pb-6 text-center">
                <div className="mx-auto inline-block rounded-xl border p-3 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                  <QRCodeSVG
                    value={JSON.stringify({
                      participantId: selectedTicket.id,
                      eventId: selectedTicket.event_id,
                    })}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <p className="mt-4 text-xs font-mono break-all" style={{ color: '#64748b' }}>
                  ID: {selectedTicket.id}
                </p>

                {selectedTicket.team && (
                  <div className="mt-3 rounded-lg border px-3 py-2 text-left" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Team</p>
                    <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{selectedTicket.team.name}</p>
                    <p className="text-xs font-mono" style={{ color: '#64748b' }}>Code: {selectedTicket.team.code}</p>
                  </div>
                )}

                <p className="mt-4 text-[10px]" style={{ color: '#94a3b8' }}>Present this QR code at the event entrance</p>
              </div>
            </div>

            {/* Download button — below the card, not part of the screenshot */}
            <button
              onClick={handleDownloadTicket}
              disabled={downloading}
              className="mt-3 w-full btn-primary justify-center gap-2"
            >
              {downloading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Downloading…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Ticket
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
