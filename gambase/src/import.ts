import axios from 'axios'
import { Chess } from 'chess.js'
import { escape } from 'mysql'
import { end, insertIntoDb, selectFromDb } from './functions'
import { BridgeForDb, Game, GameForDb } from './types'

const runImport = async () => {
  console.time('db')
  const downloadables = await selectFromDb<{ url: string }>(`
    select url
    from downloadables
    where
      added_start is null and
      added_end is null and
      url not like "%${new Date().getFullYear()}/${`0${new Date().getMonth() + 1}`.slice(-2)}%"`)
  console.timeEnd('db')

  const { url } = downloadables[Math.floor(Math.random() * downloadables.length)]
  console.log('Importing games from ' + url)

  await selectFromDb('update downloadables set added_start = now() where url = ' + escape(url))

  console.time('get')
  const games = await getGames(url)
  console.timeEnd('get')
  const result = await insertIntoDb('games', games, true)
  console.log(result)

  await insertFens(games)
  await selectFromDb('update downloadables set added_end = now() where url = ' + escape(url))

  end()

  console.log('Done importing games from ' + url)
}

const getGames = (url: string): Promise<GameForDb[]> =>
  axios.get<{ games: Game[] }>(url).then(response =>
    response.data.games
      .filter(g => g.rules === 'chess')
      .map(g => {
        const { pgn, ...rest } = g
        return {
          game_id: Number(g.url.split('/').pop()),
          pgn,
          white_username: g.white.username,
          white_rating: g.white.rating,
          black_username: g.black.username,
          black_rating: g.black.rating,
          result: pgn.slice(pgn.lastIndexOf(' ') + 1),
          raw_json: JSON.stringify(rest),
        }
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
    console.log(`Starting game   ${g.game_id}`)
    const originalGame = new Chess()
    originalGame.load_pgn(g.pgn)

    const replay = new Chess()
    const fens = originalGame.history({ verbose: true }).map((move, i) => {
      replay.move(move.san)

      const split = replay.fen().split(' ')
      const fen = split.filter((_k, i) => i < split.length - 3).join(' ')

      return {
        game_id: g.game_id,
        fen,
        move: move.san,
        move_number: Math.floor(i / 2) + 1,
        ply: i + 1,
        color: move.color,
      }
    })

    if (fens.length > 0) {
      const bridgeData: BridgeForDb[] = []

      for (const fenObj of fens) {
        const { fen, ...rest } = fenObj
        const fen_id = await getFenId(fen)
        bridgeData.push({ fen_id, ...rest })
      }

      const result = await insertIntoDb('game_fen_bridge', bridgeData)
      console.log(`Result for game ${g.game_id}: ${JSON.stringify(result)}`)
    } else console.log('Number of moves is 0.')
  }
}

runImport()
