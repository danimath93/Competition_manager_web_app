const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');  

// POST /api/loginUsers - Login user
router.post('/login', authController.loginUser);

// POST /api/logoutUsers - Logout user
router.post('/logout', authController.logoutUser);

// POST /api/registerUsers - Register user
router.post('/register', authController.registerUser);

module.exports = router;