const analyticsService = require('./analytics.service');

const analyticsController = {
  async getOverview(req, res, next) {
    try {
      const overview = await analyticsService.getOverview();
      res.json(overview);
    } catch (err) {
      next(err);
    }
  },

  async getEventChart(req, res, next) {
    try {
      const data = await analyticsService.getEventParticipationChart();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getDepartmentChart(req, res, next) {
    try {
      const data = await analyticsService.getDepartmentChart();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = analyticsController;
