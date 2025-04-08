const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');

router.get('/profile', verifyToken, userController.getProfile);
router.post('/signup', userController.signup);
router.post('/login', userController.login);

module.exports = router;
