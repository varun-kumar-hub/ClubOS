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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div></div>;

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
      {actionMessage && <div className="status-success mb-4">{actionMessage}</div>}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
        <Link 
          href="/admin/create-event"
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          Create Event
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {events.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
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
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {event.venue}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{format(new Date(event.date), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-gray-500 mt-1">{event.time}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-md ${event.event_type === 'TEAM' ? 'bg-gray-50 text-gray-900 border border-gray-200' : 'bg-gray-50 text-gray-900 border border-gray-200'}`}>
                        {event.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-md border
                        ${event.status === 'PUBLISHED' ? 'bg-gray-50 text-gray-900 border-gray-200' : 
                          event.status === 'REGISTRATION_OPEN' ? 'bg-slate-100 text-slate-800 border-slate-200' : 
                          event.status === 'REGISTRATION_CLOSED' ? 'bg-red-50 text-red-700 border-red-100' : 
                          event.status === 'COMPLETED' ? 'bg-gray-50 text-gray-700 border-gray-200' : 
                          'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {event.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-4">
                        <Link href={`/admin/events/${event.id}/participants`} className="text-primary hover:text-primary-hover transition-colors">
                          Manage {event.event_type === 'TEAM' ? 'Teams' : 'Participants'}
                        </Link>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <button onClick={() => handleDelete(event.id, event.name)} className="text-gray-400 hover:text-red-600 transition-colors">
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
    </div>
  );
}
