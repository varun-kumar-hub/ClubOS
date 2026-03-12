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
          <div className="space-y-5 p-6 sm:p-7">
            <div className="status-success">
              You are already registered for this event. Team registration actions are locked for this account until this registration is removed.
            </div>
            {isTeam && currentRegistration?.team ? (
              <div className="surface-panel-muted p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Your Team</p>
                <p className="mt-3 text-xl font-black text-foreground">{currentRegistration.team.name}</p>
                <p className="mt-2 text-sm text-secondary">Team Code: {currentRegistration.team.code}</p>
                <p className="mt-2 text-sm text-secondary">
                  Status: {currentRegistration.team.leader_id === currentRegistration.id ? 'Leader' : 'Member'}
                </p>
                {teamDetails?.participants?.length ? (
                  <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Team Members</p>
                    {teamDetails.participants.map((member) => (
                      <div key={member.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                        <p className="text-sm font-semibold text-foreground">
                          {member.name}
                          {teamDetails.leader_id === member.id ? ' | Leader' : ''}
                        </p>
                        <p className="mt-1 text-xs text-secondary">{member.email}</p>
                        <p className="mt-1 text-xs text-secondary">
                          {member.department || 'N/A'} {member.year ? `| ${member.year}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="surface-panel-muted p-5">
                <p className="text-sm font-bold text-foreground">Registration Confirmed</p>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  Your registration is already active for this event.
                </p>
              </div>
            )}
          </div>
        ) : registrationSuccess && !isTeam ? (
          <div className="p-6 sm:p-7">
            <div className="status-success">
              Registration completed successfully. Please check your email for confirmation.
            </div>
          </div>
        ) : isTeam ? (
          <>
            <div className="grid grid-cols-2 border-b border-border bg-slate-50 p-1.5">
              <button
                type="button"
                onClick={() => setTeamAction('create')}
                disabled={hasExistingRegistration}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${teamAction === 'create' ? 'bg-white text-foreground shadow-sm' : 'text-secondary'}`}
              >
                Create Team
              </button>
              <button
                type="button"
                onClick={() => setTeamAction('join')}
                disabled={hasExistingRegistration}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${teamAction === 'join' ? 'bg-white text-foreground shadow-sm' : 'text-secondary'}`}
              >
                Join Team
              </button>
            </div>
            {teamAction === 'create' ? (
              <CreateTeamForm
                eventId={event.id}
                onSuccess={async (result) => {
                  const teamRes = await api.get(`/teams/${result.id}`);
                  setCurrentRegistration({
                    id: result.leader?.id,
                    event_id: event.id,
                    team: {
                      id: result.id,
                      name: result.name,
                      code: result.code,
                      leader_id: result.leader?.id,
                    },
                  });
                  setTeamDetails(teamRes.data);
                }}
              />
            ) : (
              <JoinTeamForm
                onSuccess={async (result) => {
                  const teamRes = await api.get(`/teams/${result.team.id}`);
                  setCurrentRegistration({
                    id: result.member?.id,
                    event_id: event.id,
                    team: result.team,
                  });
                  setTeamDetails(teamRes.data);
                }}
              />
            )}
          </>
        ) : (
          <RegisterForm eventId={event.id} onSuccess={() => setRegistrationSuccess(true)} />
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
