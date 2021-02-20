import axios from 'axios'
import { Chess } from 'chess.js'
import { escape } from 'mysql'
import { end, insertIntoDb, selectFromDb } from './functions'
import { BridgeForDb, Game, GameForDb } from './types'

const runImport = async () => {
  console.time('db')
  const downloadables = await selectFromDb<{ url: string }>(
    'select url from downloadables where added is null',
  )
  console.timeEnd('db')

  console.time('get')
  const games = await getGames(downloadables[Math.floor(Math.random() * downloadables.length)].url)
  console.timeEnd('get')
  const result = await insertIntoDb('games', games, true)
  console.log(result)

  await insertFens(games)

  end()
}

const getGames = (url: string): Promise<GameForDb[]> =>
  axios.get<{ games: Game[] }>(url).then(response =>
    response.data.games.map(g => {
      const { pgn, ...rest } = g
      return { game_id: Number(g.url.split('/').pop()), pgn, raw_json: JSON.stringify(rest) }
    }),
  )

const getFenId = async (fen: string) => {
  const existingFen = await selectFromDb<{ fen_id: number }>(
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
