'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function CreateEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    poster: '',
    date: '',
    time: '',
    venue: '',
    registrationDeadline: '',
    eventType: 'INDIVIDUAL',
    maxParticipants: '',
    maxTeams: '',
    teamSize: '',
    status: 'DRAFT'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clean up empty strings for numbers
      const payload = { ...formData };
      if (!payload.maxParticipants) delete payload.maxParticipants;
      if (!payload.maxTeams) delete payload.maxTeams;
      if (!payload.teamSize) delete payload.teamSize;
      
      await api.post('/events', payload);
      router.push('/admin/events');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600">Fill in the details for the upcoming club event.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
            <input type="text" required name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poster Image URL (Optional)</label>
            <input type="url" name="poster" value={formData.poster} onChange={handleChange} placeholder="https://example.com/image.png" className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white" />
          </div>
        </div>

        {/* Date & Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Date & Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
              <input type="date" required name="date" value={formData.date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
              <input type="time" required name="time" value={formData.time} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <input type="text" required name="venue" value={formData.venue} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white" />
          </div>
        </div>

        {/* Registration & Limits */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Registration & Limits</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white">
                <option value="INDIVIDUAL">Individual</option>
                <option value="TEAM">Team Based</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline (Date & Time)</label>
              <input type="datetime-local" required name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white" />
            </div>
          </div>

          {formData.eventType === 'INDIVIDUAL' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants (Optional)</label>
              <input type="number" min="1" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} placeholder="Unlimited if empty" className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Teams (Optional)</label>
                <input type="number" min="1" name="maxTeams" value={formData.maxTeams} onChange={handleChange} placeholder="Unlimited if empty" className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Size (Optional)</label>
                <input type="number" min="2" name="teamSize" value={formData.teamSize} onChange={handleChange} placeholder="Unrestricted if empty" className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white" />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 bg-white">
              <option value="DRAFT">Draft (Hidden)</option>
              <option value="PUBLISHED">Published (Visible, Reg. Closed)</option>
              <option value="REGISTRATION_OPEN">Registration Open</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
