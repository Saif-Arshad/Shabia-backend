const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

router.post('/', newsController.createNews);

router.get('/:id', newsController.getNewsById);
router.get('/get-news/:id', newsController.getNewsBycreator);

router.get('/', newsController.getAllNews);

router.put('/:id', newsController.updateNews);

router.delete('/:id', newsController.deleteNews);

module.exports = router;
