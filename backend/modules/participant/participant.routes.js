const express = require('express');
const router = express.Router();
const participantController = require('./participant.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// Protected - register for an event
router.post('/register', authMiddleware, participantController.register);
router.get('/me/registrations', authMiddleware, participantController.getMyRegistrations);

// Admin - view participants for an event
router.get('/event/:eventId', authMiddleware, participantController.getByEvent);

// Admin - remove a participant
router.delete('/:id', authMiddleware, participantController.remove);

module.exports = router;
