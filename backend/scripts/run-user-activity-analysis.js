require('dotenv').config();
const { analyzeUserActivity } = require('../src/utils/activityAnalyzer');
const logger = require('../src/utils/logger');

async function runAnalysis() {
  logger.info('Manually triggering user activity analysis...');
  
  try {
    await analyzeUserActivity();
    logger.info('Analysis completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Analysis failed:', error);
    process.exit(1);
  }
}

runAnalysis(); 