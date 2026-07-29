import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { prisma } from '../config/prisma.js';

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

    if (!prisma) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { department: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found or account removed' });
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
