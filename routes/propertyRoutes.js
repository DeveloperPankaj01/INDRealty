// routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { isAdmin } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Create a property (Admin only)
// router.post('/properties', propertyController.createProperty);
router.post('/properties', upload.single('image'), propertyController.createProperty);

// Get all properties for admin dashboard (no pagination)
router.get('/properties/admin', propertyController.getAllPropertiesForAdmin);

// Get all properties
router.get('/properties', propertyController.getAllProperties);

// Get only top properties (must be before :id route)
router.get('/properties/top', propertyController.getTopProperties);

// Get property by ID
router.get('/properties/:id', propertyController.getPropertyById);

// Get property by SEO slug
// router.get('/properties/:id', propertyController.getPropertyBySlug);
router.get('/properties/slug/:slug', propertyController.getPropertyBySlug);

// Update property data (Admin only)
router.put('/properties/:id', isAdmin, propertyController.updateProperty);

// Update property SEO data (Admin only)
router.put('/properties/:id/seo', isAdmin, propertyController.updatePropertySeo);

// Delete property (Admin only)
router.delete('/properties/:id', isAdmin, propertyController.deleteProperty);

// Toggle Top Property (Admin only)
router.put('/properties/:id/toggle-top', isAdmin, propertyController.toggleTopProperty); // New route

module.exports = router;

