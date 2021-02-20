import axios from 'axios'
import { insertIntoDb, logAndEnd } from './functions'
import { Leaderboards, Player } from './types'

axios
  .get<Leaderboards>('https://api.chess.com/pub/leaderboards')
  .then(response =>
    insertIntoDb<Player>(
      'players',
      response.data.daily
        .concat(response.data.live_rapid, response.data.live_blitz, response.data.live_bullet)
        .map(p => ({
          source: 'chess.com',
          player_id: p.player_id,
          username: p.username,
          title: p.title,
        })),
      true,
    ),
  )
  .then(logAndEnd)
