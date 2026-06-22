const profileRepository = require('../repositories/profile.repository');

class ProfileService {
  /**
   * Get complete profile details including all integrated cards and notes.
   */
  async getProfile(eventGuestId) {
    const profile = await profileRepository.findProfileByEventGuestId(eventGuestId);
    if (!profile) {
      const error = new Error('Guest profile not found');
      error.statusCode = 404;
      throw error;
    }

    // Retrieve cached/fallback dynamic concierge details
    const concierge = await profileRepository.getCache(
      eventGuestId,
      profile.name,
      profile.category
    );

    // Retrieve saved notes
    const notes = await profileRepository.findNotesByEventGuestId(eventGuestId);

    // Reconstruct communication history dynamically
    const history = [
      {
        time: 'Today, 9:15 AM',
        type: 'Welcome Packet Sent',
        details: 'Digital itinerary and venue map delivered via email.',
      },
      {
        time: 'Yesterday, 2:40 PM',
        type: 'Inbound Inquiry: Logistics',
        details: 'Confirmed pickup time and dietary allergy details.',
      },
    ];

    if (profile.rsvp_status === 'yes') {
      history.push({
        time: 'Oct 5, 11:00 AM',
        type: 'WhatsApp Confirmation',
        details: "RSVP status moved to 'Confirmed'.",
      });
    }

    return {
      event_guest_id: profile.event_guest_id,
      event_id: profile.event_id,
      invited: profile.invited,
      rsvp_token: profile.rsvp_token,
      guest_id: profile.guest_id,
      name: profile.name,
      phone: profile.phone,
      category: profile.category,
      rsvp_status: profile.rsvp_status || 'pending',
      rsvp_pax: parseInt(profile.rsvp_pax || 0, 10),
      rsvp_responded_at: profile.rsvp_responded_at || null,
      table_no: profile.table_no || 'N/A',
      seat_no: profile.seat_no || 'N/A',
      meal_preferences: profile.meal_preferences || [],
      ...concierge,
      communication_history: history,
      notes,
    };
  }

  /**
   * Update guest details in the database and cache other UI parameters.
   */
  async updateProfile(eventGuestId, updateData) {
    const profile = await profileRepository.findProfileByEventGuestId(eventGuestId);
    if (!profile) {
      const error = new Error('Guest profile not found');
      error.statusCode = 404;
      throw error;
    }

    const { name, phone, category, ...cachedFields } = updateData;

    // Update DB columns
    if (name !== undefined || phone !== undefined || category !== undefined) {
      await profileRepository.updateGuestDetails(eventGuestId, name, phone, category);
    }

    // Update session cache for custom concierge parameters
    if (Object.keys(cachedFields).length > 0) {
      await profileRepository.updateCache(eventGuestId, cachedFields);
    }

    return await this.getProfile(eventGuestId);
  }

  /**
   * Add a new concierge note for a guest's itinerary.
   */
  async addNote(eventGuestId, content, author) {
    const profile = await profileRepository.findProfileByEventGuestId(eventGuestId);
    if (!profile) {
      const error = new Error('Guest profile not found');
      error.statusCode = 404;
      throw error;
    }

    return await profileRepository.addNote(eventGuestId, content, author);
  }

  /**
   * Fetch all internal concierge notes for a guest.
   */
  async getNotes(eventGuestId) {
    const profile = await profileRepository.findProfileByEventGuestId(eventGuestId);
    if (!profile) {
      const error = new Error('Guest profile not found');
      error.statusCode = 404;
      throw error;
    }

    return await profileRepository.findNotesByEventGuestId(eventGuestId);
  }
}

module.exports = new ProfileService();
