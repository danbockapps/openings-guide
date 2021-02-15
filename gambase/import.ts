import axios from 'axios'
import { createConnection } from 'mysql'
import { Game } from './types'
import util from 'util'
require('dotenv').config()

const connection = createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

connection.connect(err => console.log('connected: ' + connection.threadId + ' error: ' + err))

const runImport = async () => {
  console.time('get')
  const games = await getGames('DanBock', '2015', '01')
  console.timeEnd('get')
  const result = await insertGames(games)
  console.log(result)
  connection.end()
}

const getGames = (username: string, year: string, month: string) =>
  axios
    .get<{ games: Game[] }>(`https://api.chess.com/pub/player/${username}/games/${year}/${month}`)
    .then(response =>
      response.data.games
        .filter((_g, i) => i < 1)
        .map(g => {
          const { pgn, ...rest } = g
          return [Number(g.url.split('/').pop()), pgn, JSON.stringify(rest)] as const
        }),
    )

const insertGames = (gamesForDb: (readonly [number, string, string])[]) =>
  new Promise((resolve, reject) =>
    connection.query(
      'insert ignore into games (game_id, pgn, raw_json) values ?',
      [gamesForDb],
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      },
    ),
  )

runImport()

/*
    response.data.games
      .filter((_g, i) => i < 10)
      .forEach(g => {
        const originalGame = new Chess()
        originalGame.load_pgn(g.pgn)

        const replay = new Chess()
        const fens: string[] = originalGame.history().map(move => {
          replay.move(move)
          return replay.fen()
        })

        console.log(fens)
      })*/
