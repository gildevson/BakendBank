const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT, PORT } = process.env;

const pool = new Pool({
    host: PGHOST,
    user: PGUSER,
    password: decodeURIComponent(PGPASSWORD),
    database: PGDATABASE,
    port: PGPORT || 5432,
    ssl: { rejectUnauthorized: false }
});

const app = express();

app.use(cors({
    origin: 'https://remessasegura.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

const authRoutes = require('./src/routes/authRoutes'); 
const userRoutes = require('./src/routes/userRoutes'); 

app.use('/api', userRoutes);
app.use('/auth', authRoutes);

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

app.listen(PORT || 3000, () => {
    console.log(`Servidor rodando na porta ${PORT || 3000}`);
});

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
