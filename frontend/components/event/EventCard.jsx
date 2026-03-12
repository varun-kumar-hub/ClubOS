'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineLocationMarker, HiOutlinePencilAlt, HiOutlineUsers } from 'react-icons/hi';

export default function EventCard({ event }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'club_admin';

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="group bg-white rounded-xl border border-border shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Visual Indicator */}
      <div className="relative h-48 bg-zinc-50 flex items-center justify-center border-b border-zinc-100">
        {event.poster ? (
          <img 
            src={event.poster} 
            alt={event.name} 
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          <HiOutlineCalendar className="w-10 h-10 text-zinc-200" />
        )}
        
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-white/90 backdrop-blur border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-600">
          {event.status?.replace('_', ' ')}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-lg font-black font-outfit text-foreground leading-snug mb-2 group-hover:text-zinc-600 transition-colors">
            {event.name}
          </h3>
          <p className="text-zinc-500 text-xs font-medium line-clamp-2 mb-6 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-2">
            <InfoItem icon={<HiOutlineCalendar />} text={formattedDate} />
            <InfoItem icon={<HiOutlineClock />} text={event.time} />
            <InfoItem icon={<HiOutlineLocationMarker />} text={event.venue} />
          </div>
        </div>

        {/* Action */}
        <div className="mt-8 pt-4 border-t border-zinc-50">
          {isAdmin ? (
            <div className="space-y-2">
              <Link
                href="/admin/events"
                className="w-full btn-professional py-3 flex items-center justify-center gap-2"
              >
                <HiOutlinePencilAlt className="h-5 w-5" />
                Manage Event
              </Link>
              <Link
                href={`/admin/events/${event.id}/participants`}
                className="w-full btn-outline py-3 flex items-center justify-center gap-2 text-sm"
              >
                <HiOutlineUsers className="h-5 w-5" />
                View Registrations
              </Link>
            </div>
          ) : user ? (
            <Link 
              href={`/events/${event.id}`}
              className="w-full btn-professional py-3 flex items-center justify-center gap-2"
            >
              Access Event
            </Link>
          ) : (
            <Link 
              href="/login"
              className="w-full btn-outline py-3 flex items-center justify-center gap-2 text-xs"
            >
              Sign in to Register
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, text }) {
  return (
    <div className="flex items-center gap-2.5 text-zinc-400 text-[11px] font-bold">
      <div className="text-zinc-300">{icon}</div>
      <span>{text}</span>
    </div>
  );
}
