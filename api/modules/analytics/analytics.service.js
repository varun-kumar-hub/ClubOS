const supabase = require('../../config/database');

const analyticsService = {
  async getOverview() {
    // Total events
    const { count: totalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    // Total participants
    const { count: totalParticipants } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true });

    // Total teams
    const { count: totalTeams } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true });

    // Overall attendance rate
    const { count: totalAttendanceRecords } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true });

    const { count: totalPresent } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PRESENT');

    const attendanceRate = totalAttendanceRecords > 0
      ? Math.round((totalPresent / totalAttendanceRecords) * 100)
      : 0;

    return {
      totalEvents: totalEvents || 0,
      totalParticipants: totalParticipants || 0,
      totalTeams: totalTeams || 0,
      attendanceRate
    };
  },

  async getEventParticipationChart() {
    // Registration totals per event. Team events count teams; individual events count participants.
    const { data: events } = await supabase
      .from('events')
      .select('id, name, event_type')
      .in('status', ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED']);

    const chartData = [];
    for (const event of (events || [])) {
      if (event.event_type === 'TEAM') {
        const { count: teamCount } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        const { count: memberCount } = await supabase
          .from('participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        chartData.push({
          event: event.name,
          registrations: teamCount || 0,
          members: memberCount || 0,
          eventType: 'TEAM',
        });
      } else {
        const { count: participantCount } = await supabase
          .from('participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        chartData.push({
          event: event.name,
          registrations: participantCount || 0,
          members: participantCount || 0,
          eventType: 'INDIVIDUAL',
        });
      }
    }

    return chartData;
  },

  async getDepartmentChart() {
    // Participants grouped by department
    const { data } = await supabase
      .from('participants')
      .select('department');

    const deptCounts = {};
    (data || []).forEach(p => {
      deptCounts[p.department] = (deptCounts[p.department] || 0) + 1;
    });

    return Object.entries(deptCounts).map(([department, count]) => ({
      department,
      participants: count
    }));
  }
};

module.exports = analyticsService;
