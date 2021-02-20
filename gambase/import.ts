import axios from 'axios'
import { Chess } from 'chess.js'
import { createConnection, escape } from 'mysql'
import { insertIntoDb, selectFromDb } from './functions'
import { BridgeForDb, Game, GameForDb } from './types'
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
  const games = await getGames('Hikaru', '2014', '01')
  console.timeEnd('get')
  const result = await insertIntoDb(connection, 'games', games, true)
  console.log(result)

  await insertFens(games)

  connection.end()
}

const getGames = (username: string, year: string, month: string): Promise<GameForDb[]> =>
  axios
    .get<{ games: Game[] }>(`https://api.chess.com/pub/player/${username}/games/${year}/${month}`)
    .then(response =>
      response.data.games.map(g => {
        const { pgn, ...rest } = g
        return { game_id: Number(g.url.split('/').pop()), pgn, raw_json: JSON.stringify(rest) }
      }),
    )

const getFenId = async (fen: string) => {
  const existingFen = await selectFromDb<{ fen_id: number }>(
    connection,
    `select fen_id from fens where fen=${escape(fen)}`,
  )

  if (existingFen[0]?.fen_id) return existingFen[0].fen_id
  else {
    const packet = await insertIntoDb(connection, 'fens', [{ fen }], true)
    return packet.insertId
  }
}

const insertFens = async (gamesForDb: GameForDb[]) => {
  for (const g of gamesForDb) {
    const originalGame = new Chess()
    originalGame.load_pgn(g.pgn)

    const replay = new Chess()
    const fens = originalGame.history({ verbose: true }).map((move, i) => {
      replay.move(move.san)
      return {
        game_id: g.game_id,
        fen: replay.fen(),
        move: move.san,
        move_number: Math.floor(i / 2) + 1,
        ply: i + 1,
        color: move.color,
      }
    })

    const bridgeData: BridgeForDb[] = []

    for (const fenObj of fens) {
      const { fen, ...rest } = fenObj
      const fen_id = await getFenId(fen)
      bridgeData.push({ fen_id, ...rest })
    }

    const result = await insertIntoDb(connection, 'game_fen_bridge', bridgeData)
    console.log(`Result for game ${g.game_id}: ${JSON.stringify(result)}`)
  }
}

runImport()
