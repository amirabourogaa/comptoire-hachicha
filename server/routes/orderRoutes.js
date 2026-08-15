const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin', 'super_admin'), orderController.getAllOrders)
  .post(orderController.createOrder);

router.route('/:id')
  .get(orderController.getOrder)
  .patch(protect, authorize('admin', 'super_admin'), orderController.updateOrderStatus)
  .delete(protect, authorize('admin', 'super_admin'), orderController.deleteOrder);

module.exports = router;
