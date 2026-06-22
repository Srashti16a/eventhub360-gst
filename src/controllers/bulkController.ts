import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

// Helper to escape values for CSV output
const escapeCsv = (val: any): string => {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const exportGuests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, rsvpStatus, eventCategory, vipOnly } = req.query;

    // Build filter query (same as listGuests)
    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (rsvpStatus && typeof rsvpStatus === 'string' && rsvpStatus !== 'ALL') {
      where.status = rsvpStatus.toUpperCase();
    }

    if (eventCategory && typeof eventCategory === 'string' && eventCategory !== 'All Events') {
      where.event = {
        category: eventCategory,
      };
    }

    if (vipOnly === 'true' || (vipOnly as unknown) === true) {
      where.isVip = true;
    }

    const guests = await prisma.guest.findMany({
      where,
      include: {
        assignedHotel: true,
        event: true,
        table: true,
      },
      orderBy: { name: 'asc' },
    });

    // Generate CSV contents
    const headers = [
      'ID', 'Name', 'Email', 'Phone', 'Status', 'VIP', 'Speaker', 
      'Bridal Party', 'Primary Guest', 'Assigned Hotel', 'Event Title', 
      'Event Category', 'Table', 'Seat Number'
    ];

    const rows = guests.map(g => [
      g.id,
      g.name,
      g.email,
      g.phone,
      g.status,
      g.isVip ? 'YES' : 'NO',
      g.isSpeaker ? 'YES' : 'NO',
      g.isBridalParty ? 'YES' : 'NO',
      g.isPrimaryGuest ? 'YES' : 'NO',
      g.assignedHotel ? g.assignedHotel.name : 'N/A',
      g.event.title,
      g.event.category,
      g.table ? g.table.name : 'N/A',
      g.seatNumber !== null ? g.seatNumber : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="eventhub360_guests_export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const importGuests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let guestsToImport: any[] = [];

    // Check if the input is JSON array or CSV text
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      if (!Array.isArray(req.body)) {
        res.status(400).json({
          success: false,
          error: { message: 'For JSON imports, the request body must be an array of guest objects.' }
        });
        return;
      }
      guestsToImport = req.body;
    } else if (contentType.includes('text/csv') || typeof req.body === 'string') {
      // Simple CSV parser
      const lines = String(req.body).split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        res.status(400).json({
          success: false,
          error: { message: 'CSV import requires at least a header row and one data row.' }
        });
        return;
      }

      // Simple CSV cell splitter (handles quotes and commas)
      const parseCsvLine = (line: string): string[] => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_]/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        const cells = parseCsvLine(lines[i]);
        if (cells.length < headers.length) continue;
        
        const guestObj: any = {};
        headers.forEach((header, index) => {
          guestObj[header] = cells[index];
        });
        
        guestsToImport.push(guestObj);
      }
    } else {
      res.status(400).json({
        success: false,
        error: { message: 'Unsupported Content-Type. Please use application/json or text/csv.' }
      });
      return;
    }

    if (guestsToImport.length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'No records found to import.' }
      });
      return;
    }

    // Process imports
    const importedGuests = [];
    const errors = [];

    // Cache events, hotels, tables to minimize DB hits
    const eventCache = new Map<string, string>(); // category -> id
    const hotelCache = new Map<string, string>(); // name -> id

    for (let index = 0; index < guestsToImport.length; index++) {
      const g = guestsToImport[index];
      try {
        const name = g.name || g.fullname;
        const email = g.email;
        const phone = g.phone || g.contactinfo || g.phonenumber;
        const status = (g.status || 'PENDING').toUpperCase();
        
        if (!name || !email || !phone) {
          throw new Error(`Row ${index + 1}: Name, email, and phone are required fields.`);
        }

        const isVip = g.vip === 'true' || g.vip === 'YES' || !!g.isvip || g.vip === true;
        const isSpeaker = g.speaker === 'true' || g.speaker === 'YES' || !!g.isspeaker || g.speaker === true;
        const isBridalParty = g.bridalparty === 'true' || g.bridalparty === 'YES' || !!g.isbridalparty || g.bridalparty === true;
        const isPrimaryGuest = g.primaryguest === 'true' || g.primaryguest === 'YES' || !!g.isprimaryguest || g.primaryguest === true;

        // Resolve Event Category
        const eventCategory = g.eventcategory || g.category || 'Corporate Gala';
        let eventId = eventCache.get(eventCategory);
        
        if (!eventId) {
          let event = await prisma.event.findFirst({ where: { category: eventCategory } });
          if (!event) {
            event = await prisma.event.create({
              data: {
                title: `${eventCategory} Event`,
                category: eventCategory,
                date: new Date(),
              }
            });
          }
          eventId = event.id;
          eventCache.set(eventCategory, eventId);
        }

        // Resolve Hotel
        const hotelName = g.assignedhotel || g.hotel;
        let assignedHotelId = null;
        if (hotelName && hotelName !== '—' && hotelName !== 'N/A') {
          assignedHotelId = hotelCache.get(hotelName);
          if (!assignedHotelId) {
            let hotel = await prisma.hotel.findFirst({ where: { name: hotelName } });
            if (!hotel) {
              hotel = await prisma.hotel.create({ data: { name: hotelName } });
            }
            assignedHotelId = hotel.id;
            hotelCache.set(hotelName, assignedHotelId);
          }
        }

        // Create Guest
        const importedGuest = await prisma.guest.create({
          data: {
            name,
            avatar: g.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            email,
            phone,
            status: ['CONFIRMED', 'PENDING', 'DECLINED'].includes(status) ? status : 'PENDING',
            isVip,
            isSpeaker,
            isBridalParty,
            isPrimaryGuest,
            assignedHotelId,
            eventId,
          }
        });

        importedGuests.push(importedGuest);
      } catch (err: any) {
        errors.push({
          row: index + 1,
          message: err.message || 'Unknown error'
        });
      }
    }

    res.status(200).json({
      success: true,
      summary: {
        totalProcessed: guestsToImport.length,
        successfullyImported: importedGuests.length,
        failed: errors.length,
      },
      imported: importedGuests,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    next(error);
  }
};
