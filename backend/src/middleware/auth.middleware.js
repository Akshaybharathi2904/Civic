import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { MOCK_USERS } from '../utils/seedData.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    let user = null;

    try {
      if (prisma) {
        user = await prisma.user.findUnique({
          where: { id: decoded.id },
          include: { department: true }
        });
      }
    } catch (err) {
      user = null;
    }

    if (!user) {
      user = MOCK_USERS.find((u) => u._id === decoded.id || u.id === decoded.id) || MOCK_USERS[0];
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token verification failed or expired' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user?.role}) is not authorized to access this resource`
      });
    }
    next();
  };
};
