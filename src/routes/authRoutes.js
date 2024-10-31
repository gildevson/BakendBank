const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// Rota para login
router.post('/login', login);

module.exports = router;
