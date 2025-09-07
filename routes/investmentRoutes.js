// routes/investmentRoutes.js
const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const { isAdmin } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Optimized: Get only top investments (must be before :id route)
router.get('/investment/top', investmentController.getTopInvestments);

// Property routes
// router.post('/investment', investmentController.createInvestment);
router.post('/investment', upload.single('image'), investmentController.createInvestment);
router.get('/investment', investmentController.getAllInvestments);
router.get('/investment/:id', investmentController.getInvestmentById);
router.get('/investment/slug/:slug', investmentController.getInvestmentBySlug);
router.put('/investment/:id', isAdmin, investmentController.updateInvestment);
router.put('/investment/:id/seo', isAdmin, investmentController.updateInvestmentSeo);
router.delete('/investment/:id', isAdmin, investmentController.deleteInvestment);
router.put('/investment/:id/toggle-top', isAdmin, investmentController.toggleTopInvestment);

// New route for expressing interest
router.post('/investment/:investmentId/interest', investmentController.expressInterest);

module.exports = router;

