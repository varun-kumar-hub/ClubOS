const express = require('express');
const router = express.Router();
const eventController = require('./event.controller');
const { authMiddleware, isAdminMiddleware } = require('../../middleware/auth.middleware');

// Public routes
router.get('/published', eventController.getPublished);
router.get('/:id', eventController.getById);

// Admin routes
router.get('/', authMiddleware, isAdminMiddleware, eventController.getAll);
router.post('/', authMiddleware, isAdminMiddleware, eventController.create);
router.put('/:id', authMiddleware, isAdminMiddleware, eventController.update);
router.delete('/:id', authMiddleware, isAdminMiddleware, eventController.remove);

module.exports = router;
