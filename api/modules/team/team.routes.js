const express = require('express');
const router = express.Router();
const teamController = require('./team.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// Public - create a team and join a team
router.post('/create', teamController.create);
router.post('/join', teamController.join);

// Admin - view teams for an event
router.get('/event/:eventId', authMiddleware, teamController.getByEvent);
router.get('/:id', authMiddleware, teamController.getById);

module.exports = router;
