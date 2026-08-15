const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(categoryController.getAllCategories)
  .post(protect, authorize('admin', 'super_admin'), categoryController.createCategory);

router.get('/slug/:slug', categoryController.getCategoryBySlug);

router.route('/:id')
  .get(categoryController.getCategory)
  .put(protect, authorize('admin', 'super_admin'), categoryController.updateCategory)
  .delete(protect, authorize('admin', 'super_admin'), categoryController.deleteCategory);

module.exports = router;
