// authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login/google', authController.loginWithGoogle);
router.post('/login/facebook', authController.loginWithFacebook);
router.get('/user/:uid', authController.getUserByUid); 
// router.post('/promote-to-admin', authController.promoteToAdmin); // Add this route

module.exports = router;

