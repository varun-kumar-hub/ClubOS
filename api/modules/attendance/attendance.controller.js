const attendanceService = require('./attendance.service');

const attendanceController = {
  async getByEvent(req, res, next) {
    try {
      const result = await attendanceService.getAttendanceByEvent(req.params.eventId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async mark(req, res, next) {
    try {
      const { participantId, eventId, status } = req.body;
      const record = await attendanceService.markAttendance(participantId, eventId, status);
      res.json(record);
    } catch (err) {
      next(err);
    }
  },

  async bulkMark(req, res, next) {
    try {
      const { eventId, attendanceList } = req.body;
      const records = await attendanceService.bulkMarkAttendance(eventId, attendanceList);
      res.json(records);
    } catch (err) {
      next(err);
    }
  },

  async getStats(req, res, next) {
    try {
      const stats = await attendanceService.getStats(req.params.eventId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = attendanceController;
