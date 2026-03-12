const announcementModel = require('./announcement.model');
const { validateRequired } = require('../../utils/validators');

const announcementService = {
  async getAll() {
    return announcementModel.findAll();
  },

  async getById(id) {
    const announcement = await announcementModel.findById(id);
    if (!announcement) throw Object.assign(new Error('Announcement not found'), { statusCode: 404 });
    return announcement;
  },

  async create({ title, description }) {
    const validation = validateRequired(['title', 'description'], { title, description });
    if (!validation.valid) throw Object.assign(new Error(validation.message), { statusCode: 400 });
    return announcementModel.create({ title, description });
  },

  async update(id, data) {
    await this.getById(id);
    return announcementModel.update(id, data);
  },

  async delete(id) {
    await this.getById(id);
    return announcementModel.delete(id);
  }
};

module.exports = announcementService;
