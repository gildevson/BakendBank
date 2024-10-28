const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController'); // Certifique-se de que o caminho está correto

// Rota para login
router.post('/login', login);

module.exports = router;
