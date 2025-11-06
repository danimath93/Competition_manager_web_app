const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');  

// POST /api/loginUsers - Login user
router.post('/login', authController.loginUser);

// POST /api/logoutUsers - Logout user
router.post('/logout', authController.logoutUser);

// POST /api/registerUsers - Register user
router.post('/register', authController.registerUser);

router.get('/confirm', authController.confirmUser);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

module.exports = router;