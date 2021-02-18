import http from 'http'
import { createConnection } from 'mysql'
import { parse } from 'querystring'
import { getNextMoves } from './functions'
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
  console.log(new Date().toString(), `New request: ${req.url}`)

  const { fen } = parse(req.url?.split('?')[1] || '')

  if (typeof fen !== 'string') {
    res.writeHead(400)
    res.end()
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    Promise.all([getNextMoves(connection, fen, 1), getNextMoves(connection, fen, 5)]).then(r =>
      res.end(JSON.stringify({ next1: r[0], next5: r[1] })),
    )
  }
})

server.listen()
