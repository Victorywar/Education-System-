const express = require('express');
const { getMe } = require('../controllers/authController');
const { volunteerLogin } = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Session restore for AuthContext (Phase 2)
router.get('/me', protect, getMe);

// Reserved for later volunteer phase
router.post('/volunteer/login', volunteerLogin);

module.exports = router;
