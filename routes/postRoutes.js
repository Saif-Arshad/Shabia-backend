const express = require('express');
const router = express.Router();
const postsController = require('../controllers/post.controller');

router.post('/', postsController.createPost);
router.get('/:id', postsController.getPostById);
router.get('/my/:id', postsController.getMyPost);
router.get('', postsController.getAllPosts);
router.put('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);

router.post('/event', postsController.joinEvent);

module.exports = router;
