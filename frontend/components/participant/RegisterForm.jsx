'use client';
import { useEffect, useState } from 'react';
import { HiCheckCircle, HiOutlineAcademicCap, HiOutlineCalendar, HiOutlineMail, HiOutlinePhone, HiOutlineUser } from 'react-icons/hi';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function RegisterForm({ eventId, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    setFormData((current) => ({
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
      await api.post('/participants/register', { ...formData, eventId });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-7">
      <div>
        <p className="eyebrow">Individual registration</p>
        <h3 className="mt-4 text-2xl font-black tracking-tight text-foreground">Confirm your registration</h3>
        <p className="mt-2 text-sm leading-6 text-secondary">Review your details and complete your event registration.</p>
      </div>

      {error && <div className="status-error">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <InputGroup label="Verified Name" icon={<HiOutlineUser className="h-5 w-5" />}>
          <input type="text" disabled value={formData.name} className="input-field cursor-not-allowed bg-slate-50 pl-11 text-slate-400" />
        </InputGroup>

        <InputGroup label="Verified Email" icon={<HiOutlineMail className="h-5 w-5" />}>
          <input type="email" disabled value={formData.email} className="input-field cursor-not-allowed bg-slate-50 pl-11 text-slate-400" />
        </InputGroup>

        <InputGroup label="Phone Number" icon={<HiOutlinePhone className="h-5 w-5" />}>
          <input
            type="tel"
            required
            name="phone"
            pattern="[0-9]{10}"
            title="10 digit mobile number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="9876543210"
            className="input-field pl-11"
          />
        </InputGroup>

        <InputGroup label="Department" icon={<HiOutlineAcademicCap className="h-5 w-5" />}>
          <select
            required
            name="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="input-field pl-11"
          >
            <option value="">Select department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>
        </InputGroup>

        <InputGroup label="Academic Year" icon={<HiOutlineCalendar className="h-5 w-5" />}>
          <select
            required
            name="year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="input-field pl-11"
          >
            <option value="">Select year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </InputGroup>
      </div>

      <button type="submit" disabled={loading} className="btn-professional w-full">
        {loading ? (
          'Registering...'
        ) : (
          <>
            <HiCheckCircle className="h-5 w-5" />
            Confirm Registration
          </>
        )}
      </button>
    </form>
  );
}

function InputGroup({ label, icon, children }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}
