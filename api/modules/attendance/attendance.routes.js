const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
const { authMiddleware, isAdminMiddleware } = require('../../middleware/auth.middleware');

// All attendance routes are admin-only
router.get('/event/:eventId', authMiddleware, isAdminMiddleware, attendanceController.getByEvent);
router.get('/stats/:eventId', authMiddleware, isAdminMiddleware, attendanceController.getStats);
router.post('/mark', authMiddleware, isAdminMiddleware, attendanceController.mark);
router.post('/bulk-mark', authMiddleware, isAdminMiddleware, attendanceController.bulkMark);

module.exports = router;
