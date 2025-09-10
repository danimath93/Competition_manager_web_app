const express = require('express');
const router = express.Router();

const loginUserController = require('../controllers/loginUserController');  

// POST /api/loginUsers - Login user
router.post('/', loginUserController.loginUser);

module.exports = router;