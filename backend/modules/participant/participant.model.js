const supabase = require('../../config/database');

const attachTeamsToParticipants = (participants, teams) => {
  const teamsById = new Map(teams.map((team) => [team.id, team]));

  return participants.map((participant) => ({
    ...participant,
    teams: participant.team_id ? teamsById.get(participant.team_id) || null : null,
  }));
};

const participantModel = {
  async findByEventId(eventId, filters = {}) {
    let query = supabase
      .from('participants')
      .select('*', { count: 'exact' })
      .eq('event_id', eventId);

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    if (filters.department) query = query.eq('department', filters.department);
    if (filters.year) query = query.eq('year', filters.year);

    query = query.order('created_at', { ascending: false });

    if (filters.from !== undefined && filters.to !== undefined) {
      query = query.range(filters.from, filters.to);
    }

    const { data: participants, error, count } = await query;
    if (error) throw error;

    const teamIds = [...new Set((participants || []).map((participant) => participant.team_id).filter(Boolean))];
    if (!teamIds.length) {
      return { data: participants || [], count };
    }

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, code')
      .in('id', teamIds);

    if (teamsError) throw teamsError;

    return { data: attachTeamsToParticipants(participants || [], teams || []), count };
  },

  async findByEmail(email, eventId) {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('email', email)
      .eq('event_id', eventId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async countByEventId(eventId) {
    const { count, error } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);
    if (error) throw error;
    return count;
  },

  async create(participantData) {
    const { data, error } = await supabase
      .from('participants')
      .insert(participantData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data: participant, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!participant?.team_id) return participant;

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, code')
      .eq('id', participant.team_id)
      .single();

    if (teamError) throw teamError;

    return {
      ...participant,
      teams: team,
    };
  },

  async findByEmailAcrossEvents(email) {
    const { data: participants, error } = await supabase
      .from('participants')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!participants?.length) return [];

    const eventIds = [...new Set(participants.map((participant) => participant.event_id).filter(Boolean))];
    const teamIds = [...new Set(participants.map((participant) => participant.team_id).filter(Boolean))];

    const [{ data: events, error: eventsError }, { data: teams, error: teamsError }] = await Promise.all([
      eventIds.length
        ? supabase.from('events').select('*').in('id', eventIds)
        : Promise.resolve({ data: [], error: null }),
      teamIds.length
        ? supabase.from('teams').select('id, name, code, leader_id').in('id', teamIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (eventsError) throw eventsError;
    if (teamsError) throw teamsError;

    const eventsById = new Map((events || []).map((event) => [event.id, event]));
    const teamsById = new Map((teams || []).map((team) => [team.id, team]));

    return participants.map((participant) => ({
      ...participant,
      event: eventsById.get(participant.event_id) || null,
      team: participant.team_id ? teamsById.get(participant.team_id) || null : null,
    }));
  },

  async delete(id) {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

module.exports = participantModel;
