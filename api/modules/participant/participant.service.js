const participantModel = require('./participant.model');
const eventModel = require('../event/event.model');
const { paginate, paginationMeta } = require('../../utils/pagination');
const { validateEmail, validatePhone, validateRequired } = require('../../utils/validators');
const { sendRegistrationConfirmation, sendRegistrationRejected } = require('../../services/email.service');

const participantService = {
  async getParticipantsByEvent(eventId, { page = 1, limit = 20, search, department, year }) {
    const { from, to } = paginate(null, page, limit);
    const { data, count } = await participantModel.findByEventId(eventId, {
      from, to, search, department, year
    });
    return {
      participants: data,
      pagination: paginationMeta(count, page, limit)
    };
  },

  async registerParticipant(registrationData) {
    const { name, email, phone, department, year, eventId } = registrationData;

    // Validate required fields
    const validation = validateRequired(['name', 'email', 'phone', 'department', 'year', 'eventId'], registrationData);
    if (!validation.valid) {
      throw Object.assign(new Error(validation.message), { statusCode: 400 });
    }
    if (!validateEmail(email)) {
      throw Object.assign(new Error('Invalid email format'), { statusCode: 400 });
    }
    if (!validatePhone(phone)) {
      throw Object.assign(new Error('Phone must be 10 digits'), { statusCode: 400 });
    }

    // Get event and validate
    const event = await eventModel.findById(eventId);
    if (!event) throw Object.assign(new Error('Event not found'), { statusCode: 404 });

    // Check registration deadline
    if (new Date() > new Date(event.registration_deadline)) {
      throw Object.assign(new Error('Registration deadline has passed'), { statusCode: 400 });
    }

    // Check if status allows registration
    if (!['PUBLISHED', 'REGISTRATION_OPEN'].includes(event.status)) {
      throw Object.assign(new Error('Event is not open for registration'), { statusCode: 400 });
    }

    // Check duplicate
    const existing = await participantModel.findByEmail(email, eventId);
    if (existing) {
      throw Object.assign(new Error('You are already registered for this event'), { statusCode: 409 });
    }

    // Check capacity for individual events
    if (event.event_type === 'INDIVIDUAL' && event.max_participants) {
      const count = await participantModel.countByEventId(eventId);
      if (count >= event.max_participants) {
        // Send rejection email (non-blocking)
        sendRegistrationRejected({ name, email }, event, 'Event has reached maximum capacity').catch(err => 
          console.error('Rejection email send failed:', err.message)
        );
        throw Object.assign(new Error('Event has reached maximum participants'), { statusCode: 400 });
      }
    }

    const participant = await participantModel.create({
      name, email, phone, department, year,
      event_id: eventId,
      team_id: registrationData.teamId || null
    });

    // Send confirmation email (non-blocking)
    sendRegistrationConfirmation(participant, event).catch(err =>
      console.error('Email send failed:', err.message)
    );

    return participant;
  },

  async getRegistrationsForUser(email) {
    return participantModel.findByEmailAcrossEvents(email);
  },

  async deleteParticipant(id) {
    return participantModel.delete(id);
  }
};

module.exports = participantService;
