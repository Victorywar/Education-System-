const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');
const Admin = require('../models/Admin');

/**
 * JWT auth middleware
 * Expects: Authorization: Bearer <token>
 * JWT payload: { userId, role }
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access',
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from environment.');
      return res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    const role = decoded.role || 'student';

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    if (role === 'admin') {
      req.user = await Admin.findById(userId).select('-password');
      req.role = 'admin';
    } else if (role === 'volunteer') {
      req.user = await Volunteer.findById(userId).select('-password');
      req.role = 'volunteer';
    } else {
      req.user = await Student.findById(userId).select('-password');
      req.role = 'student';
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access',
    });
  }
};

module.exports = { protect };
