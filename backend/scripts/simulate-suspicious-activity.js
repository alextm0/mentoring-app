require('dotenv').config();
const { logsRepo, usersRepo } = require('../src/repos');
const { ACTIONS, ENTITIES } = require('../src/utils/auditLogger');
const logger = require('../src/utils/logger');
const uuid = require('uuid');
const { analyzeUserActivity } = require('../src/utils/activityAnalyzer');
const bcrypt = require('bcrypt');

/**
 * Create a test user if no users exist in the database
 */
async function createTestUser() {
  try {
    // Try to find any user in the system
    const testEmails = ['admin@example.com', 'test@example.com', 'mentor@example.com', 'mentee@example.com'];
    let existingUser = null;
    
    for (const email of testEmails) {
      const user = await usersRepo.findByEmail(email);
      if (user) {
        existingUser = user;
        break;
      }
    }
    
    if (existingUser) {
      logger.info(`Using existing user: ${existingUser.email} (${existingUser.id})`);
      return existingUser;
    }
    
    // No user found, create a test user
    logger.info('No users found in database, creating test user...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    const newUser = await usersRepo.create({
      email: 'test-user@example.com',
      password_hash: hashedPassword,
      role: 'MENTOR', // Use MENTOR role for testing
    });
    
    logger.info(`Created test user: ${newUser.email} (${newUser.id})`);
    return newUser;
  } catch (error) {
    logger.error('Error creating test user:', error);
    throw error;
  }
}

/**
 * Simulate a suspicious number of operations for a specific user
 */
async function simulateSuspiciousActivity() {
  try {
    // First, make sure we have a valid user
    const user = await createTestUser();
    
    logger.info(`Simulating suspicious activity for user ${user.email} (${user.id})`);
    
    // Define possible actions and entities
    const actions = [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE];
    const entities = [ENTITIES.ASSIGNMENT, ENTITIES.RESOURCE, ENTITIES.SUBMISSION, ENTITIES.COMMENT];
    
    // Generate a large number of log entries (exceeding our hourly threshold)
    const numberOfLogs = 150; // Should exceed the HOUR_THRESHOLD set in activityAnalyzer.js
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    for (let i = 0; i < numberOfLogs; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const entityType = entities[Math.floor(Math.random() * entities.length)];
      const entityId = uuid.v4();
      const timestamp = new Date(oneHourAgo.getTime() + (i * (60 * 60 * 1000 / numberOfLogs)));
      
      // Create a log entry with a timestamp within the last hour
      await logsRepo.create({
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: `Simulated ${action} operation on ${entityType}`,
        ip_address: '127.0.0.1',
        user_agent: 'Suspicious Activity Simulator',
        created_at: timestamp
      });
      
      // Log progress every 10 entries
      if (i % 10 === 0) {
        logger.info(`Created ${i} of ${numberOfLogs} log entries...`);
      }
    }
    
    logger.info(`Successfully created ${numberOfLogs} simulated log entries`);
    
    // Run the activity analyzer to detect the suspicious activity
    logger.info('Running activity analysis to detect suspicious behavior...');
    await analyzeUserActivity();
    
    logger.info('Simulation and analysis complete!');
    logger.info(`Check monitored users endpoint: GET /api/v1/monitored-users/active`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Error simulating suspicious activity:', error);
    process.exit(1);
  }
}

simulateSuspiciousActivity(); 