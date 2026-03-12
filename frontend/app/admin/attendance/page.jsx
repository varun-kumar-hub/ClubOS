'use client';
import { useEffect, useState } from 'react';
import { HiOutlineRefresh } from 'react-icons/hi';
import api from '@/services/api';

export default function AdminAttendance() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [stats, setStats] = useState(createDefaultStats());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendanceForEvent(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/events');
      const loadedEvents = res.data.events || [];
      setEvents(loadedEvents);

      if (loadedEvents.length > 0) {
        setSelectedEventId((current) => current || loadedEvents[0].id);
      } else {
        setSelectedEventId('');
        setSelectedEvent(null);
        setParticipants([]);
        setAttendanceRecords({});
        setStats(createDefaultStats());
      }
    } catch (err) {
      console.error('Failed to load events', err);
      setError(err.response?.data?.error || err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForEvent = async (eventId) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const eventRes = await api.get(`/events/${eventId}`);
      const event = eventRes.data;
      setSelectedEvent(event);

      let participantRows = [];
      if (event.event_type === 'TEAM') {
        const teamsRes = await api.get(`/teams/event/${eventId}`);
        participantRows = (teamsRes.data || []).flatMap((team) =>
          (team.participants || []).map((participant) => ({
            ...participant,
            teamName: team.name,
            teamCode: team.code,
            isLeader: team.leader_id === participant.id,
          }))
        );
      } else {
        const partRes = await api.get(`/participants/event/${eventId}?limit=1000`);
        participantRows = partRes.data.participants || [];
      }

      const attendanceRes = await api.get(`/attendance/event/${eventId}`);
      const recordsMap = {};
      (attendanceRes.data.records || []).forEach((record) => {
        recordsMap[record.participant_id] = record.status;
      });

      setParticipants(participantRows);
      setAttendanceRecords(recordsMap);
      setStats(attendanceRes.data.stats || createDefaultStats());
    } catch (err) {
      console.error('Failed to load attendance', err);
      setParticipants([]);
      setAttendanceRecords({});
      setStats(createDefaultStats());
      setError(err.response?.data?.error || err.message || 'Failed to load attendance.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = (participantId, currentStatus) => {
    const nextStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    setAttendanceRecords((current) => ({
      ...current,
      [participantId]: nextStatus,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedEventId) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const attendanceList = Object.entries(attendanceRecords).map(([participantId, status]) => ({
        participantId,
        status,
      }));

      await api.post('/attendance/bulk-mark', {
        eventId: selectedEventId,
        attendanceList,
      });

      const attendanceRes = await api.get(`/attendance/event/${selectedEventId}`);
      const recordsMap = {};
      (attendanceRes.data.records || []).forEach((record) => {
        recordsMap[record.participant_id] = record.status;
      });

      setAttendanceRecords(recordsMap);
      setStats(attendanceRes.data.stats || createDefaultStats());
      setMessage('Attendance saved successfully.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const isTeamEvent = selectedEvent?.event_type === 'TEAM';

  if (loading && events.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="max-w-md w-full rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-red-500">Attendance Error</p>
          <p className="text-sm font-medium text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="mt-2 text-sm text-gray-500">
            Select an event from the dropdown to review registrations and mark attendance for that event.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>

          <button onClick={() => selectedEventId && fetchAttendanceForEvent(selectedEventId)} className="btn-outline" disabled={!selectedEventId || loading || saving}>
            <HiOutlineRefresh className="h-5 w-5" />
            Refresh
          </button>

          <button onClick={handleSaveAttendance} className="btn-professional" disabled={!selectedEventId || saving || loading || participants.length === 0}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {selectedEvent && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.name}</h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                {isTeamEvent ? 'Team Event' : 'Individual Event'}
              </span>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {selectedEvent.status?.replaceAll('_', ' ')}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              {isTeamEvent
                ? 'Team events show every member under their team details. Attendance is still marked per registered member.'
                : 'Individual events show each participant directly in the attendance list.'}
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="mx-6 mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-3">
            <SummaryCard label={isTeamEvent ? 'Members Registered' : 'Total Registered'} value={stats.totalRegistered} />
            <SummaryCard label="Total Present" value={stats.totalPresent} />
            <SummaryCard label="Attendance Rate" value={`${stats.attendanceRate}%`} />
          </div>

          {loading ? (
            <div className="flex justify-center px-6 pb-8 pt-2">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
            </div>
          ) : (
            <div className="overflow-x-auto border-t border-gray-100">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Participant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {isTeamEvent ? 'Team Details' : 'Contact'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Department</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-sm">
                            {isTeamEvent
                              ? 'No teams or members are registered for this event.'
                              : 'No participants registered for this event.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    participants.map((participant) => {
                      const status = attendanceRecords[participant.id] || 'ABSENT';
                      const isPresent = status === 'PRESENT';

                      return (
                        <tr key={`${selectedEventId}-${participant.id}`} className="transition-colors hover:bg-gray-50/80">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">{participant.name}</div>
                            {participant.year && <div className="mt-1 text-xs text-gray-500">{participant.year}</div>}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {isTeamEvent ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">{participant.teamName}</div>
                                <div className="mt-1 text-xs text-gray-500">{participant.email}</div>
                                <div className="mt-1 text-xs text-gray-500">
                                  Code: {participant.teamCode}
                                  {participant.isLeader ? ' | Leader' : ''}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="text-sm text-gray-700">{participant.email}</div>
                                {participant.phone && <div className="mt-1 text-xs text-gray-500">{participant.phone}</div>}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                              {participant.department || 'N/A'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <button
                              onClick={() => handleToggleAttendance(participant.id, status)}
                              className={`rounded-lg border px-4 py-1.5 text-xs font-bold tracking-wide shadow-sm transition-all duration-200 ${
                                isPresent
                                  ? 'border-gray-300 bg-gray-50 text-gray-900 hover:bg-gray-200'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {isPresent ? 'Present' : 'Absent'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-center">
      <p className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-4xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}

function createDefaultStats() {
  return {
    totalRegistered: 0,
    totalPresent: 0,
    attendanceRate: 0,
  };
}
