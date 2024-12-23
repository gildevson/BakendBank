const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Configurando o pool de conexões com o PostgreSQL
const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
    ssl: { rejectUnauthorized: false } // Necessário para ambientes de produção como o Neon
});

// Função para criar usuário
async function createUser(req, res) {
    const { nome, email, password, permission_id } = req.body;
    const userId = uuidv4();

    // Validação de entrada
    const emailRegex = /\S+@\S+\.\S+/;
    const validPermissions = [1, 2]; // Exemplo de permissões válidas como números
    const errors = [];

    if (!nome) errors.push('Nome é obrigatório.');
    if (!email || !emailRegex.test(email)) errors.push('Email inválido.');
    if (!password || password.length < 6) errors.push('A senha deve ter pelo menos 6 caracteres.');
    if (!validPermissions.includes(parseInt(permission_id))) errors.push('Permissão inválida.');

    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join(' ') });
    }

    try {
        // Verificar se o usuário já existe
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Usuário já existe.' });
        }

        // Criptografar a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Criar novo usuário
        const newUser = await pool.query(
            'INSERT INTO users (id, nome, email, password, permission_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, permission_id',
            [userId, nome, email, hashedPassword, permission_id]
        );

        return res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        return res.status(500).json({ message: 'Erro ao criar usuário. Tente novamente mais tarde.' });
    }
}

// Função para listar usuários d
async function listUsers(req, res) {
    try {
        const result = await pool.query(`
            SELECT id, nome, email, permission_id::text AS permission_id 
            FROM users
        `);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        return res.status(500).json({ message: 'Erro ao listar usuários. Tente novamente mais tarde.' });
    }
}

// Função para deletar usuário
async function deleteUser(req, res) {
    const userId = req.params.id;

    try {
        // Verificar se o usuário existe
        const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Excluir o usuário
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        return res.status(200).json({ message: 'Usuário excluído com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        return res.status(500).json({ message: 'Erro ao excluir usuário. Tente novamente mais tarde.' });
    }
}

module.exports = { createUser, listUsers, deleteUser };
