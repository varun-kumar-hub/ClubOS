'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { 
  HiOutlineCalendar, 
  HiOutlineUserGroup, 
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlinePlus,
  HiOutlineSpeakerphone,
  HiOutlineArrowNarrowRight
} from 'react-icons/hi';

export default function AdminDashboard() {
  const [overview, setOverview] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    totalTeams: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchOverview = async () => {
      try {
        const res = await Promise.race([
          api.get('/analytics/overview'),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Dashboard request timed out.')), 6000)
          ),
        ]);

        if (!mounted) return;

        setOverview({
          totalEvents: res.data?.totalEvents || 0,
          totalParticipants: res.data?.totalParticipants || 0,
          totalTeams: res.data?.totalTeams || 0,
          attendanceRate: res.data?.attendanceRate || 0,
        });
        setError('');
      } catch (err) {
        console.error('Failed to load overview data', err);
        if (!mounted) return;
        setError(err.response?.data?.error || err.message || 'Live analytics are unavailable right now.');
      }
    };

    fetchOverview();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-12">
        <h1 className="text-2xl font-black font-outfit text-foreground tracking-tight mb-1">Command Dashboard</h1>
        <p className="text-zinc-500 text-sm font-medium">Platform performance and strategic overview.</p>
      </div>

      {error && (
        <div className="status-info mb-6">
          {error} You can still use events, attendance, announcements, and the rest of the admin workspace.
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<HiOutlineCalendar className="w-5 h-5" />}
          label="Active Events"
          value={overview?.totalEvents || 0}
        />
        <StatCard 
          icon={<HiOutlineUserGroup className="w-5 h-5" />}
          label="Participants"
          value={overview?.totalParticipants || 0}
        />
        <StatCard 
          icon={<HiOutlineUsers className="w-5 h-5" />}
          label="Registered Teams"
          value={overview?.totalTeams || 0}
        />
        <StatCard 
          icon={<HiOutlineChartBar className="w-5 h-5" />}
          label="Attendance Rate"
          value={`${overview?.attendanceRate || 0}%`}
        />
        <div className="bg-zinc-950 p-6 rounded-xl text-white flex flex-col justify-between shadow-lg">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <p className="text-xl font-bold tracking-tight">Systems Online</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 border border-border bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-sm font-black font-outfit text-foreground mb-6 uppercase tracking-wider">Quick Directives</h2>
          <div className="space-y-3">
            <ActionLink href="/admin/create-event" icon={<HiOutlinePlus />} label="Create Event" primary />
            <ActionLink href="/admin/announcements" icon={<HiOutlineSpeakerphone />} label="Post Notice" />
            <ActionLink href="/admin/events" icon={<HiOutlineCalendar />} label="Manage Repository" />
          </div>
        </div>

        <div className="lg:col-span-2 border border-border bg-zinc-50/50 rounded-xl p-8 shadow-sm">
          <h2 className="text-sm font-black font-outfit text-foreground mb-4 uppercase tracking-wider">Intelligence Summary</h2>
          <div className="space-y-4">
             <p className="text-zinc-500 text-sm font-medium leading-relaxed">
               Current live totals show {overview?.totalParticipants || 0} participant registrations across {overview?.totalEvents || 0} active events,
               with {overview?.totalTeams || 0} team registrations already synced into the admin workspace.
             </p>
             <p className="text-zinc-500 text-sm font-medium leading-relaxed">
               Admin actions and member registrations now read from the same shared records, so new team signups should flow into
               event participants, attendance, and dashboard reporting together.
             </p>
             <div className="flex gap-2">
                <div className="h-1 w-12 bg-zinc-900 rounded-full"></div>
                <div className="h-1 w-8 bg-zinc-300 rounded-full"></div>
                <div className="h-1 w-20 bg-zinc-100 rounded-full"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-border shadow-sm hover:border-zinc-300 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-zinc-50 text-foreground flex items-center justify-center mb-4 border border-zinc-100">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-black font-outfit text-foreground">{value}</p>
    </div>
  );
}

function ActionLink({ href, icon, label, primary }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center justify-between w-full p-4 rounded-lg font-bold text-xs transition-all duration-200 group
        ${primary 
          ? 'bg-zinc-950 text-white hover:bg-zinc-800' 
          : 'bg-white text-foreground hover:bg-zinc-50 border border-border'
        }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      <HiOutlineArrowNarrowRight className="w-4 h-4" />
    </Link>
  );
}
