const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', userController.login);

router.route('/')
  .get(protect, authorize('super_admin'), userController.getAllUsers)
  .post(protect, authorize('super_admin'), userController.createUser);

router.route('/:id')
  .put(protect, authorize('super_admin'), userController.updateUser)
  .delete(protect, authorize('super_admin'), userController.deleteUser);

router.route('/:id/permissions')
  .put(protect, authorize('super_admin'), userController.updatePermissions);

module.exports = router;
