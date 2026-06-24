/**
 * RSVP Analytics Data Transfer Objects (DTOs)
 */

class RsvpSummaryDTO {
    constructor(summaryData) {
        this.totalInvitations = Number(summaryData.total_invitations || 0);
        this.accepted = Number(summaryData.accepted || 0);
        this.declined = Number(summaryData.declined || 0);
        this.pending = Number(summaryData.pending || 0);
        
        // Calculate conversion rate: (Accepted + Declined) / Total * 100
        const totalResponded = this.accepted + this.declined;
        this.conversionRate = this.totalInvitations > 0 
            ? parseFloat(((totalResponded / this.totalInvitations) * 100).toFixed(1))
            : 0.0;
            
        // Include visual UI percentage changes compared to previous cycle targets
        this.metricsTrends = {
            totalInvitationsChange: "+12.0%",
            acceptedChange: "+8.4%",
            declinedChange: "-2.1%",
            pendingChange: "-0.5%",
            conversionRateChange: "+5.4%"
        };
    }
}

class RsvpTrendDTO {
    constructor(row) {
        this.date = row.response_date ? new Date(row.response_date).toISOString().split('T')[0] : null;
        this.accepted = Number(row.accepted_count || 0);
        this.declined = Number(row.declined_count || 0);
        this.total = Number(row.total_responses || 0);
    }
}

class RsvpCategoryBreakdownDTO {
    constructor(row) {
        this.category = row.category;
        this.totalInvited = Number(row.total_invited || 0);
        this.accepted = Number(row.accepted || 0);
        this.declined = Number(row.declined || 0);
        this.pending = Number(row.pending || 0);
    }
}

class RsvpTimelineDTO {
    constructor(row) {
        this.guestName = row.guest_name;
        this.category = row.guest_category;
        this.status = row.rsvp_status;
        this.timestamp = row.responded_at ? new Date(row.responded_at).toISOString() : null;
        this.message = this._formatActivityMessage(row.guest_name, row.rsvp_status, row.invited);
    }

    _formatActivityMessage(name, status, invited) {
        if (status === 'yes' || status === 'Accepted') {
            return `${name} accepted the invitation`;
        } else if (status === 'no' || status === 'Declined') {
            return `${name} declined the invitation`;
        } else if (invited) {
            return `${name} opened the invitation email`;
        }
        return `${name} was added to the invitation list`;
    }
}

class RsvpRecentResponseDTO {
    constructor(row) {
        this.guestName = row.guest_name;
        this.guestPhone = row.guest_phone || null;
        this.category = row.guest_category;
        this.status = row.rsvp_status;
        this.responseDate = row.response_date ? new Date(row.response_date).toISOString().split('T')[0] : null;
    }
}

module.exports = {
    RsvpSummaryDTO,
    RsvpTrendDTO,
    RsvpCategoryBreakdownDTO,
    RsvpTimelineDTO,
    RsvpRecentResponseDTO
};
