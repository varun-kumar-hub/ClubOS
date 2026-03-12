'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { format } from 'date-fns';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await Promise.race([
        api.get('/announcements'),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Announcements are taking too long to load.')), 6000)
        ),
      ]);
      setAnnouncements(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to load announcements', err);
      setError(err.response?.data?.error || err.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/announcements', formData);
      setFormData({ title: '', description: '' });
      setMessage('Announcement posted successfully.');
      setError('');
      fetchAnnouncements({ silent: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to post announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await api.delete(`/announcements/${id}`);
        setAnnouncements(announcements.filter(a => a.id !== id));
        setMessage('Announcement deleted successfully.');
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to delete announcement.');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Announcements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Publish updates without blocking the admin workspace while data refreshes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchAnnouncements({ silent: true })}
          disabled={loading || refreshing || isSubmitting}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {message && <div className="status-success mb-4">{message}</div>}
      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500 mb-2">Announcements Error</p>
          <p className="text-sm font-medium text-gray-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Post New Announcement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" required
                  value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  required rows={5}
                  value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900" 
                />
              </div>
              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Announcement'}
              </button>
            </form>
          </div>
        </div>

        {/* List of Announcements */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="h-6 w-48 rounded-lg bg-gray-100" />
                    <div className="h-5 w-16 rounded-lg bg-gray-100" />
                  </div>
                  <div className="mb-4 h-4 w-32 rounded-lg bg-gray-100" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded-lg bg-gray-100" />
                    <div className="h-4 w-5/6 rounded-lg bg-gray-100" />
                    <div className="h-4 w-3/4 rounded-lg bg-gray-100" />
                  </div>
                </div>
              ))
            ) : announcements.length === 0 ? (
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-16 text-center text-gray-500 flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <p>No announcements posted yet.</p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xl font-bold text-gray-900">{announcement.title}</h4>
                    <button 
                      onClick={() => handleDelete(announcement.id)}
                      className="text-gray-400 hover:text-red-600 text-sm font-medium px-2 py-1 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">{format(new Date(announcement.created_at), 'MMM d, yyyy h:mm a')}</p>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{announcement.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
