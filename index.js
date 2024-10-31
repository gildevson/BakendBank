const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

// Configuração do banco de dados PostgreSQL usando 'pg'
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT, PORT } = process.env;

const pool = new Pool({
    host: PGHOST,
    user: PGUSER,
    password: decodeURIComponent(PGPASSWORD),
    database: PGDATABASE,
    port: PGPORT || 5432,
    ssl: { rejectUnauthorized: false }
});

// Inicializando o aplicativo Express
const app = express();

// Configuração de CORS com domínio específico
app.use(cors({
    origin: 'https://remessasegura.netlify.app', // Substitua pelo domínio do frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Habilitar requisições OPTIONS para CORS
app.options('*', cors({
    origin: 'https://remessasegura.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json()); // Middleware para permitir JSON no corpo da requisição

// Importação de rotas
const authRoutes = require('./src/routes/authRoutes'); // Ajuste o caminho conforme necessário
const userRoutes = require('./src/routes/userRoutes'); // Ajuste o caminho conforme necessário

// Configuração das rotas
app.use('/api', userRoutes);
app.use('/auth', authRoutes);

// Rota principal para testes
app.get('/', (req, res) => {
    res.send('Servidor está rodando!');
});

// Iniciando o servidor
app.listen(PORT || 3000, () => {
    console.log(`Servidor rodando na porta ${PORT || 3000}`);
});

// Função para obter a versão do PostgreSQL usando 'postgres' se necessário
const postgres = require('postgres');
const sql = postgres({
    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: 'require',
    connection: {
        options: `project=${process.env.ENDPOINT_ID}`,
    },
});
