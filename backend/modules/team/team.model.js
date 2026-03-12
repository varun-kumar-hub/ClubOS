const supabase = require('../../config/database');

const attachParticipantsToTeams = (teams, participants) => {
  const participantsByTeamId = new Map();

  participants.forEach((participant) => {
    const teamParticipants = participantsByTeamId.get(participant.team_id) || [];
    teamParticipants.push(participant);
    participantsByTeamId.set(participant.team_id, teamParticipants);
  });

  return teams.map((team) => ({
    ...team,
    participants: participantsByTeamId.get(team.id) || [],
  }));
};

const teamModel = {
  async findByEventId(eventId) {
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (teamsError) throw teamsError;
    if (!teams?.length) return [];

    const teamIds = teams.map((team) => team.id);
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('id, name, email, phone, department, year, team_id')
      .in('team_id', teamIds)
      .order('created_at', { ascending: true });

    if (participantsError) throw participantsError;

    return attachParticipantsToTeams(teams, participants || []);
  },

  async findByCode(code) {
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('code', code)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!team) return null;

    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('id, name, email, phone, department, year, team_id')
      .eq('team_id', team.id)
      .order('created_at', { ascending: true });

    if (participantsError) throw participantsError;

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', team.event_id)
      .single();

    if (eventError) throw eventError;

    return {
      ...team,
      participants: participants || [],
      events: event,
    };
  },

  async findById(id) {
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('id, name, email, phone, department, year, team_id')
      .eq('team_id', team.id)
      .order('created_at', { ascending: true });

    if (participantsError) throw participantsError;

    return {
      ...team,
      participants: participants || [],
    };
  },

  async countByEventId(eventId) {
    const { count, error } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);
    if (error) throw error;
    return count;
  },

  async countMembers(teamId) {
    const { count, error } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId);
    if (error) throw error;
    return count;
  },

  async create(teamData) {
    const { data, error } = await supabase
      .from('teams')
      .insert(teamData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateLeader(teamId, leaderId) {
    const { data, error } = await supabase
      .from('teams')
      .update({ leader_id: leaderId })
      .eq('id', teamId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

module.exports = teamModel;
