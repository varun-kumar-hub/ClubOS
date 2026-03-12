const attendanceModel = require('./attendance.model');

const attendanceService = {
  async getAttendanceByEvent(eventId) {
    const [records, stats] = await Promise.all([
      attendanceModel.findByEventId(eventId),
      attendanceModel.getStats(eventId)
    ]);
    return { records, stats };
  },

  async markAttendance(participantId, eventId, status = 'PRESENT') {
    return attendanceModel.upsert({
      participant_id: participantId,
      event_id: eventId,
      status,
      marked_at: new Date().toISOString()
    });
  },

  async bulkMarkAttendance(eventId, attendanceList) {
    const records = attendanceList.map(item => ({
      participant_id: item.participantId,
      event_id: eventId,
      status: item.status || 'PRESENT',
      marked_at: new Date().toISOString()
    }));
    return attendanceModel.bulkUpsert(records);
  },

  async getStats(eventId) {
    return attendanceModel.getStats(eventId);
  }
};

module.exports = attendanceService;
