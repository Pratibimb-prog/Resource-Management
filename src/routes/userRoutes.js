const express = require('express');
const router = express.Router();
const { getMe, getAllUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/me', protect, getMe);
router.get('/', protect, admin, getAllUsers);

module.exports = router;
