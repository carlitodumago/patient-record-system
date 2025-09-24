import express from "express";

const router = express.Router();

import User from '../models/User.js';

// Mock users data - in a real app, this would come from a database
const users = [
  new User({
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    fullName: 'Admin User',
  }),
  new User({
    username: 'nurse',
    password: 'nurse123',
    role: 'nurse',
    fullName: 'Nurse Mike Chen',
  }),
  new User({
    username: 'patient',
    password: 'patient123',
    role: 'patient',
    fullName: 'Patient John Doe',
  }),
];

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }

  // Find user by username and password
  const user = User.authenticate(username, password, users);

  if (user) {
    // In a real app, you would generate a JWT token here
    const userData = {
      username: user.username,
      role: user.role,
      fullName: user.fullName || user.username,
      token: 'mock-jwt-token', // Mock token
    };

    res.status(200).json(userData);
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Register route
router.post('/register', (req, res) => {
  const { username, password, role, fullName, email } = req.body;

  // Basic validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters long' });
  }

  // Check if username already exists
  if (User.findByUsername(username, users)) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  // Add the new user
  const newUser = {
    username,
    password, // In a real app, this would be hashed
    role: role || 'patient',
    fullName: fullName || '',
    email: email || '',
  };

  User.create(newUser, users);

  res.status(201).json({ message: 'Registration successful' });
});

// Get all users (admin only)
router.get('/', (req, res) => {
  // In a real app, you would check for admin authorization here
  // For simplicity, we're returning all users without sensitive info
  const allUsers = User.getAll(users);
  const safeUsers = allUsers
    .filter((user) => user.role !== 'admin') // Don't include admin in user lists
    .map(({ username, role, fullName, email }) => ({
      username,
      role,
      fullName,
      email,
    }));

  res.status(200).json(safeUsers);
});

export default router;
