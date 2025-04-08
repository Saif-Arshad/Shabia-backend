const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/serviecController');

router.post('/', servicesController.createService);
router.get('/:id', servicesController.getServiceById);

router.get('/', servicesController.getAllServices);

router.put('/services/:id', servicesController.updateService);

router.delete('/services/:id', servicesController.deleteService);

module.exports = router;
