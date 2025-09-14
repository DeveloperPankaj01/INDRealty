// routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Global search route
router.get('/search', searchController.globalSearch);

// Search suggestions route
router.get('/search/suggestions', searchController.getSearchSuggestions);

module.exports = router;