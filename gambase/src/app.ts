import http, { ServerResponse } from 'http'
import { parse } from 'querystring'
import { getNextMoves, getTotalGames } from './functions'

console.log(new Date().toString(), 'Server started up')

const server = http.createServer((req, res) => {
  console.time(req.url)
  console.log(new Date().toString(), `New request: ${req.url}`)

  const { fen } = parse(req.url?.split('?')[1] || '')
  const totalGames = req.url?.includes('totalGames')

  if (totalGames) getTotalGames().then(r => success(res, r[0]?.count, req.url))
  else if (typeof fen === 'string')
    Promise.all([getNextMoves(fen, 1), getNextMoves(fen, 5)]).then(r =>
      success(res, { next1: r[0], next5: r[1] }, req.url),
    )
  else {
    res.writeHead(400)
    res.end()
  }
})

const success = (res: ServerResponse, value: any, url?: string) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(value))
  console.timeEnd(url)
}

server.listen()
