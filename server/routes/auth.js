const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');  

// POST /api/loginUsers - Login user
router.post('/login', authController.loginUser);

// POST /api/logoutUsers - Logout user
router.post('/logout', authController.logoutUser);

// GET /api/checkAuth - Check authentication level
router.get('/check-auth', authController.checkAuthLevel);

// POST /api/registerUsers - Register user
router.post('/register', authController.registerUser);

// POST /api/update-user-data - Update user data (e.g., clubId, more to be added) 
router.post('/update-user-data', authController.updateUserData);

// GET /api/confirm - Confirm user registration
router.get('/confirm', authController.confirmUser);

// POST /api/request-password-reset - Request password reset
router.post('/request-password-reset', authController.requestPasswordReset);

// POST /api/reset-password - Reset user password
router.post('/reset-password', authController.resetPassword);

// GET /api/table-users - Get all users with table permissions
router.get('/table-users', authController.getTableUsers);

module.exports = router;