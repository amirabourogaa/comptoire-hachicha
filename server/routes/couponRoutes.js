const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

router.post('/validate', couponController.validateCoupon);

router.route('/')
  .get(protect, authorize('admin', 'super_admin'), couponController.getAllCoupons)
  .post(protect, authorize('admin', 'super_admin'), couponController.createCoupon);

router.route('/:id')
  .get(protect, authorize('admin', 'super_admin'), couponController.getCoupon)
  .put(protect, authorize('admin', 'super_admin'), couponController.updateCoupon)
  .delete(protect, authorize('admin', 'super_admin'), couponController.deleteCoupon);

module.exports = router;
