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

// Configuração de CORS para permitir requisições da origem Netlify
app.use(cors({
    origin: 'https://remessasegura.netlify.app/', // Permitir somente o domínio do Netlify
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
    credentials: true
}));

// Habilitar requisições OPTIONS para preflight CORS
app.options('*', cors());

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
