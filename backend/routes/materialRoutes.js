const express = require('express');
const {
  addMaterial,
  getMyMaterials,
  getMaterialsBySkill,
  deleteMaterial,
} = require('../controllers/materialController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// வாலண்டியர் சார்ந்த API-க்கள்
router.post('/add', protect, requireRole('volunteer'), addMaterial);
router.get('/my-materials', protect, requireRole('volunteer'), getMyMaterials);
router.delete('/:id', protect, requireRole('volunteer'), deleteMaterial);

// மாணவர்கள் மற்றும் பொது பார்வைக்கான API
router.get('/skill/:skill', protect, getMaterialsBySkill);
router.get('/all', protect, getMaterialsBySkill);

module.exports = router;