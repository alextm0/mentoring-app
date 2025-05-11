const { logsRepo, monitoredUsersRepo } = require('../repos');
const logger = require('./logger');

// Configuration constants
const HOUR_THRESHOLD = 100; // Flag users with more than 100 operations per hour
const DAY_THRESHOLD = 1000; // Flag users with more than 1000 operations per day
const ANALYSIS_PERIODS = {
  LAST_HOUR: 'last_hour',
  LAST_24_HOURS: 'last_24_hours'
};

/**
 * Analyze user activity to detect suspicious patterns
 * This function is designed to be called by a scheduled job
 */
async function analyzeUserActivity() {
  logger.info('Starting user activity analysis...');
  
  try {
    // Analyze activity in the last hour
    await analyzeActivityLastHour();
    
    // Analyze activity in the last 24 hours
    await analyzeActivityLast24Hours();
    
    logger.info('User activity analysis completed successfully');
  } catch (error) {
    logger.error('Error analyzing user activity:', error);
  }
}

/**
 * Analyze user activity in the last hour
 */
async function analyzeActivityLastHour() {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Get logs from the last hour
    const logs = await logsRepo.findByDateRange(oneHourAgo, now);
    
    // Count operations per user
    const userOperationCounts = countOperationsByUser(logs);
    
    // Check for users exceeding the threshold
    for (const [userId, count] of Object.entries(userOperationCounts)) {
      if (count > HOUR_THRESHOLD) {
        // Check if user is already being monitored
        const isMonitored = await monitoredUsersRepo.isUserMonitored(userId);
        
        if (!isMonitored) {
          // Add user to monitored list
          await monitoredUsersRepo.addMonitoredUser({
            user_id: userId,
            reason: `Exceeded hourly operation threshold: ${count} operations in the last hour (threshold: ${HOUR_THRESHOLD})`,
            operation_count: count,
            time_period: ANALYSIS_PERIODS.LAST_HOUR
          });
          
          logger.warn(`User ${userId} added to monitored list: ${count} operations in the last hour`);
        }
      }
    }
  } catch (error) {
    logger.error('Error analyzing last hour activity:', error);
    throw error;
  }
}

/**
 * Analyze user activity in the last 24 hours
 */
async function analyzeActivityLast24Hours() {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Get logs from the last 24 hours
    const logs = await logsRepo.findByDateRange(oneDayAgo, now);
    
    // Count operations per user
    const userOperationCounts = countOperationsByUser(logs);
    
    // Check for users exceeding the threshold
    for (const [userId, count] of Object.entries(userOperationCounts)) {
      if (count > DAY_THRESHOLD) {
        // Check if user is already being monitored
        const isMonitored = await monitoredUsersRepo.isUserMonitored(userId);
        
        if (!isMonitored) {
          // Add user to monitored list
          await monitoredUsersRepo.addMonitoredUser({
            user_id: userId,
            reason: `Exceeded daily operation threshold: ${count} operations in the last 24 hours (threshold: ${DAY_THRESHOLD})`,
            operation_count: count,
            time_period: ANALYSIS_PERIODS.LAST_24_HOURS
          });
          
          logger.warn(`User ${userId} added to monitored list: ${count} operations in the last 24 hours`);
        }
      }
    }
  } catch (error) {
    logger.error('Error analyzing last 24 hours activity:', error);
    throw error;
  }
}

/**
 * Count the number of operations per user from a list of logs
 */
function countOperationsByUser(logs) {
  const userCounts = {};
  
  for (const log of logs) {
    const userId = log.user_id;
    userCounts[userId] = (userCounts[userId] || 0) + 1;
  }
  
  return userCounts;
}

module.exports = {
  analyzeUserActivity
}; 