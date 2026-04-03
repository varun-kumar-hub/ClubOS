'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import api from '@/services/api';

export default function EventParticipantsAndTeams() {
  const { eventId } = useParams();
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [event, setEvent] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, eventRes] = await Promise.all([
          api.get('/events'),
          api.get(`/events/${eventId}`),
        ]);

        setEvents(eventsRes.data.events || []);
        const currentEvent = eventRes.data;
        setEvent(currentEvent);

        if (currentEvent.event_type === 'TEAM') {
          const teamsRes = await api.get(`/teams/event/${eventId}`);
          setData(teamsRes.data || []);
        } else {
          const partRes = await api.get(`/participants/event/${eventId}?limit=1000`);
          setData(partRes.data.participants || []);
        }
      } catch (err) {
        console.error('Failed to load event data', err);
        setError(err.response?.data?.error || err.message || 'Failed to load event data.');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const handleDeleteParticipant = async (id, name) => {
    if (!window.confirm(`Remove ${name}?`)) {
      return;
    }

    try {
      await api.delete(`/participants/${id}`);

      setData((current) =>
        event?.event_type === 'TEAM'
          ? current.map((team) => ({
              ...team,
              participants: (team.participants || []).filter((participant) => participant.id !== id),
            }))
          : current.filter((participant) => participant.id !== id)
      );
      setMessage(`${name} removed successfully.`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete participant.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
      </div>
    );
  }

  if (error && !event) {
    return <div className="py-20 text-center text-red-600">{error}</div>;
  }

  if (!event) {
    return <div className="py-20 text-center text-red-600">Event not found</div>;
  }

  const isTeam = event.event_type === 'TEAM';
  const totalMembers = isTeam
    ? data.reduce((count, team) => count + (team.participants?.length || 0), 0)
    : data.length;

  return (
    <div className="space-y-6">
      {message && <div className="status-success">{message}</div>}
      {error && <div className="status-error">{error}</div>}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button onClick={() => router.back()} className="mb-2 flex items-center text-sm text-gray-500 hover:text-gray-900">
            &larr; Back to Events
          </button>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
            <button
               onClick={() => router.push(`/admin/events/${eventId}/scan`)}
               className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 shadow-sm flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Scan QR Attendance
            </button>
          </div>
          <p className="mt-2 text-gray-600">
            {isTeam ? 'Registered teams and members' : 'Registered participants'}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:items-end">
          <select
            value={event.id}
            onChange={(e) => router.replace(`/admin/events/${e.target.value}/participants`)}
            className="min-w-[240px] rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900"
          >
            {events.map((eventOption) => (
              <option key={eventOption.id} value={eventOption.id}>
                {eventOption.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SummaryTile label={isTeam ? 'Total Teams' : 'Total Participants'} value={data.length} />
            <SummaryTile label="Total Members" value={totalMembers} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isTeam ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Team Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Members Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Registered On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Members Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{team.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-500">{team.code}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{team.participants?.length || 0}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {format(new Date(team.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-3">
                        {(team.participants || []).map((participant) => (
                          <div key={participant.id} className="flex items-start justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
                            <div>
                              <p className="font-medium text-gray-900">
                                {participant.name}
                                {team.leader_id === participant.id ? ' | Leader' : ''}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">{participant.email}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                {participant.department} {participant.year ? `| ${participant.year}` : ''}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteParticipant(participant.id, participant.name)}
                              className="text-xs font-semibold text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        {(team.participants || []).length === 0 && (
                          <p className="text-xs text-gray-500">No members in this team yet.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No teams registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Department / Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Registered</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{participant.email}</div>
                      <div className="text-xs text-gray-500">{participant.phone}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{participant.department}</div>
                      <div className="text-xs text-gray-500">{participant.year}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {format(new Date(participant.created_at), 'MMM d')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteParticipant(participant.id, participant.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No participants registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-right">
      <span className="mb-1 block text-sm font-medium text-gray-500">{label}</span>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
    </div>
  );
}
