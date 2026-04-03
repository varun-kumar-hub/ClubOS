'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '@/services/api';

export default function ScanAttendancePage() {
  const { eventId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState({ text: '', type: '' });
  const [scannedIds, setScannedIds] = useState(new Set()); // prevent double scans

  const handleScan = async (result) => {
    if (!result || !result.length) return;
    
    // Use first valid QR code found
    const resultString = result[0].rawValue;
    
    try {
      const data = JSON.parse(resultString);
      
      // Validate structure
      if (!data.participantId || !data.eventId) {
         if (lastMessage.text !== 'Invalid QR Code format') {
            setLastMessage({ text: 'Invalid QR Code format', type: 'error' });
         }
         return;
      }
      
      if (data.eventId !== eventId) {
         if (lastMessage.text !== 'Ticket is for a different event') {
            setLastMessage({ text: 'Ticket is for a different event', type: 'error' });
         }
         return;
      }

      if (scannedIds.has(data.participantId) || loading) return;

      setLoading(true);
      setScannedIds(prev => new Set(prev).add(data.participantId));
      
      try {
        const response = await api.post('/attendance/mark', {
          participantId: data.participantId,
          eventId: data.eventId,
          status: 'PRESENT'
        });
        
        const participant = response.data.participant || {};
        const successMsg = participant.name 
          ? `Marked ${participant.name} (${participant.department || ''}) as PRESENT`
          : `Successfully marked Participant ${data.participantId.slice(0,8)}... as PRESENT`;
          
        setLastMessage({ text: successMsg, type: 'success' });
        
        // Optional: play success sound
        const audio = new Audio('/success-chime.mp3');
        audio.play().catch(e => console.log('Audio play failed silently (browser policy)'));

      } catch (err) {
        setLastMessage({ text: err.response?.data?.error || 'Failed to mark attendance', type: 'error' });
        // Remove from set to allow retry
        setScannedIds(prev => {
           const next = new Set(prev);
           next.delete(data.participantId);
           return next;
        });
      } finally {
        setLoading(false);
      }
      
    } catch (e) {
      if (lastMessage.text !== 'Unrecognized QR data') {
         setLastMessage({ text: 'Unrecognized QR data', type: 'error' });
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="mb-2 flex items-center text-sm text-gray-500 hover:text-gray-900">
            &larr; Back to Participants
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Scan QR Ticket</h1>
          <p className="mt-2 text-gray-600">Scan student tickets to mark attendance</p>
        </div>
      </div>

      <div className="bg-black rounded-2xl overflow-hidden shadow-lg relative h-[500px]">
        <Scanner
            onScan={handleScan}
            formats={['qr_code']}
            styles={{ container: { height: '100%' } }}
            components={{ tracker: true }}
        />
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {lastMessage.text && (
        <div className={`p-4 rounded-xl shadow-sm border ${lastMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="flex items-center gap-3">
            {lastMessage.type === 'success' ? (
              <svg className="h-6 w-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className="font-medium text-lg break-all">{lastMessage.text}</p>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">How it works:</p>
        <ul className="list-disc leading-relaxed pl-5">
            <li>Point your device camera at the student's QR ticket.</li>
            <li>The system will automatically scan and record attendance.</li>
            <li>Once an ID is scanned successfully, it won't be scanned again.</li>
        </ul>
      </div>
    </div>
  );
}
