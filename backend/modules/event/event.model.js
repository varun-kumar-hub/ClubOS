const supabase = require('../../config/database');

const eventModel = {
  async findAll(filters = {}) {
    let query = supabase.from('events').select('*', { count: 'exact' });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.eventType) query = query.eq('event_type', filters.eventType);

    query = query.order('date', { ascending: true });

    if (filters.from !== undefined && filters.to !== undefined) {
      query = query.range(filters.from, filters.to);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, eventData) {
    const { data, error } = await supabase
      .from('events')
      .update({ ...eventData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async getPublishedEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('status', ['PUBLISHED', 'REGISTRATION_OPEN'])
      .order('date', { ascending: true });
    if (error) throw error;
    return data;
  }
};

module.exports = eventModel;
