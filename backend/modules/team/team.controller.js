const teamService = require('./team.service');

const teamController = {
  async getByEvent(req, res, next) {
    try {
      const teams = await teamService.getTeamsByEvent(req.params.eventId);
      res.json(teams);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const team = await teamService.getTeamById(req.params.id);
      res.json(team);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const result = await teamService.createTeam(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async join(req, res, next) {
    try {
      const result = await teamService.joinTeam(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = teamController;
