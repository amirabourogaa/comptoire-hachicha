const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect, authorize, protectVendor } = require('../middleware/auth');

// Public routes
router.post('/login', vendorController.vendorLogin);

// Protected vendor routes
router.get('/profile', protectVendor, vendorController.getVendorProfile);

// Admin routes
router.get('/stats', protect, authorize('admin', 'super_admin'), vendorController.getVendorStats);

router.route('/')
  .get(protect, authorize('admin', 'super_admin'), vendorController.getAllVendors)
  .post(protect, authorize('admin', 'super_admin'), vendorController.createVendor);

router.route('/:id')
  .get(protect, authorize('admin', 'super_admin'), vendorController.getVendor)
  .put(protect, authorize('admin', 'super_admin'), vendorController.updateVendor)
  .delete(protect, authorize('super_admin'), vendorController.deleteVendor);

router.post('/:id/create-account', protect, authorize('admin', 'super_admin'), vendorController.createVendorAccount);
router.put('/:id/toggle-status', protect, authorize('admin', 'super_admin'), vendorController.toggleVendorStatus);
router.put('/:id/verify', protect, authorize('super_admin'), vendorController.verifyVendor);

module.exports = router;
