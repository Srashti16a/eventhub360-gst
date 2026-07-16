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

const logActivity = async (guestName: string, passId: string, action: string, operator: string = 'System') => {
  try {
    await prisma.qRPassActivityLog.create({
      data: {
        guestName,
        passId,
        action,
        operator,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
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
        totalPasses: totalPassesGenerated,
        scannedPasses,
        activePasses,
        activePassesCount: activePasses,
        pendingDeliveryCount,
        pendingPasses: pendingDeliveryCount,
        securityHealthRate: parseFloat(securityHealthRate.toFixed(1)),
        securityHealth: parseFloat(securityHealthRate.toFixed(1)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. QR Pass Registry
export const getPasses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, passType, status, eventId, page = 1, limit = 5, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where: any = {};

    if (eventId && typeof eventId === 'string' && eventId !== 'ALL') {
      where.eventId = eventId;
    }

    const andConditions: any[] = [];

    // 1. Search Query
    if (search && typeof search === 'string') {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          {
            qrPasses: {
              some: {
                OR: [
                  { passNumber: { contains: search, mode: 'insensitive' } },
                  { qrCode: { contains: search, mode: 'insensitive' } }
                ]
              }
            }
          }
        ]
      });
    }

    // 2. Pass Type Filter
    let typesList: string[] = [];
    if (passType && typeof passType === 'string' && passType !== 'ALL') {
      typesList = passType.split(',').map(t => t.trim().toUpperCase());
    }

    if (typesList.length > 0) {
      const typeConditions: any[] = [];
      if (typesList.includes('VIP')) {
        typeConditions.push({ isVip: true });
        typeConditions.push({ qrPasses: { some: { passType: 'VIP' } } });
      }
      if (typesList.includes('STAFF')) {
        typeConditions.push({ isBridalParty: true });
        typeConditions.push({ isSpeaker: true });
        typeConditions.push({ qrPasses: { some: { passType: 'STAFF' } } });
        typeConditions.push({ qrPasses: { some: { passType: 'SPEAKER' } } });
      }
      if (typesList.includes('ATTENDEE')) {
        typeConditions.push({
          AND: [
            { isVip: false },
            { isBridalParty: false },
            { isSpeaker: false }
          ]
        });
        typeConditions.push({ qrPasses: { some: { passType: 'ATTENDEE' } } });
      }
      andConditions.push({ OR: typeConditions });
    }

    // 3. Status Filter
    let statusesList: string[] = [];
    if (status && typeof status === 'string' && status !== 'ALL') {
      statusesList = status.split(',').map(s => s.trim().toUpperCase());
    }

    if (statusesList.length > 0) {
      const statusConditions: any[] = [];
      const dbStatuses = statusesList.filter(s => s !== 'NOT GENERATED');
      if (dbStatuses.length > 0) {
        statusConditions.push({
          qrPasses: {
            some: {
              status: { in: dbStatuses as any[] }
            }
          }
        });
      }

      const includesAllStandard = dbStatuses.length === 4; // ACTIVE, SCANNED, REVOKED, PENDING
      if (includesAllStandard || statusesList.includes('NOT GENERATED')) {
        statusConditions.push({
          qrPasses: {
            none: {}
          }
        });
      }
      andConditions.push({ OR: statusConditions });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Safe sorting on Guest
    let orderBy: any = { createdAt: sortOrder };

    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        include: {
          qrPasses: {
            include: {
              deliveryLogs: {
                orderBy: { sentAt: 'desc' },
                take: 1
              }
            }
          }
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.guest.count({ where }),
    ]);

    const formatted = guests.map((g) => {
      const qrPass = eventId && eventId !== 'ALL'
        ? g.qrPasses.find(p => p.eventId === eventId)
        : g.qrPasses[0];

      let type = 'ATTENDEE';
      if (g.isVip) type = 'VIP';
      else if (g.isSpeaker) type = 'SPEAKER';
      else if (g.isBridalParty) type = 'STAFF';

      if (qrPass) {
        type = qrPass.passType;
      }

      const status = qrPass ? qrPass.status : 'NOT GENERATED';

      const lastActivity = qrPass?.lastScannedAt
        ? new Date(qrPass.lastScannedAt).toLocaleTimeString()
        : 'Never';

      const expires = qrPass?.expiresAt
        ? new Date(qrPass.expiresAt).toLocaleDateString()
        : 'Never';

      const badgeText = qrPass
        ? `${qrPass.passType} PASS ${qrPass.status}`
        : 'NO PASS GENERATED';

      const sha256 = qrPass?.qrCode
        ? qrPass.qrCode.replace(/-/g, '').slice(0, 16)
        : 'N/A';

      return {
        id: qrPass ? qrPass.id : g.id,
        guestId: g.id,
        eventId: g.eventId,
        name: g.name,
        avatar: g.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120',
        type,
        status,
        lastActivity,
        passId: qrPass ? qrPass.passNumber : 'Not Generated',
        expires,
        badgeText,
        sha256,
      };
    });

    const totalPages = Math.ceil(total / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrevious = pageNum > 1;

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext,
        hasPrevious,
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
    let pass = await prisma.qRPass.findUnique({
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
      // Fallback: Check if id is a guest ID
      const guest = await prisma.guest.findUnique({
        where: { id },
        include: {
          event: true,
          qrPasses: {
            take: 1,
            include: {
              scanHistory: {
                orderBy: { scanTime: 'desc' },
                take: 5,
              },
              deliveryLogs: {
                orderBy: { sentAt: 'desc' },
                take: 5,
              },
            }
          }
        }
      });

      if (guest) {
        const qrPass = guest.qrPasses[0];
        if (qrPass) {
          pass = {
            ...qrPass,
            guest,
            event: guest.event
          } as any;
        } else {
          // Guest with no pass
          res.json({
            success: true,
            data: {
              id: guest.id,
              guestDetails: {
                id: guest.id,
                name: guest.name,
                avatar: guest.avatar,
                email: guest.email,
                phone: guest.phone,
              },
              eventDetails: {
                id: guest.event.id,
                title: guest.event.title,
                category: guest.event.category,
                date: guest.event.date,
              },
              qrCode: '',
              passType: 'ATTENDEE',
              status: 'Not Generated',
              expiresAt: null,
              downloadCount: 0,
              deliveryLogs: [],
              scanHistory: [],
              securityStatus: 'NOT_GENERATED',
            }
          });
          return;
        }
      }
    }

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

    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    const guestName = guest ? guest.name : 'Unknown';
    await logActivity(guestName, pass.passNumber, 'Pass Generated', createdBy || 'System');

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
    const pass = await prisma.qRPass.findUnique({ where: { id } });
    if (pass) {
      await prisma.qRPass.delete({ where: { id } });
    } else {
      const guestPass = await prisma.qRPass.findFirst({ where: { guestId: id } });
      if (guestPass) {
        await prisma.qRPass.delete({ where: { id: guestPass.id } });
      }
    }
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

    const resolvedPassIds: string[] = [];

    for (const id of qrPassIds) {
      const pass = await prisma.qRPass.findUnique({ where: { id } });
      if (pass) {
        resolvedPassIds.push(pass.id);
      } else {
        const guest = await prisma.guest.findUnique({ where: { id } });
        if (guest) {
          const guestPass = await prisma.qRPass.findFirst({ where: { guestId: guest.id } });
          if (guestPass) {
            resolvedPassIds.push(guestPass.id);
          } else {
            const qrCode = randomUUID();
            const passNumber = await generateUniquePassNumber();
            const newPass = await prisma.qRPass.create({
              data: {
                guestId: guest.id,
                eventId: guest.eventId,
                passType: guest.isVip ? QRPassType.VIP : guest.isSpeaker ? QRPassType.SPEAKER : guest.isBridalParty ? QRPassType.STAFF : QRPassType.ATTENDEE,
                status: action === 'REVOKE' ? QRPassStatus.REVOKED : QRPassStatus.ACTIVE,
                qrCode,
                passNumber,
                lastScannedAt: new Date(),
              }
            });
            resolvedPassIds.push(newPass.id);
          }
        }
      }
    }

    if (action === 'DELETE') {
      await prisma.qRPass.deleteMany({
        where: { id: { in: resolvedPassIds } },
      });
      res.json({ success: true, message: `Successfully deleted ${resolvedPassIds.length} passes` });
      return;
    }

    if (action === 'ACTIVATE') {
      await prisma.qRPass.updateMany({
        where: { id: { in: resolvedPassIds } },
        data: { status: QRPassStatus.ACTIVE, lastScannedAt: new Date() },
      });
    } else if (action === 'REVOKE') {
      await prisma.qRPass.updateMany({
        where: { id: { in: resolvedPassIds } },
        data: { status: QRPassStatus.REVOKED, lastScannedAt: new Date() },
      });
    } else if (action === 'EXPIRE') {
      await prisma.qRPass.updateMany({
        where: { id: { in: resolvedPassIds } },
        data: { status: QRPassStatus.EXPIRED, lastScannedAt: new Date() },
      });
    } else if (action === 'RESEND' && channel) {
      const commType = channel as CommunicationType;
      const passes = await prisma.qRPass.findMany({ where: { id: { in: resolvedPassIds } } });
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
    const { eventId, status, passType, dateFrom, dateTo } = req.query;

    const whereDelivery: any = {};
    const whereScan: any = {};

    const qrPassFilter: any = {};
    if (eventId && typeof eventId === 'string') {
      qrPassFilter.eventId = eventId;
    }
    if (status && typeof status === 'string') {
      qrPassFilter.status = status as QRPassStatus;
    }
    if (passType && typeof passType === 'string') {
      qrPassFilter.passType = passType as QRPassType;
    }

    if (Object.keys(qrPassFilter).length > 0) {
      whereDelivery.qrPass = qrPassFilter;
      whereScan.qrPass = qrPassFilter;
    }

    if (dateFrom && typeof dateFrom === 'string') {
      const fromDate = new Date(dateFrom);
      whereDelivery.sentAt = { ...whereDelivery.sentAt, gte: fromDate };
      whereScan.scanTime = { ...whereScan.scanTime, gte: fromDate };
    }

    if (dateTo && typeof dateTo === 'string') {
      const toDate = new Date(dateTo);
      whereDelivery.sentAt = { ...whereDelivery.sentAt, lte: toDate };
      whereScan.scanTime = { ...whereScan.scanTime, lte: toDate };
    }

    const deliveries = await prisma.passDeliveryLog.findMany({
      where: whereDelivery,
      include: {
        qrPass: { include: { guest: true } },
      },
      orderBy: { sentAt: 'desc' },
    });

    const scans = await prisma.scanHistory.findMany({
      where: whereScan,
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

// 16. Get Help
export const getHelp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: {
        title: "QR Pass Center Help",
        sections: [
          "Generate QR Pass",
          "Download Pass",
          "Verify Pass",
          "Bulk Actions",
          "Export Logs",
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// 17. Get Notifications
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Fetch latest passes
    const passes = await prisma.qRPass.findMany({
      take: 20,
      orderBy: { generatedAt: 'desc' },
      include: { guest: true }
    });

    // 2. Fetch latest revoked passes
    const revokedPasses = await prisma.qRPass.findMany({
      where: { status: QRPassStatus.REVOKED },
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { guest: true }
    });

    // 3. Fetch latest verified scans
    const scans = await prisma.scanHistory.findMany({
      where: { scanStatus: ScanStatus.SUCCESS },
      take: 10,
      orderBy: { scanTime: 'desc' },
      include: { qrPass: { include: { guest: true } } }
    });

    const notifications: any[] = [];

    // Group passes by generatedAt time truncated to nearest 5 seconds to identify batch generation
    const batchGroups: { [key: string]: typeof passes } = {};
    passes.forEach(p => {
      const timeKey = Math.floor(p.generatedAt.getTime() / 5000) * 5000;
      if (!batchGroups[timeKey]) {
        batchGroups[timeKey] = [];
      }
      batchGroups[timeKey].push(p);
    });

    Object.keys(batchGroups).forEach(timeKey => {
      const group = batchGroups[timeKey];
      const timestamp = new Date(Number(timeKey));
      if (group.length > 2) {
        notifications.push({
          id: `batch-${timeKey}`,
          type: 'BATCH_GENERATED',
          title: 'Batch Generation Completed',
          message: `Batch generation completed: ${group.length} QR passes generated successfully`,
          timestamp,
          read: false
        });
      } else {
        group.forEach(p => {
          notifications.push({
            id: `gen-${p.id}`,
            type: 'PASS_GENERATED',
            title: 'Pass Generated',
            message: `Pass generated: QR Pass for guest ${p.guest.name} (${p.passType}) is ready`,
            timestamp: p.generatedAt,
            read: false
          });
        });
      }
    });

    // Add revoked notifications
    revokedPasses.forEach(p => {
      notifications.push({
        id: `rev-${p.id}`,
        type: 'PASS_REVOKED',
        title: 'Pass Revoked',
        message: `Pass revoked: QR pass for ${p.guest.name} has been revoked`,
        timestamp: p.updatedAt,
        read: false
      });
    });

    // Add verified scans
    scans.forEach(s => {
      notifications.push({
        id: `scan-${s.id}`,
        type: 'PASS_VERIFIED',
        title: 'Pass Verified',
        message: `Pass verified: ${s.qrPass.guest.name} scanned successfully at ${s.scanLocation || 'Main Entrance'}`,
        timestamp: s.scanTime,
        read: false
      });
    });

    // Sort notifications by timestamp descending
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Slice to top 15
    const resultNotifications = notifications.slice(0, 15);
    const unreadCount = resultNotifications.filter(n => !n.read).length;

    res.json({
      success: true,
      data: {
        unreadCount,
        notifications: resultNotifications
      }
    });
  } catch (error) {
    next(error);
  }
};

// 18. Get History
export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Recent scans
    const scans = await prisma.scanHistory.findMany({
      take: 15,
      orderBy: { scanTime: 'desc' },
      include: { qrPass: { include: { guest: true } } }
    });

    // Recent downloads (downloadCount > 0)
    const downloads = await prisma.qRPass.findMany({
      where: { downloadCount: { gt: 0 } },
      take: 15,
      orderBy: { updatedAt: 'desc' },
      include: { guest: true }
    });

    // Recent deliveries
    const deliveries = await prisma.passDeliveryLog.findMany({
      take: 15,
      orderBy: { sentAt: 'desc' },
      include: { qrPass: { include: { guest: true } } }
    });

    // Recent revocations
    const revocations = await prisma.qRPass.findMany({
      where: { status: QRPassStatus.REVOKED },
      take: 15,
      orderBy: { updatedAt: 'desc' },
      include: { guest: true }
    });

    // Recent creations (Generated)
    const creations = await prisma.qRPass.findMany({
      take: 15,
      orderBy: { generatedAt: 'desc' },
      include: { guest: true }
    });

    const history: any[] = [];

    scans.forEach(s => {
      history.push({
        id: `scan-${s.id}`,
        guestName: s.qrPass.guest.name,
        action: s.scanStatus === 'SUCCESS' ? 'Scanned' : 'Scan Failed',
        passId: s.qrPass.passNumber,
        timestamp: s.scanTime,
        operator: s.scannerName || 'Scanner Device'
      });
    });

    downloads.forEach(d => {
      history.push({
        id: `download-${d.id}`,
        guestName: d.guest.name,
        action: 'Downloaded',
        passId: d.passNumber,
        timestamp: d.updatedAt,
        operator: d.createdBy || 'User'
      });
    });

    deliveries.forEach(del => {
      history.push({
        id: `delivery-${del.id}`,
        guestName: del.qrPass.guest.name,
        action: del.status === 'SENT' ? 'Sent' : 'Delivery Failed',
        passId: del.qrPass.passNumber,
        timestamp: del.sentAt,
        operator: 'System'
      });
    });

    revocations.forEach(r => {
      history.push({
        id: `revocation-${r.id}`,
        guestName: r.guest.name,
        action: 'Revoked',
        passId: r.passNumber,
        timestamp: r.updatedAt,
        operator: r.createdBy || 'Admin'
      });
    });

    creations.forEach(c => {
      history.push({
        id: `gen-${c.id}`,
        guestName: c.guest.name,
        action: 'Generated',
        passId: c.passNumber,
        timestamp: c.generatedAt,
        operator: c.createdBy || 'System'
      });
    });

    // Order by latest first
    history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      success: true,
      data: history.slice(0, 30)
    });
  } catch (error) {
    next(error);
  }
};
