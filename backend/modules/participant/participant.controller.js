const participantService = require('./participant.service');

const participantController = {
  async getMyRegistrations(req, res, next) {
    try {
      const registrations = await participantService.getRegistrationsForUser(req.user.email);
      res.json(registrations);
    } catch (err) {
      next(err);
    }
  },

  async getByEvent(req, res, next) {
    try {
      const { page, limit, search, department, year } = req.query;
      const result = await participantService.getParticipantsByEvent(req.params.eventId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        search, department, year
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async register(req, res, next) {
    try {
      const participant = await participantService.registerParticipant(req.body);
      res.status(201).json(participant);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await participantService.deleteParticipant(req.params.id);
      res.json({ message: 'Participant removed successfully' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = participantController;
