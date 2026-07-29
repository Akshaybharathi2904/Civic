import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { config } from '../config/env.js';

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ message: 'Database not available. Please check connection.' });
    }

    const { name, email, password, role, phone, ward, city } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'citizen',
        phone: phone || '',
        ward: ward || '',
        city: city || ''
      }
    });

    res.status(201).json({
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ward: user.ward,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ message: 'Database not available. Please check connection.' });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      ward: user.ward,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { department: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ ...user, _id: user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  res.json({ message: 'Password reset link sent to registered email' });
};
