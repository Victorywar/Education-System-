const express = require('express');
const {
  getAllProgress,
  getSkillProgress,
  getLevelChallenge,
  checkLevelAnswer,
  submitLevel,
  completeModule,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, requireRole('student'));

router.get('/', getAllProgress);
router.get('/:skillId', getSkillProgress);
router.get('/:skillId/level/:levelNumber', getLevelChallenge);
router.post('/:skillId/level/:levelNumber/answer', checkLevelAnswer);
router.post('/:skillId/level/:levelNumber/submit', submitLevel);
router.post('/:skillId/module/:moduleId/complete', completeModule);

module.exports = router;
