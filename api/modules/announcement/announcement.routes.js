const express = require('express');
const router = express.Router();
const announcementController = require('./announcement.controller');
const { authMiddleware, isAdminMiddleware } = require('../../middleware/auth.middleware');

// Public - get all announcements
router.get('/', announcementController.getAll);

// Admin - CRUD
router.post('/', authMiddleware, isAdminMiddleware, announcementController.create);
router.put('/:id', authMiddleware, isAdminMiddleware, announcementController.update);
router.delete('/:id', authMiddleware, isAdminMiddleware, announcementController.remove);

module.exports = router;
