const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { usersRepo } = require('../../repos');
const logger = require('../../utils/logger');
const { z } = require('zod');

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
      { id: newUser.id, role: newUser.role },
      env.JWT_SECRET,
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
    const validated = loginSchema.parse(req.body);

    const user = await usersRepo.findByEmail(validated.email);
    if (!user) {
      return next({ status: 401, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(validated.password, user.password_hash);
    if (!isValidPassword) {
      return next({ status: 401, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      env.JWT_SECRET,
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