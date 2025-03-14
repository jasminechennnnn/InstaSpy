const app = require('./app');
const analyzerController = require('./controllers/analyzerController');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Gracefully shut down Instagram service when the application closes
process.on('SIGINT', async () => {
  console.log('[IG Service] Shutting down application...');
  await analyzerController.shutdownService();
  process.exit(0);
 });
 
 process.on('SIGTERM', async () => {
  console.log('[IG Service] Shutting down application...');
  await analyzerController.shutdownService();
  process.exit(0);
 });