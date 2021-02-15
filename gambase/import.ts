import axios from 'axios'
import { createConnection } from 'mysql'
import { Game } from './types'
require('dotenv').config()

const connection = createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

connection.connect(err => console.log('connected: ' + connection.threadId + ' error: ' + err))

axios
  .get<{ games: Game[] }>('https://api.chess.com/pub/player/DanBock/games/2015/01')
  .then(response => {
    const gamesforDb = response.data.games
      .filter((_g, i) => i < 10)
      .map(g => {
        const { pgn, ...rest } = g
        return [Number(g.url.split('/').pop()), pgn, JSON.stringify(rest)]
      })
    console.log(gamesforDb.map(g => g[0]))

    connection.query(
      'insert into games (game_id, pgn, raw_json) values ?',
      [gamesforDb],
      (error, result) => {
        if (error) throw error
        else console.log(result)
      },
    )
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

    connection.end()
  })
