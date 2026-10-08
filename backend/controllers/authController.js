const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const generateToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

/**
 * POST /api/students/register
 * Phase 2 — Student registration
 */
const registerStudent = async (req, res) => {
  try {
    const {
      name,
      age,
      className,
      school,
      location,
      language,
      guardianContact,
      username,
      password,
      confirmPassword,
    } = req.body;

    if (
      !name?.trim() ||
      age === undefined ||
      age === null ||
      age === '' ||
      !className?.trim() ||
      !school?.trim() ||
      !location?.trim() ||
      !language?.trim() ||
      !guardianContact?.trim() ||
      !username?.trim() ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    const ageNum = Number(age);
    if (Number.isNaN(ageNum) || ageNum < 5 || ageNum > 25) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid age (5-25).',
      });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const exists = await Student.findOne({ username: normalizedUsername });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Student.create({
      name: name.trim(),
      age: ageNum,
      className: className.trim(),
      school: school.trim(),
      location: location.trim(),
      language: language.trim(),
      guardianContact: guardianContact.trim(),
      username: normalizedUsername,
      password: hashedPassword,
      role: 'student',
      assessmentCompleted: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
      });
    }
    console.error('Registration error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
    });
  }
};

/**
 * POST /api/students/login
 * Phase 2 — Student login
 */
const loginStudent = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const student = await Student.findOne({
      username: username.toLowerCase().trim(),
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    student.lastActiveAt = new Date();
    await student.save();

    const token = generateToken(student._id, student.role || 'student');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      role: student.role || 'student',
      user: {
        id: student._id,
        name: student.name,
        username: student.username,
        className: student.className,
        location: student.location,
        role: student.role || 'student',
        assessmentCompleted: student.assessmentCompleted,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
    });
  }
};

const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const userPayload =
      req.role === 'student'
        ? {
            id: req.user._id,
            name: req.user.name,
            username: req.user.username,
            className: req.user.className,
            location: req.user.location,
            role: 'student',
            assessmentCompleted: req.user.assessmentCompleted,
          }
        : req.role === 'admin'
          ? {
              id: req.user._id,
              name: req.user.name,
              username: req.user.username,
              role: 'admin',
            }
          : {
              id: req.user._id,
              name: req.user.name || req.user.fullName,
              username: req.user.username,
              role: 'volunteer',
            };

    return res.json({
      success: true,
      user: userPayload,
      role: req.role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
    });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  getMe,
  generateToken,
};
