const eventModel = require('./event.model');
const { paginate, paginationMeta } = require('../../utils/pagination');

const eventService = {
  async getAllEvents({ page = 1, limit = 20, status, eventType }) {
    const { from, to } = paginate(null, page, limit);
    const filters = { from, to };
    if (status) filters.status = status;
    if (eventType) filters.eventType = eventType;

    const { data, count } = await eventModel.findAll(filters);
    return {
      events: data,
      pagination: paginationMeta(count, page, limit)
    };
  },

  async getEventById(id) {
    const event = await eventModel.findById(id);
    if (!event) throw Object.assign(new Error('Event not found'), { statusCode: 404 });
    return event;
  },

  async createEvent(eventData) {
    // Map camelCase to snake_case for Supabase
    const dbData = {
      name: eventData.name,
      description: eventData.description,
      poster: eventData.poster || null,
      date: eventData.date,
      time: eventData.time,
      venue: eventData.venue,
      registration_deadline: eventData.registrationDeadline,
      event_type: eventData.eventType,
      max_participants: eventData.maxParticipants || null,
      max_teams: eventData.maxTeams || null,
      team_size: eventData.teamSize || null,
      status: eventData.status || 'DRAFT'
    };
    return eventModel.create(dbData);
  },

  async updateEvent(id, eventData) {
    await this.getEventById(id); // ensure exists
    const dbData = {};
    if (eventData.name) dbData.name = eventData.name;
    if (eventData.description) dbData.description = eventData.description;
    if (eventData.poster !== undefined) dbData.poster = eventData.poster;
    if (eventData.date) dbData.date = eventData.date;
    if (eventData.time) dbData.time = eventData.time;
    if (eventData.venue) dbData.venue = eventData.venue;
    if (eventData.registrationDeadline) dbData.registration_deadline = eventData.registrationDeadline;
    if (eventData.eventType) dbData.event_type = eventData.eventType;
    if (eventData.maxParticipants !== undefined) dbData.max_participants = eventData.maxParticipants;
    if (eventData.maxTeams !== undefined) dbData.max_teams = eventData.maxTeams;
    if (eventData.teamSize !== undefined) dbData.team_size = eventData.teamSize;
    if (eventData.status) dbData.status = eventData.status;

    return eventModel.update(id, dbData);
  },

  async deleteEvent(id) {
    await this.getEventById(id);
    return eventModel.delete(id);
  },

  async getPublishedEvents() {
    return eventModel.getPublishedEvents();
  }
};

module.exports = eventService;
