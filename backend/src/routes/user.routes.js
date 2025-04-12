const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getDoctors,
  getDoctor,
  searchDoctors
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// Profile routes
router.put('/profile', updateProfile);

// Doctor routes
router.get('/doctors', getDoctors);
router.get('/doctors/search', searchDoctors);
router.get('/doctors/:id', getDoctor);

module.exports = router;