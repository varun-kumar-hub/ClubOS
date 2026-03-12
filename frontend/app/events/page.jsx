'use client';
import { useEffect, useState } from 'react';
import { HiOutlineRefresh, HiOutlineSparkles } from 'react-icons/hi';
import api from '@/services/api';
import EventCard from '@/components/event/EventCard';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events/published');
        setEvents(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <section className="surface-panel px-6 py-8 sm:px-8">
        <span className="eyebrow">
          <HiOutlineSparkles className="h-4 w-4" />
          Upcoming Events
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Discover current opportunities.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-secondary">
          Browse active club events, review registration windows, and move into the details page with the right session context already in place.
        </p>
      </section>

      {loading && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="surface-panel overflow-hidden">
              <div className="h-48 animate-pulse bg-slate-100" />
              <div className="space-y-4 p-6">
                <div className="h-6 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mx-auto max-w-md">
          <div className="surface-panel p-8 text-center">
            <p className="text-xl font-black tracking-tight text-foreground">Unable to load events</p>
            <p className="mt-3 text-sm leading-6 text-secondary">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-outline mt-6 w-full">
              <HiOutlineRefresh className="h-5 w-5" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && events.length === 0 ? (
        <div className="surface-panel p-12 text-center">
          <h2 className="text-2xl font-black tracking-tight text-foreground">No published events yet</h2>
          <p className="mt-3 text-sm leading-6 text-secondary">Check announcements for updates while new events are being prepared.</p>
        </div>
      ) : null}

      {!loading && !error && events.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event, index) => (
            <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 60}ms` }}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
