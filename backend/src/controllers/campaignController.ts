import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { CampaignStatus, CampaignTargetType, CommunicationType, DeliveryStatus } from '@prisma/client';

// Helper to escape values for CSV output
const escapeCsv = (val: any): string => {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Existing RSVP campaign sender (kept for backward compatibility and test suites)
export const sendRsvpCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignType = 'RSVP_REMINDER' } = req.body;

    let targetCount = 0;
    let campaignName = '';

    if (campaignType === 'RSVP_REMINDER') {
      targetCount = await prisma.guest.count({
        where: { status: 'PENDING' },
      });
      campaignName = 'RSVP Pending Reminders Campaign';
    } else if (campaignType === 'ITINERARY') {
      targetCount = await prisma.guest.count({
        where: { status: 'CONFIRMED' },
      });
      campaignName = 'Confirmed Guests Digital Itineraries Campaign';
    } else {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid campaignType. Allowed types: RSVP_REMINDER, ITINERARY' },
      });
      return;
    }

    // Create a database campaign record to track this execution
    const campaign = await prisma.campaign.create({
      data: {
        title: campaignName,
        subject: `Reminder: ${campaignName}`,
        description: `Automated campaign broadcast for ${campaignType}`,
        channel: CommunicationType.EMAIL,
        targetType: campaignType === 'RSVP_REMINDER' ? CampaignTargetType.PENDING : CampaignTargetType.CONFIRMED,
        status: CampaignStatus.SENT,
        createdBy: 'system',
      }
    });

    // Populate simulated history for the recipients
    const targetGuests = await prisma.guest.findMany({
      where: { status: campaignType === 'RSVP_REMINDER' ? 'PENDING' : 'CONFIRMED' },
    });

    if (targetGuests.length > 0) {
      await prisma.communicationHistory.createMany({
        data: targetGuests.map((guest) => {
          const isFailed = Math.random() < 0.05; // 5% failure rate
          const sentAt = new Date();
          const openedAt = !isFailed && Math.random() < 0.6 ? new Date(sentAt.getTime() + Math.random() * 3600000) : null;
          const clickedAt = openedAt && Math.random() < 0.3 ? new Date(openedAt.getTime() + Math.random() * 1800000) : null;

          return {
            guestId: guest.id,
            campaignId: campaign.id,
            channel: CommunicationType.EMAIL,
            status: isFailed ? DeliveryStatus.FAILED : DeliveryStatus.SENT,
            sentAt,
            openedAt,
            clickedAt,
            failureReason: isFailed ? 'SMTP Connection Timeout' : null,
          };
        }),
      });
    }

    res.json({
      success: true,
      data: {
        campaignName,
        type: campaignType,
        recipientCount: targetCount,
        status: 'SENT',
        sentAt: new Date(),
        message: `Successfully broadcasted campaign to ${targetCount} recipients.`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 1. Dashboard Statistics
export const getCampaignStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalSentCount = await prisma.communicationHistory.count({
      where: { status: DeliveryStatus.SENT },
    });

    const totalFailedCount = await prisma.communicationHistory.count({
      where: { status: DeliveryStatus.FAILED },
    });

    const totalOpenedCount = await prisma.communicationHistory.count({
      where: { openedAt: { not: null } },
    });

    const totalHistory = totalSentCount + totalFailedCount;
    const deliverability = totalHistory > 0 ? (totalSentCount / totalHistory) * 100 : 98.4; // Fallback to design mockup if empty
    const avgOpenRate = totalSentCount > 0 ? (totalOpenedCount / totalSentCount) * 100 : 42.8; // Fallback to design mockup if empty

    const activeCampaignCount = await prisma.campaign.count({
      where: { status: { in: [CampaignStatus.SENDING, CampaignStatus.SCHEDULED] } },
    });

    const draftCount = await prisma.campaign.count({
      where: { status: CampaignStatus.DRAFT },
    });

    const scheduledCount = await prisma.campaign.count({
      where: { status: CampaignStatus.SCHEDULED },
    });

    const sentCount = await prisma.campaign.count({
      where: { status: CampaignStatus.SENT },
    });

    res.json({
      success: true,
      data: {
        deliverabilityRate: parseFloat(deliverability.toFixed(1)),
        avgOpenRate: parseFloat(avgOpenRate.toFixed(1)),
        activeCampaigns: activeCampaignCount,
        drafts: draftCount,
        scheduled: scheduledCount,
        sent: sentCount,
        growth: '+2.1% from last month',
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Campaign CRUD
export const getCampaigns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, channel, event: eventId, startDate, endDate, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status as CampaignStatus;
    }

    if (channel && typeof channel === 'string' && channel !== 'ALL') {
      where.channel = channel as CommunicationType;
    }

    if (eventId && typeof eventId === 'string' && eventId !== 'ALL') {
      where.eventId = eventId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          event: true,
          _count: {
            select: { communications: true },
          },
        },
        orderBy: { [sortBy as string]: sortOrder },
        skip,
        take: limitNum,
      }),
      prisma.campaign.count({ where }),
    ]);

    // Format metrics dynamically for each campaign based on its communications
    const formattedCampaigns = await Promise.all(
      campaigns.map(async (c) => {
        const comms = await prisma.communicationHistory.findMany({
          where: { campaignId: c.id },
        });

        const totalComms = comms.length;
        const delivered = comms.filter((h) => h.status === DeliveryStatus.SENT).length;
        const opened = comms.filter((h) => h.openedAt !== null).length;
        const clicked = comms.filter((h) => h.clickedAt !== null).length;

        const openRate = delivered > 0 ? Math.round((opened / delivered) * 100) : 0;
        const clickRate = delivered > 0 ? Math.round((clicked / delivered) * 100) : 0;

        return {
          id: c.id,
          title: c.title,
          subject: c.subject,
          description: c.description,
          channel: c.channel,
          targetType: c.targetType,
          targetId: c.targetId,
          eventId: c.eventId,
          event: c.event,
          scheduledAt: c.scheduledAt,
          status: c.status,
          createdBy: c.createdBy,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          metrics: {
            totalSent: totalComms,
            openRate: totalComms > 0 ? `${openRate}%` : 'N/A',
            clickRate: totalComms > 0 ? `${clickRate}%` : 'N/A',
          },
        };
      })
    );

    res.json({
      success: true,
      data: formattedCampaigns,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!campaign) {
      res.status(404).json({ success: false, error: { message: 'Campaign not found' } });
      return;
    }

    const comms = await prisma.communicationHistory.findMany({
      where: { campaignId: campaign.id },
    });

    const totalComms = comms.length;
    const delivered = comms.filter((h) => h.status === DeliveryStatus.SENT).length;
    const opened = comms.filter((h) => h.openedAt !== null).length;
    const clicked = comms.filter((h) => h.clickedAt !== null).length;
    const failed = comms.filter((h) => h.status === DeliveryStatus.FAILED).length;

    const deliveryRate = totalComms > 0 ? (delivered / totalComms) * 100 : 100;
    const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
    const clickRate = delivered > 0 ? (clicked / delivered) * 100 : 0;

    res.json({
      success: true,
      data: {
        ...campaign,
        metrics: {
          totalSent: totalComms,
          delivered,
          failed,
          opened,
          clicked,
          deliveryRate: parseFloat(deliveryRate.toFixed(1)),
          openRate: parseFloat(openRate.toFixed(1)),
          clickRate: parseFloat(clickRate.toFixed(1)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Simulation helper to generate communications when a campaign is sent
const dispatchSimulatedCampaign = async (campaignId: string, channel: CommunicationType, targetType: CampaignTargetType, targetId: string | null) => {
  let targetGuests: any[] = [];

  if (targetType === CampaignTargetType.ALL_GUESTS) {
    targetGuests = await prisma.guest.findMany();
  } else if (targetType === CampaignTargetType.VIP) {
    targetGuests = await prisma.guest.findMany({ where: { isVip: true } });
  } else if (targetType === CampaignTargetType.SPEAKERS) {
    targetGuests = await prisma.guest.findMany({ where: { isSpeaker: true } });
  } else if (targetType === CampaignTargetType.CONFIRMED) {
    targetGuests = await prisma.guest.findMany({ where: { status: 'CONFIRMED' } });
  } else if (targetType === CampaignTargetType.PENDING) {
    targetGuests = await prisma.guest.findMany({ where: { status: 'PENDING' } });
  } else if (targetType === CampaignTargetType.GUEST_GROUP && targetId) {
    targetGuests = await prisma.guest.findMany({ where: { groupId: targetId } });
  }

  if (targetGuests.length > 0) {
    const now = new Date();
    const data = targetGuests.map((guest) => {
      const isFailed = Math.random() < 0.03; // 3% failure
      const openedAt = !isFailed && Math.random() < 0.5 ? new Date(now.getTime() + Math.random() * 3600000) : null;
      const clickedAt = openedAt && Math.random() < 0.25 ? new Date(openedAt.getTime() + Math.random() * 1800000) : null;

      return {
        guestId: guest.id,
        campaignId,
        channel,
        status: isFailed ? DeliveryStatus.FAILED : DeliveryStatus.SENT,
        sentAt: now,
        openedAt,
        clickedAt,
        failureReason: isFailed ? 'Delivery failure: Provider rejected message' : null,
      };
    });

    await prisma.communicationHistory.createMany({ data });
  }
};

export const createCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, subject, description, channel, targetType, targetId, eventId, scheduledAt, status, createdBy } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        title,
        subject,
        description,
        channel,
        targetType,
        targetId,
        eventId,
        scheduledAt,
        status,
        createdBy: createdBy || 'system',
      },
    });

    if (status === CampaignStatus.SENT || status === CampaignStatus.SENDING) {
      await dispatchSimulatedCampaign(campaign.id, channel, targetType, targetId);
    }

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, subject, description, channel, targetType, targetId, eventId, scheduledAt, status } = req.body;

    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: { message: 'Campaign not found' } });
      return;
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        title,
        subject,
        description,
        channel,
        targetType,
        targetId,
        eventId,
        scheduledAt,
        status,
      },
    });

    // If campaign is newly marked as sent, dispatch messages
    if (
      (status === CampaignStatus.SENT || status === CampaignStatus.SENDING) &&
      existing.status !== CampaignStatus.SENT &&
      existing.status !== CampaignStatus.SENDING
    ) {
      await dispatchSimulatedCampaign(
        campaign.id,
        channel || existing.channel,
        targetType || existing.targetType,
        targetId !== undefined ? targetId : existing.targetId
      );
    }

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      res.status(404).json({ success: false, error: { message: 'Campaign not found' } });
      return;
    }

    await prisma.campaign.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 3. Campaign Analytics
export const getCampaignAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comms = await prisma.communicationHistory.findMany();

    const total = comms.length;
    const delivered = comms.filter((h) => h.status === DeliveryStatus.SENT).length;
    const failed = comms.filter((h) => h.status === DeliveryStatus.FAILED).length;
    const opened = comms.filter((h) => h.openedAt !== null).length;
    const clicked = comms.filter((h) => h.clickedAt !== null).length;

    // Delivery rate
    const deliveryRate = total > 0 ? (delivered / total) * 100 : 98.4;
    // Open rate
    const openRate = delivered > 0 ? (opened / delivered) * 100 : 42.8;
    // Click rate
    const clickRate = delivered > 0 ? (clicked / delivered) * 100 : 12.5;
    // Bounce rate
    const bounceRate = total > 0 ? (failed / total) * 100 : 0.8;
    // Interactive rate
    const interactiveRate = delivered > 0 ? ((opened + clicked) / delivered) * 100 : 28.4;

    // Average Response Time calculation (difference between openedAt and sentAt)
    let avgResponseTimeMins = 4.2; // Fallback mock value
    const responseTimes = comms
      .filter((h) => h.openedAt !== null)
      .map((h) => (h.openedAt!.getTime() - h.sentAt.getTime()) / 60000); // Diff in minutes

    if (responseTimes.length > 0) {
      avgResponseTimeMins = responseTimes.reduce((sum, val) => sum + val, 0) / responseTimes.length;
    }

    res.json({
      success: true,
      data: {
        deliveryRate: parseFloat(deliveryRate.toFixed(1)),
        openRate: parseFloat(openRate.toFixed(1)),
        clickRate: parseFloat(clickRate.toFixed(1)),
        bounceRate: parseFloat(bounceRate.toFixed(1)),
        interactiveRate: parseFloat(interactiveRate.toFixed(1)),
        optOutRate: 0.12, // Standard opt-out rate
        totalDelivered: delivered,
        totalFailed: failed,
        totalOpened: opened,
        totalClicked: clicked,
        averageResponseTime: `${avgResponseTimeMins.toFixed(1)}m`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Audience Segments (derived from Guest Groups, VIP, RSVP, etc.)
export const getAudienceSegments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. VIP segment
    const vipCount = await prisma.guest.count({ where: { isVip: true } });
    const vipSegment = {
      id: 'segment-vip',
      name: 'VIP Attendees',
      description: 'Guests marked with premium VIP status.',
      memberCount: vipCount,
      targetType: CampaignTargetType.VIP,
      targetId: null,
    };

    // 2. Speakers segment
    const speakerCount = await prisma.guest.count({ where: { isSpeaker: true } });
    const speakerSegment = {
      id: 'segment-speakers',
      name: 'Speakers',
      description: 'Event presenters and keynote speakers.',
      memberCount: speakerCount,
      targetType: CampaignTargetType.SPEAKERS,
      targetId: null,
    };

    // 3. Confirmed segment
    const confirmedCount = await prisma.guest.count({ where: { status: 'CONFIRMED' } });
    const confirmedSegment = {
      id: 'segment-confirmed',
      name: 'Registered Guests',
      description: 'Attendees who have confirmed RSVP.',
      memberCount: confirmedCount,
      targetType: CampaignTargetType.CONFIRMED,
      targetId: null,
    };

    // 4. Pending segment
    const pendingCount = await prisma.guest.count({ where: { status: 'PENDING' } });
    const pendingSegment = {
      id: 'segment-pending',
      name: 'Pending RSVPs',
      description: 'Guests invited who have not yet responded.',
      memberCount: pendingCount,
      targetType: CampaignTargetType.PENDING,
      targetId: null,
    };

    // 5. Early Birds segment (confirmed guests that are primary guests, or just some subset)
    const earlyBirdCount = await prisma.guest.count({ where: { status: 'CONFIRMED', isPrimaryGuest: true } });
    const earlyBirdSegment = {
      id: 'segment-earlybirds',
      name: 'Early Birds',
      description: 'First registered attendees.',
      memberCount: earlyBirdCount,
      targetType: CampaignTargetType.ALL_GUESTS, // map to fallback target
      targetId: null,
    };

    // 6. DB Guest Groups mapped directly as Segments
    const dbGroups = await prisma.guestGroup.findMany({
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    const groupSegments = dbGroups.map((g) => ({
      id: g.id,
      name: g.name,
      description: `Category: ${g.category}. Status: ${g.status}`,
      memberCount: g._count.members,
      targetType: CampaignTargetType.GUEST_GROUP,
      targetId: g.id,
    }));

    const allSegments = [
      vipSegment,
      speakerSegment,
      confirmedSegment,
      pendingSegment,
      earlyBirdSegment,
      ...groupSegments,
    ];

    res.json({
      success: true,
      data: allSegments,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Campaign Calendar
export const getCampaignCalendar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { scheduledAt: { not: null } },
      include: { event: true },
      orderBy: { scheduledAt: 'asc' },
    });

    const calendarGroup: Record<string, any[]> = {};

    campaigns.forEach((c) => {
      const dateKey = c.scheduledAt!.toISOString().split('T')[0];
      if (!calendarGroup[dateKey]) {
        calendarGroup[dateKey] = [];
      }
      calendarGroup[dateKey].push({
        id: c.id,
        title: c.title,
        channel: c.channel,
        status: c.status,
        time: c.scheduledAt!.toISOString().split('T')[1].substring(0, 5),
        event: c.event?.title || 'Unknown Event',
      });
    });

    res.json({
      success: true,
      data: calendarGroup,
    });
  } catch (error) {
    next(error);
  }
};

// 6. Communication History
export const getCommunicationHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, channel, status } = req.query;

    const where: any = {};
    if (channel && typeof channel === 'string' && channel !== 'ALL') {
      where.channel = channel as CommunicationType;
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status as DeliveryStatus;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [history, total] = await Promise.all([
      prisma.communicationHistory.findMany({
        where,
        include: {
          guest: true,
          campaign: true,
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.communicationHistory.count({ where }),
    ]);

    const formatted = history.map((h) => ({
      id: h.id,
      guest: {
        id: h.guest.id,
        name: h.guest.name,
        email: h.guest.email,
        phone: h.guest.phone,
      },
      campaign: h.campaign ? {
        id: h.campaign.id,
        title: h.campaign.title,
      } : null,
      channel: h.channel,
      deliveryStatus: h.status,
      sentAt: h.sentAt,
      openedAt: h.openedAt,
      clickedAt: h.clickedAt,
      failureReason: h.failureReason,
    }));

    res.json({
      success: true,
      data: formatted,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 7. Channel Orchestration
export const getChannelOrchestration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comms = await prisma.communicationHistory.findMany();

    const getStatsForChannel = (ch: CommunicationType) => {
      const channelComms = comms.filter((c) => c.channel === ch);
      const total = channelComms.length;
      const delivered = channelComms.filter((c) => c.status === DeliveryStatus.SENT).length;
      const failed = channelComms.filter((c) => c.status === DeliveryStatus.FAILED).length;
      const opened = channelComms.filter((c) => c.openedAt !== null).length;
      const clicked = channelComms.filter((c) => c.clickedAt !== null).length;

      const deliveryRate = total > 0 ? (delivered / total) * 100 : 99.2;
      const bounceRate = total > 0 ? (failed / total) * 100 : 0.4;
      const interactiveRate = delivered > 0 ? ((opened + clicked) / delivered) * 100 : 28.4;

      const responseTimes = channelComms
        .filter((c) => c.openedAt !== null)
        .map((c) => (c.openedAt!.getTime() - c.sentAt.getTime()) / 60000);
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, val) => sum + val, 0) / responseTimes.length
        : 4.2;

      return {
        deliveryRate: parseFloat(deliveryRate.toFixed(1)),
        bounceRate: parseFloat(bounceRate.toFixed(1)),
        interactiveRate: parseFloat(interactiveRate.toFixed(1)),
        avgResponseTime: `${avgResponseTime.toFixed(1)}m`,
        optOutRate: 0.12,
      };
    };

    res.json({
      success: true,
      data: {
        email: getStatsForChannel(CommunicationType.EMAIL),
        whatsapp: getStatsForChannel(CommunicationType.WHATSAPP),
        sms: getStatsForChannel(CommunicationType.SMS),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 10. Export campaigns as CSV
export const exportCampaigns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, channel, event: eventId } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status as CampaignStatus;
    }

    if (channel && typeof channel === 'string' && channel !== 'ALL') {
      where.channel = channel as CommunicationType;
    }

    if (eventId && typeof eventId === 'string' && eventId !== 'ALL') {
      where.eventId = eventId;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'ID', 'Title', 'Subject', 'Description', 'Channel', 
      'Target Type', 'Target ID', 'Event Title', 'Scheduled At', 
      'Status', 'Created By', 'Created At'
    ];

    const rows = campaigns.map((c) => [
      c.id,
      c.title,
      c.subject || 'N/A',
      c.description || 'N/A',
      c.channel,
      c.targetType,
      c.targetId || 'N/A',
      c.event?.title || 'N/A',
      c.scheduledAt ? c.scheduledAt.toISOString() : 'N/A',
      c.status,
      c.createdBy,
      c.createdAt.toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="communication_campaigns_export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
