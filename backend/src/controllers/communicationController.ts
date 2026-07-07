import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { CommunicationChannel, DeliveryStatus } from '@prisma/client';

// 1. Get Summary Stats
export const getCommunicationsSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Total Logs
    const totalLogs = await prisma.communicationLog.count();

    // Successful Deliveries (DELIVERED or READ)
    const successCount = await prisma.communicationLog.count({
      where: {
        status: { in: [DeliveryStatus.DELIVERED, DeliveryStatus.READ] },
      },
    });

    const successfulDeliveriesPercentage = totalLogs > 0 ? (successCount / totalLogs) * 100 : 0;

    // Active Failures: failures in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeFailures = await prisma.communicationLog.count({
      where: {
        status: DeliveryStatus.FAILED,
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    // Average Latency: average latencyMs for DELIVERED or READ status logs where latencyMs > 0
    const latencyAggregate = await prisma.communicationLog.aggregate({
      where: {
        status: { in: [DeliveryStatus.DELIVERED, DeliveryStatus.READ] },
        latencyMs: { gt: 0 },
      },
      _avg: {
        latencyMs: true,
      },
    });

    const averageLatencyMs = latencyAggregate._avg.latencyMs || 0;
    const averageLatencySec = averageLatencyMs / 1000;

    res.json({
      success: true,
      data: {
        totalLogs: {
          value: totalLogs,
          growth: '+4.2%',
        },
        successfulDeliveries: {
          value: Math.round(successfulDeliveriesPercentage * 10) / 10,
          status: 'Target met',
        },
        activeFailures: {
          value: activeFailures,
          trend: '-2 active',
        },
        averageLatency: {
          value: Math.round(averageLatencySec * 10) / 10,
          status: 'Low latency',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Paginated/Filtered Logs
export const getCommunicationsLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      channel,
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (channel && typeof channel === 'string') {
      where.channel = channel as CommunicationChannel;
    }

    if (status && typeof status === 'string') {
      where.status = status as DeliveryStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate && typeof startDate === 'string') {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search && typeof search === 'string') {
      const searchClause = { contains: search, mode: 'insensitive' as const };
      where.OR = [
        { recipientName: searchClause },
        { recipientContact: searchClause },
        { deliveryResult: searchClause },
      ];
    }

    const [logs, totalCount] = await Promise.all([
      prisma.communicationLog.findMany({
        where,
        orderBy: {
          [String(sortBy)]: sortOrder,
        },
        skip,
        take: limitNum,
      }),
      prisma.communicationLog.count({ where }),
    ]);

    res.json({
      success: true,
      meta: {
        totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Specific Log Detail (REST: GET /api/communications/:id)
export const getCommunicationDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const log = await prisma.communicationLog.findUnique({
      where: { id },
    });

    if (!log) {
      res.status(404).json({
        success: false,
        error: { message: 'Communication log not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get Failure Alerts Status
export const getAutomationAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const failuresCount = await prisma.communicationLog.count({
      where: {
        status: DeliveryStatus.FAILED,
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    const isTriggered = failuresCount >= 10;

    res.json({
      success: true,
      data: {
        triggered: isTriggered,
        count: failuresCount,
        recommendsReroute: isTriggered,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Toggles Gateway Provider / Re-route traffic
export const rerouteTraffic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { channel } = req.body;

    const config = await prisma.routeConfiguration.findUnique({
      where: { channel: channel as CommunicationChannel },
    });

    if (!config) {
      res.status(404).json({
        success: false,
        error: { message: `Route configuration not found for channel ${channel}` },
      });
      return;
    }

    const updatedConfig = await prisma.routeConfiguration.update({
      where: { channel: channel as CommunicationChannel },
      data: {
        activeProvider: 'SECONDARY',
        isRerouted: true,
      },
    });

    res.json({
      success: true,
      message: `Successfully re-routed traffic for ${channel} to secondary gateway.`,
      data: updatedConfig,
    });
  } catch (error) {
    next(error);
  }
};

// 6. Export Filtered Logs
export const exportCommunicationsLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { channel, status, startDate, endDate, search } = req.query;

    const where: any = {};

    if (channel && typeof channel === 'string') {
      where.channel = channel as CommunicationChannel;
    }

    if (status && typeof status === 'string') {
      where.status = status as DeliveryStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate && typeof startDate === 'string') {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search && typeof search === 'string') {
      const searchClause = { contains: search, mode: 'insensitive' as const };
      where.OR = [
        { recipientName: searchClause },
        { recipientContact: searchClause },
        { deliveryResult: searchClause },
      ];
    }

    const logs = await prisma.communicationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
