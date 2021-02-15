import http from 'http'
import { createConnection } from 'mysql'
require('dotenv').config()

const connection = createConnection({
  host: 'localhost',
  user: process.env.DB_USER_READONLY,
  password: process.env.DB_PASSWORD_READONLY,
  database: process.env.DB_NAME,
})

connection.connect(err => console.log('connected: ' + connection.threadId + ' error: ' + err))

console.log(new Date().toString(), 'Server started up')

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })

  console.log(new Date().toString(), `New request: ${req.url}`)

  connection.query('select mydata from deleteme', (e, r, f) => {
    console.log('Database response', { e, r, f })
    res.end(JSON.stringify(r))
  })
})

server.listen()
