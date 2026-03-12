'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function StudentDashboard() {
  const { user, admin, loading } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [registrationsError, setRegistrationsError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if (!loading && admin) {
      router.replace('/admin/dashboard');
    }
  }, [user, admin, loading, router]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user || admin) {
        return;
      }

      setRegistrationsLoading(true);
      setRegistrationsError('');

      try {
        const res = await api.get('/participants/me/registrations');
        setRegistrations(res.data || []);
      } catch (err) {
        console.error('Failed to load registrations', err);
        setRegistrationsError(err.response?.data?.error || err.message || 'Failed to load your registrations.');
      } finally {
        setRegistrationsLoading(false);
      }
    };

    fetchRegistrations();
  }, [user, admin]);

  if (loading || !user || admin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayName = user.name || user.full_name || user.user_metadata?.full_name || user.email;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {displayName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-100"></div>
            <div className="px-6 pb-6">
              <div className="-mt-8 mb-6 flex items-start">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md border border-gray-100 text-2xl font-bold text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
                <p className="text-sm text-gray-500 mb-6">{user.email}</p>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</p>
                    <p className="text-sm font-medium text-gray-900">{user.role || 'Student'}</p>
                  </div>
                  {(user.department || user.year) && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Academic Details</p>
                      <p className="text-sm font-medium text-gray-900">{user.department} {user.year && `- ${user.year}`}</p>
                    </div>
                  )}
                  {user.phone && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full min-h-[400px]">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">My Registered Events</h2>

            {registrationsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : registrationsError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {registrationsError}
              </div>
            ) : registrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-48 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No registrations yet</h3>
                <p className="text-sm text-gray-500 mb-4">You haven&apos;t registered for any upcoming events.</p>
                <button onClick={() => router.push('/events')} className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-medium transition-colors text-sm">
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <div key={registration.id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{registration.event?.name || 'Event'}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {registration.event?.date ? format(new Date(registration.event.date), 'MMMM d, yyyy') : 'Date unavailable'}
                          {registration.event?.time ? ` | ${registration.event.time}` : ''}
                          {registration.event?.venue ? ` | ${registration.event.venue}` : ''}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600 border border-gray-200">
                            {registration.event?.event_type === 'TEAM' ? 'Team Event' : 'Individual Event'}
                          </span>
                          {registration.event?.status && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                              {registration.event.status.replaceAll('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => router.push(`/events/${registration.event_id}`)}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                      >
                        View Event
                      </button>
                    </div>

                    {registration.team && (
                      <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Team Registration</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900">{registration.team.name}</p>
                        <p className="mt-1 text-sm text-gray-500">Code: {registration.team.code}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
