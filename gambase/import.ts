import axios from 'axios'
import { createConnection, escape, OkPacket } from 'mysql'
import { BridgeForDb, Game, GameForDb } from './types'
import { Chess } from 'chess.js'
import { selectFromDb } from './functions'
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
  const result = await insertIntoDb('games', games, true)
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

const insertIntoDb = (
  table: string,
  data: { [columnName: string]: string | number }[],
  ignore?: boolean,
): Promise<OkPacket> =>
  new Promise((resolve, reject) => {
    const keys = Object.keys(data[0])

    connection.query(
      `insert ${ignore ? 'ignore' : ''} into ${table} (${keys.join(',')}) values ?`,
      [data.map(d => keys.map(k => d[k]))],
      (error, result) => (error ? reject(error) : resolve(result)),
    )
  })

const getFenId = async (fen: string) => {
  const existingFen = await selectFromDb<{ fen_id: number }>(
    connection,
    `select fen_id from fens where fen=${escape(fen)}`,
  )

  if (existingFen[0]?.fen_id) return existingFen[0].fen_id
  else {
    const packet = await insertIntoDb('fens', [{ fen }], true)
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

    const result = await insertIntoDb('game_fen_bridge', bridgeData)
    console.log(`Result for game ${g.game_id}: ${JSON.stringify(result)}`)
  }
}

runImport()
