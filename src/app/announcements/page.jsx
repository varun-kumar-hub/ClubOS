'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '@/services/api';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements');
        setAnnouncements(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load announcements.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <section className="surface-panel px-6 py-8 sm:px-8">
        <span className="eyebrow">Official updates</span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Announcements and notices.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-secondary">
          Keep track of event notices, scheduling updates, and operational changes from the club team.
        </p>
      </section>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className="surface-panel grid gap-5 p-6 md:grid-cols-[120px_minmax(0,1fr)]">
              <div>
                <div className="h-5 w-16 animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 w-12 animate-pulse rounded bg-slate-100" />
              </div>
              <div>
                <div className="h-6 w-1/2 animate-pulse rounded bg-slate-100" />
                <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mx-auto max-w-md">
          <div className="surface-panel p-8 text-center">
            <p className="text-xl font-black tracking-tight text-foreground">Unable to load announcements</p>
            <p className="mt-3 text-sm leading-6 text-secondary">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && announcements.length === 0 ? (
        <div className="surface-panel p-12 text-center">
          <h2 className="text-2xl font-black tracking-tight text-foreground">No announcements yet</h2>
          <p className="mt-3 text-sm leading-6 text-secondary">This area will populate as admins publish updates.</p>
        </div>
      ) : null}

      {!loading && !error && announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article key={announcement.id} className="surface-panel grid gap-5 p-6 md:grid-cols-[120px_minmax(0,1fr)]">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-muted-foreground">
                  {format(new Date(announcement.created_at), 'MMM d')}
                </p>
                <p className="mt-1 text-sm text-secondary">{format(new Date(announcement.created_at), 'yyyy')}</p>
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">{announcement.title}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-secondary">{announcement.description}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
