'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminEventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Extend registration modal state
  const [extendTarget, setExtendTarget] = useState(null); // event object
  const [extendDeadline, setExtendDeadline] = useState('');
  const [reopenReg, setReopenReg] = useState(false);
  const [extendLoading, setExtendLoading] = useState(false);
  const [extendError, setExtendError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.events);
      setError('');
    } catch (err) {
      console.error('Failed to load events', err);
      setError(err.response?.data?.error || err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      try {
        await api.delete(`/events/${id}`);
        setEvents(events.filter(e => e.id !== id));
        setActionMessage('Event deleted successfully.');
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to delete event.');
      }
    }
  };

  const openExtendModal = (event) => {
    // Format the existing deadline for datetime-local input
    const existing = event.registration_deadline
      ? new Date(event.registration_deadline).toISOString().slice(0, 16)
      : '';
    setExtendTarget(event);
    setExtendDeadline(existing);
    setReopenReg(event.status !== 'REGISTRATION_OPEN');
    setExtendError('');
  };

  const closeExtendModal = () => {
    setExtendTarget(null);
    setExtendDeadline('');
    setReopenReg(false);
    setExtendError('');
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!extendDeadline) {
      setExtendError('Please select a new registration deadline.');
      return;
    }
    setExtendLoading(true);
    setExtendError('');
    try {
      const payload = { registrationDeadline: extendDeadline };
      if (reopenReg) payload.status = 'REGISTRATION_OPEN';

      const res = await api.put(`/events/${extendTarget.id}`, payload);
      // Update local state
      setEvents((prev) =>
        prev.map((ev) => (ev.id === extendTarget.id ? { ...ev, ...res.data } : ev))
      );
      setActionMessage(`Registration extended for "${extendTarget.name}".`);
      closeExtendModal();
    } catch (err) {
      setExtendError(err.response?.data?.error || err.message || 'Failed to extend registration.');
    } finally {
      setExtendLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900" />
      </div>
    );

  if (error) {
    return (
      <div className="flex justify-center py-20">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500 mb-3">Events Error</p>
          <p className="text-sm font-medium text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {actionMessage && (
        <div className="status-success mb-4 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-emerald-600 hover:text-emerald-800 font-bold text-lg leading-none">&times;</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
        <Link
          href="/admin/create-event"
          className="btn-primary"
        >
          + Create Event
        </Link>
      </div>

      <div className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date &amp; Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reg. Deadline</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {events.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">No events found. Start by creating one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{event.name}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.venue}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{format(new Date(event.date), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-gray-500 mt-1">{event.time}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {event.registration_deadline ? (
                        <div>
                          <div className="text-sm text-gray-900">{format(new Date(event.registration_deadline), 'MMM d, yyyy')}</div>
                          <div className="text-xs text-gray-500 mt-1">{format(new Date(event.registration_deadline), 'h:mm a')}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-md bg-gray-50 text-gray-900 border border-gray-200">
                        {event.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-md border
                        ${event.status === 'PUBLISHED' ? 'bg-gray-50 text-gray-900 border-gray-200' :
                          event.status === 'REGISTRATION_OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          event.status === 'REGISTRATION_CLOSED' ? 'bg-red-50 text-red-700 border-red-100' :
                          event.status === 'COMPLETED' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                          'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {event.status.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-3">
                        <Link
                          href={`/admin/events/${event.id}/participants`}
                          className="text-primary hover:text-primary-hover transition-colors"
                        >
                          Manage {event.event_type === 'TEAM' ? 'Teams' : 'Participants'}
                        </Link>
                        <div className="w-px h-4 bg-gray-200" />
                        <button
                          onClick={() => openExtendModal(event)}
                          className="text-gray-500 hover:text-gray-900 transition-colors font-medium"
                        >
                          Extend Reg.
                        </button>
                        <div className="w-px h-4 bg-gray-200" />
                        <button
                          onClick={() => handleDelete(event.id, event.name)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extend Registration Modal */}
      {extendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="surface-panel w-full max-w-md p-6 animate-fade-in-up">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="eyebrow mb-1">Registration Deadline</p>
                <h2 className="text-lg font-bold text-gray-900">Extend for &ldquo;{extendTarget.name}&rdquo;</h2>
              </div>
              <button
                onClick={closeExtendModal}
                className="text-gray-400 hover:text-gray-900 transition-colors mt-1"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {extendError && <div className="status-error mb-4">{extendError}</div>}

            <form onSubmit={handleExtendSubmit} className="space-y-5">
              <div>
                <label className="label-text">New Registration Deadline</label>
                <input
                  type="datetime-local"
                  value={extendDeadline}
                  onChange={(e) => setExtendDeadline(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={reopenReg}
                  onChange={(e) => setReopenReg(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    Reopen registrations
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Set status to <strong>Registration Open</strong> so students can register again
                  </p>
                </div>
              </label>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeExtendModal} className="btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={extendLoading} className="btn-primary flex-1">
                  {extendLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
