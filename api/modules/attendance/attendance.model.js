const supabase = require('../../config/database');

const attendanceModel = {
  async findByEventId(eventId) {
    const { data, error } = await supabase
      .from('attendance')
      .select('participant_id, event_id, status, marked_at')
      .eq('event_id', eventId);
    if (error) throw error;
    return data;
  },

  async upsert(attendanceData) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendanceData, { onConflict: 'participant_id,event_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async bulkUpsert(records) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'participant_id,event_id' })
      .select();
    if (error) throw error;
    return data;
  },

  async getStats(eventId) {
    const { count: totalRegistered, error: e1 } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);
    if (e1) throw e1;

    const { count: totalPresent, error: e2 } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'PRESENT');
    if (e2) throw e2;

    return {
      totalRegistered: totalRegistered || 0,
      totalPresent: totalPresent || 0,
      attendanceRate: totalRegistered > 0
        ? Math.round((totalPresent / totalRegistered) * 100)
        : 0
    };
  }
};

module.exports = attendanceModel;
