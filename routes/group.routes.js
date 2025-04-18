const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controler');

router.post('/', groupController.createGroup);

router.get('/', groupController.getAllGroups);

router.get('/:id', groupController.getGroupById);

router.put('/:id', groupController.updateGroup);

router.delete('/:id', groupController.deleteGroup);

router.post('/:groupId/participant', groupController.toggleMembership);
module.exports = router;