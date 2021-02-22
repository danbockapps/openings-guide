import http from 'http'
import { parse } from 'querystring'
import { getNextMoves, getTotalGames } from './functions'

console.log(new Date().toString(), 'Server started up')

const server = http.createServer((req, res) => {
  console.time(req.url)
  console.log(new Date().toString(), `New request: ${req.url}`)

  const { fen } = parse(req.url?.split('?')[1] || '')
  const totalGames = req.url?.includes('totalGames')

  if (totalGames) {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    getTotalGames().then(r => {
      res.end(JSON.stringify(r[0]?.count))
      console.timeEnd(req.url)
    })
  } else if (typeof fen !== 'string') {
    res.writeHead(400)
    res.end()
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    Promise.all([getNextMoves(fen, 1), getNextMoves(fen, 5)]).then(r => {
      res.end(JSON.stringify({ next1: r[0], next5: r[1] }))
      console.timeEnd(req.url)
    })
  }
})

server.listen()
