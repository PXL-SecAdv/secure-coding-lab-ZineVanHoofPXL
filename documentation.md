# Documentation - SECURE CODING

## RISK #1: SQL Injection

### Sql injection command
The sql injection command  ```t' OR 1=1;--``` results in the query ```SELECT * FROM users WHERE user_name='t' OR 1=1;--' and password='fesfe'```. Since 1=1 is always true, the query no longer verifies the username or password. This allows the attacker to bypass the authentication check and be treated as an authenticated user.

### Fix
To fix this, we make the query a parameterized query ```SELECT * FROM users WHERE user_name = $1 AND password = $2```. We have to add ```[username, password]``` to the query function's arguments to pass the variables to the parameterized query.

```js
app.get('/authenticate/:username/:password', async (request, response) => {
    const username = request.params.username;
    const password = request.params.password;

    const query = 'SELECT * FROM users WHERE user_name = $1 AND password = $2';
    console.log(query);
    pool.query(query, [username, password], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)});
});
```

## RISK #2: Insecure Storage

### Fix
The passwords are hashed in the database with a Blowfish-based hashing algorithm. To make sure that we can still login, we hash the input password with the same salt and parameters that are stored with the hashed password in the database with the query ```SELECT * FROM users WHERE user_name = $1 AND password = crypt($2, password)```.

```sql
insert into users (user_name, password) values ('pxl-admin', crypt('secureandlovinit', gen_salt('bf')));
insert into users (user_name, password) values ('george', crypt('iwishihadbetteradmins', gen_salt('bf')));
```

```js
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
```

## RISK #3: CORS

### Research CORS
CORS (Cross-Origin Resource Sharing) is a security feature that allows web servers to control which origins (e.g., different domains, protocols, or ports) are allowed to make requests to them. By configuring CORS policies, you can specify which origins your backend will allow requests from, and deny requests from all other origins.

### Fix
This can help us make our backend application more secure by disallowing requests coming from origins that are not trusted.

```js
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

## RISK #4: Credentials in Version Control

### Remove credentials from Dockerfiles and the docker compose file
We can use .env files to store secrets, we can exclude these files from version control.

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

POSTGRES_NEW_USER=secadv
POSTGRES_NEW_PASSWORD=ilovesecurity
POSTGRES_NEW_DB=pxldb
```

```js
require('dotenv').config()

const pool = new pg.Pool({
    user: process.env.POSTGRES_NEW_USER,
    host: 'db',
    database: process.env.POSTGRES_NEW_DB,
    password: process.env.POSTGRES_NEW_PASSWORD,
    port: 5432,
    connectionTimeoutMillis: 5000
})
```

### Exposed credentials in an earlier commit
If our credentials are exposed in an earlier commit, we can change the credentials and exclude those from version control.