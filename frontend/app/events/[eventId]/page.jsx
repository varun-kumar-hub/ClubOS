'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import api from '@/services/api';
import Link from 'next/link';
import CreateTeamForm from '@/components/team/CreateTeamForm';
import JoinTeamForm from '@/components/team/JoinTeamForm';
import RegisterForm from '@/components/participant/RegisterForm';
import { useAuth } from '@/context/AuthContext';
import { HiOutlinePencilAlt, HiOutlineUsers } from 'react-icons/hi';

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teamAction, setTeamAction] = useState('create');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const requests = [api.get(`/events/${eventId}`)];
        if (user && !isAdminRole(user.role)) {
          requests.push(api.get('/participants/me/registrations'));
        }

        const [eventRes, registrationsRes] = await Promise.all(requests);
        setEvent(eventRes.data);

        if (registrationsRes) {
          const registration = (registrationsRes.data || []).find((item) => item.event_id === eventId) || null;
          setCurrentRegistration(registration);
          if (registration?.team?.id) {
            const teamRes = await api.get(`/teams/${registration.team.id}`);
            setTeamDetails(teamRes.data);
          } else {
            setTeamDetails(null);
          }
        } else {
          setCurrentRegistration(null);
          setTeamDetails(null);
        }

        setError('');
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load event details.');
      } finally {
        setLoading(false);
        setRegistrationLoading(false);
      }
    };

    if (eventId) {
      setRegistrationLoading(true);
      fetchPageData();
    }
  }, [eventId, user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-md">
        <div className="surface-panel p-8 text-center">
          <p className="text-xl font-black tracking-tight text-foreground">Event unavailable</p>
          <p className="mt-3 text-sm leading-6 text-secondary">{error || 'Event not found.'}</p>
        </div>
      </div>
    );
  }

  const isTeam = event.event_type === 'TEAM';
  const isAdmin = user?.role === 'admin' || user?.role === 'club_admin';
  const now = new Date();
  const deadline = new Date(event.registration_deadline);
  const isClosed = now > deadline || event.status === 'REGISTRATION_CLOSED' || event.status === 'COMPLETED';
  const hasExistingRegistration = Boolean(currentRegistration);

  const handleDownloadTicket = async () => {
    if (!currentRegistration) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('ticket-card');
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `ticket-${event.name.replace(/\\s+/g, '-').toLowerCase()}-${currentRegistration.id.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download ticket:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_420px]">
      <section className="surface-panel overflow-hidden">
        {event.poster && (
          <img src={event.poster} alt={event.name} className="h-72 w-full object-cover sm:h-96" />
        )}

        <div className="space-y-8 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow">{isTeam ? 'Team Event' : 'Individual Event'}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${isClosed ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
              {isClosed ? 'Registration Closed' : 'Registration Open'}
            </span>
          </div>

          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">{event.name}</h1>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-secondary">{event.description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <DetailCard label="Date" value={format(new Date(event.date), 'MMMM d, yyyy')} />
            <DetailCard label="Time" value={event.time} />
            <DetailCard label="Venue" value={event.venue} />
          </div>

          <div className="surface-panel-muted p-5">
            <p className="text-sm font-bold text-foreground">Registration Window</p>
            <p className="mt-2 text-sm leading-6 text-secondary">
              Deadline: <span className="font-semibold text-foreground">{format(deadline, 'MMM d, yyyy h:mm a')}</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-secondary">
              Capacity: {isTeam
                ? `${event.max_teams || 'Unlimited'} teams${event.team_size ? `, up to ${event.team_size} members each` : ''}`
                : `${event.max_participants || 'Unlimited'} participants`}
            </p>
          </div>
        </div>
      </section>

      <aside className="surface-panel h-fit overflow-hidden lg:sticky lg:top-28">
        {isAdmin ? (
          <div className="space-y-5 p-6 sm:p-7">
            <div className="status-info">
              Admin session detected. Use management actions instead of participant registration.
            </div>
            <div className="space-y-3">
              <Link href="/admin/events" className="btn-professional w-full justify-center">
                <HiOutlinePencilAlt className="h-5 w-5" />
                Open Event Manager
              </Link>
              <Link href={`/admin/events/${event.id}/participants`} className="btn-outline w-full justify-center">
                <HiOutlineUsers className="h-5 w-5" />
                View Registrations
              </Link>
            </div>
          </div>
        ) : isClosed ? (
          <div className="p-6 sm:p-7">
            <div className="status-info">
              Registration is closed for this event.
            </div>
          </div>
        ) : registrationLoading ? (
          <div className="flex justify-center p-10">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          </div>
        ) : hasExistingRegistration ? (
          <div className="flex flex-col h-full">
            <div className="border-b border-border bg-slate-50 p-5 hidden lg:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground text-center">Your Event Ticket</p>
            </div>
            
            <div className="flex-1 p-6 sm:p-8 flex flex-col items-center justify-center bg-slate-100">
              <div 
                id="ticket-card" 
                className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
                style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
              >
                <div className="px-6 py-6 text-center" style={{ background: '#1e293b', color: '#ffffff' }}>
                  <span 
                    className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    {isTeam ? 'Team Pass' : 'Entry Pass'}
                  </span>
                  <h3 className="mt-4 truncate text-xl font-black">{event.name}</h3>
                  <p className="mt-1 text-sm font-medium" style={{ color: '#cbd5e1' }}>
                    {format(new Date(event.date), 'MMM d, yyyy')} • {event.time}
                  </p>
                </div>

                <div className="flex flex-col items-center px-6 py-8">
                  <div className="rounded-xl border p-3 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({ participantId: currentRegistration.id, eventId: event.id }))}`}
                      alt="Student Ticket QR"
                      className="h-40 w-40 object-contain mix-blend-multiply"
                    />
                  </div>
                  <p className="mt-5 font-mono text-xs tracking-[0.2em]" style={{ color: '#64748b' }}>
                    {currentRegistration.id.slice(0, 16).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-white p-5 space-y-3">
              <button onClick={handleDownloadTicket} disabled={isDownloading} className="btn-professional w-full justify-center">
                {isDownloading ? 'Downloading...' : 'Download Ticket Image'}
              </button>
              {isTeam && currentRegistration?.team && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground text-center mb-2">Team Details</p>
                  <p className="text-center font-bold text-foreground">{currentRegistration.team.name}</p>
                  <p className="text-center text-sm text-secondary">Code: {currentRegistration.team.code}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <RegisterForm eventId={event.id} onSuccess={(participant) => {
            setCurrentRegistration(participant);
            setRegistrationSuccess(true);
          }} />
        )}
      </aside>
    </div>
  );
}

function isAdminRole(role) {
  return role === 'admin' || role === 'club_admin';
}

function DetailCard({ label, value }) {
  return (
    <div className="surface-panel-muted p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
