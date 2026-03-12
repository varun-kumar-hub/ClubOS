const teamModel = require('./team.model');
const eventModel = require('../event/event.model');
const participantModel = require('../participant/participant.model');
const generateTeamCode = require('../../utils/generateTeamCode');
const { validateRequired } = require('../../utils/validators');
const { sendTeamCreatedEmail } = require('../../services/email.service');

const normalizeLimit = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const teamService = {
  async getTeamsByEvent(eventId) {
    return teamModel.findByEventId(eventId);
  },

  async getTeamById(id) {
    const team = await teamModel.findById(id);
    if (!team) throw Object.assign(new Error('Team not found'), { statusCode: 404 });
    return team;
  },

  async createTeam({ teamName, eventId, leader }) {
    // Validate
    const validation = validateRequired(['teamName', 'eventId'], { teamName, eventId });
    if (!validation.valid) throw Object.assign(new Error(validation.message), { statusCode: 400 });

    const leaderValidation = validateRequired(['name', 'email', 'phone', 'department', 'year'], leader || {});
    if (!leaderValidation.valid) throw Object.assign(new Error(leaderValidation.message), { statusCode: 400 });

    // Get event
    const event = await eventModel.findById(eventId);
    if (!event) throw Object.assign(new Error('Event not found'), { statusCode: 404 });
    if (event.event_type !== 'TEAM') {
      throw Object.assign(new Error('This event does not support teams'), { statusCode: 400 });
    }

    // Check team slots
    const maxTeams = normalizeLimit(event.max_teams);
    if (maxTeams) {
      const teamCount = await teamModel.countByEventId(eventId);
      if (teamCount >= maxTeams) {
        throw Object.assign(new Error('Maximum teams limit reached'), { statusCode: 400 });
      }
    }

    // Check deadline
    if (new Date() > new Date(event.registration_deadline)) {
      throw Object.assign(new Error('Registration deadline has passed'), { statusCode: 400 });
    }

    // Check duplicate leader registration
    const existingParticipant = await participantModel.findByEmail(leader.email, eventId);
    if (existingParticipant) {
      throw Object.assign(new Error('Leader is already registered for this event'), { statusCode: 409 });
    }

    // Generate unique team code
    const code = generateTeamCode().toUpperCase();

    // Create team
    const team = await teamModel.create({
      name: teamName,
      code,
      event_id: eventId
    });

    // Register leader as participant
    const leaderParticipant = await participantModel.create({
      name: leader.name,
      email: leader.email,
      phone: leader.phone,
      department: leader.department,
      year: leader.year,
      event_id: eventId,
      team_id: team.id
    });

    // Set leader
    await teamModel.updateLeader(team.id, leaderParticipant.id);

    // Send email (non-blocking)
    sendTeamCreatedEmail(leaderParticipant, team, event).catch(err =>
      console.error('Email send failed:', err.message)
    );

    return { ...team, code, leader: leaderParticipant };
  },

  async joinTeam({ code, member }) {
    const validation = validateRequired(['name', 'email', 'phone', 'department', 'year'], member || {});
    if (!validation.valid) throw Object.assign(new Error(validation.message), { statusCode: 400 });
    if (!code?.trim()) throw Object.assign(new Error('Team code is required'), { statusCode: 400 });

    // Find team by code
    const normalizedCode = code.trim().toUpperCase();
    const team = await teamModel.findByCode(normalizedCode);
    if (!team) throw Object.assign(new Error('Invalid team code'), { statusCode: 404 });

    const event = team.events;
    if (event.event_type !== 'TEAM') {
      throw Object.assign(new Error('This team code does not belong to a team-based event'), { statusCode: 400 });
    }

    // Check deadline
    if (new Date() > new Date(event.registration_deadline)) {
      throw Object.assign(new Error('Registration deadline has passed'), { statusCode: 400 });
    }

    // Check team size
    const teamSize = normalizeLimit(event.team_size);
    if (teamSize) {
      const memberCount = await teamModel.countMembers(team.id);
      if (memberCount >= teamSize) {
        throw Object.assign(new Error(`Team is full. Only ${teamSize} member${teamSize > 1 ? 's' : ''} are allowed for this event.`), { statusCode: 400 });
      }
    }

    // Check duplicate
    const existing = await participantModel.findByEmail(member.email, event.id);
    if (existing) {
      throw Object.assign(new Error('You are already registered for this event'), { statusCode: 409 });
    }

    // Create participant linked to team
    const participant = await participantModel.create({
      name: member.name,
      email: member.email,
      phone: member.phone,
      department: member.department,
      year: member.year,
      event_id: event.id,
      team_id: team.id
    });

    const updatedTeam = await teamModel.findById(team.id);

    return {
      team: {
        id: updatedTeam.id,
        name: updatedTeam.name,
        code: updatedTeam.code,
        leader_id: updatedTeam.leader_id,
        member_count: updatedTeam.participants?.length || 0,
        team_size: teamSize,
        participants: updatedTeam.participants || [],
      },
      member: participant,
    };
  }
};

module.exports = teamService;
