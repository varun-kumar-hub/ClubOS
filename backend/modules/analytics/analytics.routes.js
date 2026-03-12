const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const { authMiddleware, isAdminMiddleware } = require('../../middleware/auth.middleware');

// All analytics routes are admin-only
router.get('/overview', authMiddleware, isAdminMiddleware, analyticsController.getOverview);
router.get('/events', authMiddleware, isAdminMiddleware, analyticsController.getEventChart);
router.get('/departments', authMiddleware, isAdminMiddleware, analyticsController.getDepartmentChart);

module.exports = router;
