const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(productController.getAllProducts)
  .post(protect, authorize('admin', 'super_admin'), productController.createProduct);

router.route('/:id')
  .get(productController.getProduct)
  .put(protect, authorize('admin', 'super_admin'), productController.updateProduct)
  .delete(protect, authorize('admin', 'super_admin'), productController.deleteProduct);

module.exports = router;
