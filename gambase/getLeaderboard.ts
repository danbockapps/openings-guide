import axios from 'axios'
import { createConnection } from 'mysql'
import { insertIntoDb } from './functions'
import { Leaderboards, Player } from './types'
require('dotenv').config()

const connection = createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

connection.connect(err => console.log('connected: ' + connection.threadId + ' error: ' + err))

axios
  .get<Leaderboards>('https://api.chess.com/pub/leaderboards')
  .then(response =>
    insertIntoDb<Player>(
      connection,
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
  .then(response => {
    console.log(response)
    connection.end()
  })
