const express = require('express');
const router = express.Router();
const { createUser, listUsers, deleteUser } = require('../controllers/userController');

// Rota para criar usuário
router.post('/users', createUser);

// Rota para listar usuários
router.get('/users', listUsers);

// Rota para deletar usuário
router.delete('/users/:id', deleteUser);

module.exports = router;
