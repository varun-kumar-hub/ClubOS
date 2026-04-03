'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function JoinTeamForm({ onSuccess }) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [memberData, setMemberData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [teamInfo, setTeamInfo] = useState(null);

  useEffect(() => {
    if (!user) return;

    setMemberData((current) => ({
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
      const res = await api.post('/teams/join', { code: code.toUpperCase(), member: memberData });
      setTeamInfo(res.data.team);
      setSuccess(true);
      onSuccess?.(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join team');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 p-6 sm:p-7">
        <div className="status-success">
          You joined <strong>{teamInfo?.name}</strong> successfully.
        </div>
        <div className="surface-panel-muted p-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Team Code</p>
          <p className="mt-3 font-mono text-3xl font-black tracking-[0.22em] text-foreground">{teamInfo?.code}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-7">
      <div>
        <p className="eyebrow">Team registration</p>
        <h3 className="mt-4 text-2xl font-black tracking-tight text-foreground">Join an existing team</h3>
        <p className="mt-2 text-sm leading-6 text-secondary">Enter the team code shared by your team leader and confirm your details.</p>
      </div>

      {error && <div className="status-error">{error}</div>}

      <div>
        <label className="label-text">Team Code</label>
        <input
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ABC123"
          className="input-field font-mono uppercase tracking-[0.18em]"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Member Name">
          <input type="text" required name="name" value={memberData.name} onChange={(e) => setMemberData({ ...memberData, [e.target.name]: e.target.value })} className="input-field" />
        </Field>
        <Field label="Member Email">
          <input type="email" required name="email" value={memberData.email} onChange={(e) => setMemberData({ ...memberData, [e.target.name]: e.target.value })} className="input-field" />
        </Field>
        <Field label="Phone Number">
          <input type="tel" required name="phone" pattern="[0-9]{10}" value={memberData.phone} onChange={(e) => setMemberData({ ...memberData, [e.target.name]: e.target.value })} className="input-field" />
        </Field>
        <Field label="Department">
          <select required name="department" value={memberData.department} onChange={(e) => setMemberData({ ...memberData, [e.target.name]: e.target.value })} className="input-field">
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
          <select required name="year" value={memberData.year} onChange={(e) => setMemberData({ ...memberData, [e.target.name]: e.target.value })} className="input-field">
            <option value="">Select year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </Field>
      </div>

      <button type="submit" disabled={loading} className="btn-professional w-full">
        {loading ? 'Joining Team...' : 'Join Team'}
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
