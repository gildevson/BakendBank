const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/dbConfig'); // Certifique-se de que o arquivo dbConfig.js está corretamente configurado
const { StatusCodes } = require('http-status-codes');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Verificar se o email e a senha foram enviados
    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        // Verificar se o usuário existe no banco de dados
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Usuário não encontrado.' });
        }

        const user = result.rows[0];

        // Comparar a senha enviada com a senha criptografada armazenada
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Senha incorreta.' });
        }

        // Gerar o token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Caso o usuário não tenha um nome, use o email como fallback
        const nome = user.nome || user.email;

        // Retornar o token e os dados do usuário na resposta
        res.json({ 
            token, 
            username: nome, 
            permission_id: user.permission_id  // Certifique-se de que a coluna permission_id existe no banco de dados
        });
    } catch (err) {
        console.error('Erro no servidor:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Erro no servidor.' });
    }
};
