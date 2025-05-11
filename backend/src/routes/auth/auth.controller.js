const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { usersRepo } = require('../../repos');
const logger = require('../../utils/logger');
const { z } = require('zod');
const { logUserAction, ACTIONS, ENTITIES } = require('../../utils/auditLogger');

const env = require('../../config/env');

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['MENTOR', 'MENTEE']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Helper function to log authentication events
// We need a special function since these requests don't have req.user yet
const logAuthAction = async (req, action, entityId, details) => {
  try {
    // Since we don't have req.user yet, we create a log entry manually
    const logData = {
      user_id: entityId, // For auth, the user ID is the entity ID
      action,
      entity_type: ENTITIES.USER,
      entity_id: entityId,
      details,
      ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown'
    };

    // Use the logs repo directly
    const logsRepo = require('../../repos/logs.repo');
    return await logsRepo.create(logData);
  } catch (error) {
    logger.error(`Failed to log auth action: ${error.message}`, { error });
    return null;
  }
};

async function signup(req, res, next) {
  try {
    const validated = signupSchema.parse(req.body);

    const existingUser = await usersRepo.findByEmail(validated.email);
    if (existingUser) {
      return next({ status: 400, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);
    const newUser = await usersRepo.create({
      email: validated.email.toLowerCase(),
      password_hash: hashedPassword,
      role: validated.role,
    });

    const token = jwt.sign(
      { 
        id: newUser.id, 
        role: newUser.role,
        email: newUser.email 
      },
      env.JWT_SECRET,
    );

    // Log the signup
    await logAuthAction(
      req,
      ACTIONS.CREATE,
      newUser.id,
      `User registered with email: ${newUser.email}, role: ${newUser.role}`
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: error.errors });
    }
    logger.error('Signup error:', error);
    next(error);
  }
}

async function login(req, res, next) {
  try {
    console.log('Login request received:', req.body);
    const validated = loginSchema.parse(req.body);

    const user = await usersRepo.findByEmail(validated.email);
    if (!user) {
      // Log failed login attempt
      await logAuthAction(
        req,
        ACTIONS.FAILED_LOGIN,
        '00000000-0000-0000-0000-000000000000', // Use a placeholder UUID for non-existent user
        `Failed login attempt for email: ${validated.email} (user not found)`
      );
      return next({ status: 401, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(validated.password, user.password_hash);
    if (!isValidPassword) {
      // Log failed login attempt
      await logAuthAction(
        req,
        ACTIONS.FAILED_LOGIN,
        user.id,
        `Failed login attempt for user: ${user.email} (incorrect password)`
      );
      return next({ status: 401, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email
      },
      env.JWT_SECRET,
    );

    // Log successful login
    await logAuthAction(
      req,
      ACTIONS.LOGIN,
      user.id,
      `User logged in: ${user.email}, role: ${user.role}`
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: error.errors });
    }
    logger.error('Login error:', error);
    next(error);
  }
}

module.exports = {
  signup,
  login,
};