const pg = require('pg');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')

const port=3000;

require('dotenv').config()

const pool = new pg.Pool({
    user: process.env.POSTGRES_NEW_USER,
    host: 'db',
    database: process.env.POSTGRES_NEW_DB,
    password: process.env.POSTGRES_NEW_PASSWORD,
    port: 5432,
    connectionTimeoutMillis: 5000
})

console.log("Connecting...:")

app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/authenticate/:username/:password', async (request, response) => {
    const username = request.params.username;
    const password = request.params.password;

    const query = 'SELECT * FROM users WHERE user_name = $1 AND password = crypt($2, password)';
    console.log(query);
    pool.query(query, [username, password], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)});
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

