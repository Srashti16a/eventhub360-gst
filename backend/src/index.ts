import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  EventHub360 Premium Concierge API Running`);
  console.log(`  Local Server: http://localhost:${PORT}`);
  console.log(`  Interactive Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`===============================================`);
});
