const announcementService = require('./announcement.service');

const announcementController = {
  async getAll(req, res, next) {
    try {
      const announcements = await announcementService.getAll();
      res.json(announcements);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const announcement = await announcementService.create(req.body);
      res.status(201).json(announcement);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const announcement = await announcementService.update(req.params.id, req.body);
      res.json(announcement);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await announcementService.delete(req.params.id);
      res.json({ message: 'Announcement deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = announcementController;
