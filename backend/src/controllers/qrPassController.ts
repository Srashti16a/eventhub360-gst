import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { QRPassType, QRPassStatus, ScanStatus, CommunicationType } from '@prisma/client';
import { randomUUID } from 'crypto';

// Helper to escape values for CSV output
const escapeCsv = (val: any): string => {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Helper to generate a unique pass number
const generateUniquePassNumber = async (): Promise<string> => {
  while (true) {
    const passNum = `PASS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const existing = await prisma.qRPass.findUnique({ where: { passNumber: passNum } });
    if (!existing) return passNum;
  }
};

// 1. Dashboard Stats
export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalPassesGenerated = await prisma.qRPass.count();
    const scannedPasses = await prisma.qRPass.count({ where: { status: QRPassStatus.SCANNED } });
    const activePasses = await prisma.qRPass.count({ where: { status: QRPassStatus.ACTIVE } });

    // Pending Delivery Count: Passes that have no successful delivery logs
    const pendingDeliveryCount = await prisma.qRPass.count({
      where: {
        deliveryLogs: {
          none: { status: 'SENT' },
        },
      },
    });

    const totalScans = await prisma.scanHistory.count();
    const successScans = await prisma.scanHistory.count({ where: { scanStatus: ScanStatus.SUCCESS } });
    const securityHealthRate = totalScans > 0 ? (successScans / totalScans) * 100 : 100;

    res.json({
      success: true,
      data: {
        totalPassesGenerated,
        scannedPasses,
        activePasses,
        pendingDeliveryCount,
        securityHealthRate: parseFloat(securityHealthRate.toFixed(1)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. QR Pass Registry
export const getPasses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, passType, status, eventId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { passNumber: { contains: search, mode: 'insensitive' } },
        { qrCode: { contains: search, mode: 'insensitive' } },
        {
          guest: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (passType && typeof passType === 'string' && passType !== 'ALL') {
      where.passType = passType as QRPassType;
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status as QRPassStatus;
    }

    if (eventId && typeof eventId === 'string' && eventId !== 'ALL') {
      where.eventId = eventId;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [passes, total] = await Promise.all([
      prisma.qRPass.findMany({
        where,
        include: {
          guest: {
            select: { id: true, name: true, avatar: true, email: true },
          },
        },
        orderBy: { [sortBy as string]: sortOrder },
        skip,
        take: limitNum,
      }),
      prisma.qRPass.count({ where }),
    ]);

    const formatted = passes.map((p) => ({
      id: p.id,
      guestName: p.guest.name,
      avatar: p.guest.avatar,
      passType: p.passType,
      status: p.status,
      expiresAt: p.expiresAt,
      passNumber: p.passNumber,
      qrCode: p.qrCode,
      lastScannedAt: p.lastScannedAt,
      downloadCount: p.downloadCount,
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

// 3. QR Pass Details
export const getPassById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const pass = await prisma.qRPass.findUnique({
      where: { id },
      include: {
        guest: true,
        event: true,
        scanHistory: {
          orderBy: { scanTime: 'desc' },
          take: 5,
        },
        deliveryLogs: {
          orderBy: { sentAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!pass) {
      res.status(404).json({ success: false, error: { message: 'QR Pass not found' } });
      return;
    }

    // Determine security status
    let securityStatus = 'VALID';
    if (pass.status === QRPassStatus.REVOKED) {
      securityStatus = 'REVOKED';
    } else if (pass.status === QRPassStatus.EXPIRED || (pass.expiresAt && pass.expiresAt < new Date())) {
      securityStatus = 'EXPIRED';
    }

    res.json({
      success: true,
      data: {
        id: pass.id,
        guestDetails: {
          id: pass.guest.id,
          name: pass.guest.name,
          avatar: pass.guest.avatar,
          email: pass.guest.email,
          phone: pass.guest.phone,
        },
        eventDetails: {
          id: pass.event.id,
          title: pass.event.title,
          category: pass.event.category,
          date: pass.event.date,
        },
        qrCode: pass.qrCode,
        passType: pass.passType,
        status: pass.status,
        expiresAt: pass.expiresAt,
        downloadCount: pass.downloadCount,
        deliveryLogs: pass.deliveryLogs,
        scanHistory: pass.scanHistory,
        securityStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Create Pass
export const createPass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guestId, eventId, passType, expiresAt, createdBy } = req.body;

    // Prevent duplicate pass for same guest and event
    const existing = await prisma.qRPass.findUnique({
      where: {
        guestId_eventId: { guestId, eventId },
      },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        error: { message: 'A QR Pass already exists for this guest and event combination' },
      });
      return;
    }

    const qrCode = randomUUID();
    const passNumber = await generateUniquePassNumber();

    const pass = await prisma.qRPass.create({
      data: {
        guestId,
        eventId,
        passType,
        status: QRPassStatus.ACTIVE,
        qrCode,
        passNumber,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: createdBy || 'system',
      },
    });

    res.status(201).json({
      success: true,
      data: pass,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Update Pass
export const updatePass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { passType, status, expiresAt } = req.body;

    const pass = await prisma.qRPass.update({
      where: { id },
      data: {
        passType,
        status,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
      },
    });

    res.json({
      success: true,
      data: pass,
    });
  } catch (error) {
    next(error);
  }
};

// 6. Delete Pass
export const deletePass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.qRPass.delete({ where: { id } });
    res.json({
      success: true,
      message: 'QR Pass deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 7. Generate Batch
export const generateBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, target, targetId, guestIds, passType } = req.body;

    let targetGuests: any[] = [];

    if (target === 'EVENT') {
      targetGuests = await prisma.guest.findMany({ where: { eventId } });
    } else if (target === 'GROUP' && targetId) {
      targetGuests = await prisma.guest.findMany({ where: { eventId, groupId: targetId } });
    } else if (target === 'VIP') {
      targetGuests = await prisma.guest.findMany({ where: { eventId, isVip: true } });
    } else if (target === 'SPEAKERS') {
      targetGuests = await prisma.guest.findMany({ where: { eventId, isSpeaker: true } });
    } else if (target === 'STAFF') {
      targetGuests = await prisma.guest.findMany({ where: { eventId, OR: [{ isBridalParty: true }, { isPrimaryGuest: true }] } });
    } else if (target === 'SELECTED_GUESTS' && guestIds) {
      targetGuests = await prisma.guest.findMany({ where: { eventId, id: { in: guestIds } } });
    }

    let generatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const guest of targetGuests) {
      try {
        const existing = await prisma.qRPass.findUnique({
          where: {
            guestId_eventId: { guestId: guest.id, eventId },
          },
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        // Auto resolve passType
        let resolvedType = passType as QRPassType;
        if (!resolvedType) {
          if (guest.isVip) {
            resolvedType = QRPassType.VIP;
          } else if (guest.isSpeaker) {
            resolvedType = QRPassType.SPEAKER;
          } else if (guest.isBridalParty) {
            resolvedType = QRPassType.STAFF;
          } else {
            resolvedType = QRPassType.ATTENDEE;
          }
        }

        const qrCode = randomUUID();
        const passNumber = await generateUniquePassNumber();

        await prisma.qRPass.create({
          data: {
            guestId: guest.id,
            eventId,
            passType: resolvedType,
            status: QRPassStatus.ACTIVE,
            qrCode,
            passNumber,
          },
        });

        generatedCount++;
      } catch (err: any) {
        errors.push(`Guest ${guest.name}: ${err.message || 'Unknown error'}`);
      }
    }

    res.json({
      success: true,
      data: {
        generatedCount,
        skippedCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 8. Bulk Actions
export const bulkActions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, qrPassIds, channel } = req.body;

    if (action === 'DELETE') {
      await prisma.qRPass.deleteMany({
        where: { id: { in: qrPassIds } },
      });
      res.json({ success: true, message: `Successfully deleted ${qrPassIds.length} passes` });
      return;
    }

    if (action === 'ACTIVATE') {
      await prisma.qRPass.updateMany({
        where: { id: { in: qrPassIds } },
        data: { status: QRPassStatus.ACTIVE },
      });
    } else if (action === 'REVOKE') {
      await prisma.qRPass.updateMany({
        where: { id: { in: qrPassIds } },
        data: { status: QRPassStatus.REVOKED },
      });
    } else if (action === 'EXPIRE') {
      await prisma.qRPass.updateMany({
        where: { id: { in: qrPassIds } },
        data: { status: QRPassStatus.EXPIRED },
      });
    } else if (action === 'RESEND' && channel) {
      const commType = channel as CommunicationType;
      // Resend: simulate dispatch and write delivery log
      const passes = await prisma.qRPass.findMany({ where: { id: { in: qrPassIds } } });
      const logs = passes.map((p) => ({
        qrPassId: p.id,
        channel: commType,
        status: 'SENT',
      }));
      await prisma.passDeliveryLog.createMany({ data: logs });
    }

    res.json({
      success: true,
      message: `Bulk action ${action} completed successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// 9. Export passes CSV
export const exportPasses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, passType, status, eventId } = req.query;

    const where: any = {};
    if (search && typeof search === 'string') {
      where.OR = [
        { passNumber: { contains: search, mode: 'insensitive' } },
        { guest: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (passType && typeof passType === 'string' && passType !== 'ALL') {
      where.passType = passType as QRPassType;
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status as QRPassStatus;
    }
    if (eventId && typeof eventId === 'string' && eventId !== 'ALL') {
      where.eventId = eventId;
    }

    const passes = await prisma.qRPass.findMany({
      where,
      include: { guest: true, event: true },
    });

    const headers = [
      'ID', 'Guest Name', 'Guest Email', 'Event Title', 'Pass Type', 
      'Status', 'Pass Number', 'QR Code Token', 'Expires At', 'Last Scanned At', 
      'Download Count', 'Created At'
    ];

    const rows = passes.map((p) => [
      p.id,
      p.guest.name,
      p.guest.email,
      p.event.title,
      p.passType,
      p.status,
      p.passNumber,
      p.qrCode,
      p.expiresAt ? p.expiresAt.toISOString() : 'N/A',
      p.lastScannedAt ? p.lastScannedAt.toISOString() : 'N/A',
      p.downloadCount,
      p.createdAt.toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="qr_passes_export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// 10. Download pass (increments download count)
export const downloadPass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const pass = await prisma.qRPass.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
      },
    });

    res.json({
      success: true,
      data: {
        passNumber: pass.passNumber,
        qrToken: pass.qrCode,
        downloadCount: pass.downloadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 11. Send Pass
export const sendPass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { channel } = req.body;

    const pass = await prisma.qRPass.findUnique({ where: { id } });
    if (!pass) {
      res.status(404).json({ success: false, error: { message: 'QR Pass not found' } });
      return;
    }

    const isSuccess = Math.random() < 0.95; // 95% success rate

    const log = await prisma.passDeliveryLog.create({
      data: {
        qrPassId: pass.id,
        channel: channel as CommunicationType,
        status: isSuccess ? 'SENT' : 'FAILED',
        failureReason: isSuccess ? null : 'Failed to establish message broker channel',
      },
    });

    res.json({
      success: isSuccess,
      message: isSuccess ? 'Pass sent successfully' : 'Failed to send pass',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// 12. QR Verification
export const verifyPass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { qrToken, scanLocation, scannerName, deviceId, notes } = req.body;

    const pass = await prisma.qRPass.findUnique({
      where: { qrCode: qrToken },
      include: { guest: true },
    });

    if (!pass) {
      // Invalid QR Token attempt
      res.status(404).json({
        success: false,
        message: 'Invalid scan: QR Pass does not exist',
      });
      return;
    }

    // 1. Revoked passes
    if (pass.status === QRPassStatus.REVOKED) {
      await prisma.scanHistory.create({
        data: {
          qrPassId: pass.id,
          scanLocation,
          scannerName,
          deviceId,
          scanStatus: ScanStatus.FAILED_REVOKED,
          notes: notes || 'Attempted scan on revoked pass',
        },
      });

      res.status(400).json({
        success: false,
        message: 'Scan rejected: QR Pass has been revoked',
      });
      return;
    }

    // 2. Expired passes
    const isExpired = pass.status === QRPassStatus.EXPIRED || (pass.expiresAt && pass.expiresAt < new Date());
    if (isExpired) {
      if (pass.status !== QRPassStatus.EXPIRED) {
        await prisma.qRPass.update({ where: { id: pass.id }, data: { status: QRPassStatus.EXPIRED } });
      }

      await prisma.scanHistory.create({
        data: {
          qrPassId: pass.id,
          scanLocation,
          scannerName,
          deviceId,
          scanStatus: ScanStatus.FAILED_EXPIRED,
          notes: notes || 'Attempted scan on expired pass',
        },
      });

      res.status(400).json({
        success: false,
        message: 'Scan rejected: QR Pass has expired',
      });
      return;
    }

    // 3. Duplicate passes (already scanned)
    if (pass.status === QRPassStatus.SCANNED) {
      await prisma.scanHistory.create({
        data: {
          qrPassId: pass.id,
          scanLocation,
          scannerName,
          deviceId,
          scanStatus: ScanStatus.FAILED_DUPLICATE,
          notes: notes || 'Attempted duplicate entry scan',
        },
      });

      res.status(400).json({
        success: false,
        message: 'Scan rejected: QR Pass was already checked-in (Duplicate entry attempt)',
      });
      return;
    }

    // 4. Successful pass scan
    const updatedPass = await prisma.qRPass.update({
      where: { id: pass.id },
      data: {
        status: QRPassStatus.SCANNED,
        lastScannedAt: new Date(),
      },
    });

    await prisma.scanHistory.create({
      data: {
        qrPassId: pass.id,
        scanLocation,
        scannerName,
        deviceId,
        scanStatus: ScanStatus.SUCCESS,
        notes,
      },
    });

    res.json({
      success: true,
      message: 'Access granted successfully',
      data: {
        guest: pass.guest,
        pass: updatedPass,
        securityValidation: 'VALID_ACCESS',
      },
    });
  } catch (error) {
    next(error);
  }
};

// 13. Recent Scans
export const getRecentScans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scans = await prisma.scanHistory.findMany({
      include: {
        qrPass: {
          include: { guest: true },
        },
      },
      orderBy: { scanTime: 'desc' },
      take: 15,
    });

    const formatted = scans.map((s) => ({
      id: s.id,
      guestName: s.qrPass.guest.name,
      avatar: s.qrPass.guest.avatar,
      passNumber: s.qrPass.passNumber,
      scanLocation: s.scanLocation || 'N/A',
      scanTime: s.scanTime,
      scanStatus: s.scanStatus,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// 14. Security Health Status
export const getSecurityHealth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validPasses = await prisma.qRPass.count({
      where: { status: { in: [QRPassStatus.ACTIVE, QRPassStatus.SCANNED] } },
    });
    const expiredPasses = await prisma.qRPass.count({ where: { status: QRPassStatus.EXPIRED } });
    const revokedPasses = await prisma.qRPass.count({ where: { status: QRPassStatus.REVOKED } });

    const duplicateAttempts = await prisma.scanHistory.count({
      where: { scanStatus: ScanStatus.FAILED_DUPLICATE },
    });
    const invalidScans = await prisma.scanHistory.count({
      where: { scanStatus: ScanStatus.FAILED_INVALID },
    });

    const totalScans = await prisma.scanHistory.count();
    const successScans = await prisma.scanHistory.count({ where: { scanStatus: ScanStatus.SUCCESS } });
    const healthPercentage = totalScans > 0 ? (successScans / totalScans) * 100 : 100;

    res.json({
      success: true,
      data: {
        validPasses,
        expired: expiredPasses,
        revoked: revokedPasses,
        duplicateAttempts,
        invalidScans,
        healthPercentage: parseFloat(healthPercentage.toFixed(1)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 15. Export scan and delivery logs CSV
export const exportLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deliveries = await prisma.passDeliveryLog.findMany({
      include: {
        qrPass: { include: { guest: true } },
      },
      orderBy: { sentAt: 'desc' },
    });

    const scans = await prisma.scanHistory.findMany({
      include: {
        qrPass: { include: { guest: true } },
      },
      orderBy: { scanTime: 'desc' },
    });

    // We'll return a formatted log output containing both delivery and scans
    const headers = [
      'Log Type', 'Timestamp', 'Pass Number', 'Guest Name', 'Guest Email', 
      'Channel/Location', 'Status', 'Details/Failure Reason'
    ];

    const deliveryRows = deliveries.map((d) => [
      'DELIVERY',
      d.sentAt.toISOString(),
      d.qrPass.passNumber,
      d.qrPass.guest.name,
      d.qrPass.guest.email,
      d.channel,
      d.status,
      d.failureReason || 'N/A',
    ]);

    const scanRows = scans.map((s) => [
      'SCAN_ATTEMPT',
      s.scanTime.toISOString(),
      s.qrPass.passNumber,
      s.qrPass.guest.name,
      s.qrPass.guest.email,
      s.scanLocation || 'N/A',
      s.scanStatus,
      s.notes || 'N/A',
    ]);

    const allRows = [...deliveryRows, ...scanRows].sort(
      (a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime()
    );

    const csvContent = [
      headers.join(','),
      ...allRows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="qr_passes_logs_export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
