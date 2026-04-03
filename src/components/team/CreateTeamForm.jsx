'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function CreateTeamForm({ eventId, onSuccess }) {
  const { user } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [leaderData, setLeaderData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (!user) return;

    setLeaderData((current) => ({
      ...current,
      name: user.name || user.full_name || user.user_metadata?.full_name || current.name,
      email: user.email || current.email,
      phone: user.phone || current.phone,
      department: user.department || current.department,
      year: user.year || current.year,
    }));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/teams/create', { teamName, eventId, leader: leaderData });
      setSuccessData(res.data);
      onSuccess?.(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="space-y-4 p-6 sm:p-7">
        <div className="status-success">
          Team created successfully. Share the code below with your teammates.
        </div>
        <div className="surface-panel-muted p-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Team Code</p>
          <p className="mt-3 font-mono text-3xl font-black tracking-[0.22em] text-foreground">{successData.code}</p>
          <p className="mt-3 text-sm text-secondary">Team: {successData.name}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-7">
      <div>
        <p className="eyebrow">Team registration</p>
        <h3 className="mt-4 text-2xl font-black tracking-tight text-foreground">Create a team</h3>
        <p className="mt-2 text-sm leading-6 text-secondary">Register your team and assign yourself as the leader.</p>
      </div>

      {error && <div className="status-error">{error}</div>}

      <div>
        <label className="label-text">Team Name</label>
        <input type="text" required value={teamName} onChange={(e) => setTeamName(e.target.value)} className="input-field" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Leader Name">
          <input type="text" required name="name" value={leaderData.name} onChange={(e) => setLeaderData({ ...leaderData, [e.target.name]: e.target.value })} className="input-field" />
        </Field>
        <Field label="Leader Email">
          <input type="email" required name="email" value={leaderData.email} onChange={(e) => setLeaderData({ ...leaderData, [e.target.name]: e.target.value })} className="input-field" />
        </Field>
        <Field label="Phone Number">
          <input type="tel" required name="phone" pattern="[0-9]{10}" value={leaderData.phone} onChange={(e) => setLeaderData({ ...leaderData, [e.target.name]: e.target.value })} className="input-field" />
        </Field>
        <Field label="Department">
          <select required name="department" value={leaderData.department} onChange={(e) => setLeaderData({ ...leaderData, [e.target.name]: e.target.value })} className="input-field">
            <option value="">Select department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="Other">Other</option>
          </select>
        </Field>
        <Field label="Academic Year">
          <select required name="year" value={leaderData.year} onChange={(e) => setLeaderData({ ...leaderData, [e.target.name]: e.target.value })} className="input-field">
            <option value="">Select year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </Field>
      </div>

      <button type="submit" disabled={loading} className="btn-professional w-full">
        {loading ? 'Creating Team...' : 'Create Team & Register'}
      </button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      {children}
    </div>
  );
}
