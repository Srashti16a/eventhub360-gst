import app from './app';
import prisma from './config/prisma';

const PORT = process.env.PORT || 3000;

// Sync guest table checked-in status with check-in records on startup
const syncGuestCheckIns = async () => {
  try {
    const checkIns = await prisma.checkIn.findMany({
      include: { entrance: true }
    });
    console.log(`Syncing ${checkIns.length} check-in records with Guest table...`);
    for (const ci of checkIns) {
      await prisma.guest.update({
        where: { id: ci.guestId },
        data: {
          checkedIn: true,
          checkinTime: ci.checkedInAt,
          checkinEntrance: ci.entrance.name,
          checkinStatus: ci.status
        }
      });
    }
    console.log('Guest check-in synchronization complete.');
  } catch (err) {
    console.error('Error synchronizing guests with check-ins:', err);
  }
};

app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`  EventHub360 Premium Concierge API Running`);
  console.log(`  Local Server: http://localhost:${PORT}`);
  console.log(`  Interactive Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`===============================================`);
  await syncGuestCheckIns();
});
