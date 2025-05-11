const cron = require('node-cron');
const { analyzeUserActivity } = require('./activityAnalyzer');
const logger = require('./logger');

/**
 * Initialize the scheduler with all cron jobs
 */
function initScheduler() {
  logger.info('Initializing scheduler...');
  
  // Schedule hourly user activity analysis
  // Runs at the beginning of every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running scheduled user activity analysis');
    await analyzeUserActivity();
  });
  
  // Also run once on startup for testing purposes (commented out for production)
  // setTimeout(() => {
  //   logger.info('Running initial user activity analysis');
  //   analyzeUserActivity();
  // }, 5000);
  
  logger.info('Scheduler initialized');
}

module.exports = {
  initScheduler
}; 