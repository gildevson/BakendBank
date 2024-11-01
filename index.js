const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT, PORT } = process.env;

// Configuração do Pool de Conexão com o Banco de Dados usando pg
const pool = new Pool({
    host: PGHOST,
    user: PGUSER,
    password: decodeURIComponent(PGPASSWORD),
    database: PGDATABASE,
    port: PGPORT || 5432,
    ssl: { rejectUnauthorized: false }
});

const app = express();

// Configuração do CORS usando o middleware 'cors'
const corsOptions = {
    origin: 'https://remessasegura.netlify.app', // Substitua pelo domínio do seu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Permite o envio de cookies com as requisições
};

app.use(cors(corsOptions)); // Aplica o middleware de CORS

// Middleware para interpretar requisições com JSON
app.use(express.json());

// Importar e usar rotas
const authRoutes = require('./src/routes/authRoutes'); 
const userRoutes = require('./src/routes/userRoutes'); 

app.use('/api', userRoutes);
app.use('/auth', authRoutes);

// Rota de teste para verificar se o servidor está ativo
app.get('/', (req, res) => {
    res.send('Servidor está rodando!');
});

// Rota para testar a conexão com o banco de dados
app.get('/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        res.status(500).json({ message: 'Erro ao conectar ao banco de dados' });
    }
});

// Iniciar o servidor na porta definida
app.listen(PORT || 3000, () => {
    console.log(`Servidor rodando na porta ${PORT || 3000}`);
});
