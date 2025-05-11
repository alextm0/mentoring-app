require('dotenv').config();
const { monitoredUsersRepo } = require('../src/repos');
const logger = require('../src/utils/logger');

/**
 * Check if there are any active monitored users in the system
 */
async function checkMonitoredUsers() {
  try {
    logger.info('Checking for active monitored users...');
    
    // Get all active monitored users
    const monitoredUsers = await monitoredUsersRepo.getActiveMonitoredUsers();
    
    if (monitoredUsers.length === 0) {
      logger.info('No active monitored users found.');
      logger.info('You can run `npm run simulate-activity` to generate suspicious activity and flag a user.');
    } else {
      logger.info(`Found ${monitoredUsers.length} active monitored users:`);
      
      // Display information about each monitored user
      monitoredUsers.forEach((user, index) => {
        logger.info(`\n[User ${index + 1}]`);
        logger.info(`User ID: ${user.user_id}`);
        logger.info(`User Email: ${user.user_email}`);
        logger.info(`Reason: ${user.reason}`);
        logger.info(`Operation Count: ${user.operation_count}`);
        logger.info(`Time Period: ${user.time_period}`);
        logger.info(`Created At: ${user.created_at}`);
      });
      
      logger.info('\nYou can access these users via the API endpoint: GET /api/v1/monitored-users/active');
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('Error checking monitored users:', error);
    process.exit(1);
  }
}

checkMonitoredUsers(); 