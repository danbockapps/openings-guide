import axios from 'axios'
import { createConnection } from 'mysql'
import { Game } from './types'
import { Chess } from 'chess.js'
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
  const games = await getGames('Hikaru', '2015', '02')
  console.timeEnd('get')
  const result = await insertIntoDb('games', games)
  console.log(result)
  connection.end()
}

const getGames = (username: string, year: string, month: string) =>
  axios
    .get<{ games: Game[] }>(`https://api.chess.com/pub/player/${username}/games/${year}/${month}`)
    .then(response =>
      response.data.games
        .filter((_g, i) => i < 5)
        .map(g => {
          const { pgn, ...rest } = g
          return { game_id: Number(g.url.split('/').pop()), pgn, raw_json: JSON.stringify(rest) }
        }),
    )

const insertIntoDb = (table: string, data: { [columnName: string]: string | number }[]) =>
  new Promise((resolve, reject) => {
    const keys = Object.keys(data[0])

    connection.query(
      `insert ignore into ${table} (${keys.join(',')}) values ?`,
      [data.map(d => keys.map(k => d[k]))],
      (error, result) => (error ? reject(error) : resolve(result)),
    )
  })
/*
const insertFens = async (gamesForDb: (readonly [number, string, string])[]) =>
  new Promise((resolve, reject) => {
    const allFens = []

    gamesForDb
      .filter((_g, i) => i < 10)
      .forEach(g => {
        const originalGame = new Chess()
        originalGame.load_pgn(g[1])

        const replay = new Chess()
        const fens: string[] = originalGame.history().map(move => {
          replay.move(move)
          return replay.fen()
        })

        console.log(fens)
      })
  })
  */

runImport()
