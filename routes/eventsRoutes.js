const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

router.post('/', eventsController.createEvent);
router.post('/join', eventsController.joinEvent);

router.get('/:id', eventsController.getEventById);
router.get('/my/:id', eventsController.getMyEvents);

router.get('/', eventsController.getAllEvents);

router.put('/:id', eventsController.updateEvent);

router.delete('/:id', eventsController.deleteEvent);

module.exports = router;
