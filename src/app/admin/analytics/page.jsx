'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAnalytics() {
  const [overview, setOverview] = useState(null);
  const [eventsChart, setEventsChart] = useState([]);
  const [deptChart, setDeptChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [overviewRes, eventsRes, deptRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/events'),
          api.get('/analytics/departments')
        ]);
        
        setOverview(overviewRes.data);
        setEventsChart(eventsRes.data);
        setDeptChart(deptRes.data);
        setError('');
      } catch (err) {
        console.error('Failed to load analytics', err);
        setError(err.response?.data?.error || err.message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div></div>;

  if (error) {
    return (
      <div className="flex justify-center py-20">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500 mb-3">Analytics Error</p>
          <p className="text-sm font-medium text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-t-4 border-t-blue-500">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Events</p>
          <p className="text-3xl font-bold text-gray-900">{overview?.totalEvents || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-t-4 border-t-indigo-500">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Participants</p>
          <p className="text-3xl font-bold text-gray-900">{overview?.totalParticipants || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-t-4 border-t-teal-500">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Teams</p>
          <p className="text-3xl font-bold text-gray-900">{overview?.totalTeams || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-t-4 border-t-green-500">
          <p className="text-sm font-medium text-gray-500 mb-1">Global Attendance Rate</p>
          <p className="text-3xl font-bold text-gray-900">{overview?.attendanceRate || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration by Event Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Registrations per Event</h3>
          <p className="mb-6 text-sm text-gray-500">
            Team events count team registrations, while individual events count participant registrations.
          </p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsChart} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                <XAxis dataKey="event" angle={-45} textAnchor="end" height={80} interval={0} tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="registrations" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Participant Demographics (Department)</h3>
          <div className="h-80 w-full flex items-center justify-center">
            {deptChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptChart}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ department, percent }) => `${department} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="participants"
                    nameKey="department"
                  >
                    {deptChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">Not enough data to display chart.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
