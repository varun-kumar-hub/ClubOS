const eventService = require('./event.service');

const eventController = {
  async getAll(req, res, next) {
    try {
      const { page, limit, status, eventType } = req.query;
      const result = await eventService.getAllEvents({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        eventType
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const event = await eventService.getEventById(req.params.id);
      res.json(event);
    } catch (err) {
      next(err);
    }
  },

  async getPublished(req, res, next) {
    try {
      const events = await eventService.getPublishedEvents();
      res.json(events);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const event = await eventService.createEvent(req.body);
      res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const event = await eventService.updateEvent(req.params.id, req.body);
      res.json(event);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await eventService.deleteEvent(req.params.id);
      res.json({ message: 'Event deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = eventController;
