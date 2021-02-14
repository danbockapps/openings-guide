import mysql from 'mysql'
import http from 'http'
require('dotenv').config()

const connection = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

connection.connect(err => console.log('connected: ' + connection.threadId + ' error: ' + err))

console.log(new Date().toString(), 'Server started up')

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })

  console.log(new Date().toString(), `New request: ${JSON.stringify(req.headers)}`)

  connection.query('select mydata from deleteme', (e, r, f) => {
    console.log('Database response', { e, r, f })
    res.end(JSON.stringify({ e, r, f }))
  })
})

server.listen()
