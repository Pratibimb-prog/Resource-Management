const express = require('express');
const router = express.Router();
const {
    getResources,
    createResource,
    updateResource,
    deleteResource,
    predictResourceDemand
} = require('../controllers/resourceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getResources)
    .post(protect, admin, createResource);

router.route('/:id')
    .put(protect, admin, updateResource)
    .delete(protect, admin, deleteResource);

// Phase 2 ML Route
router.get('/:id/predict', protect, predictResourceDemand);

module.exports = router;
