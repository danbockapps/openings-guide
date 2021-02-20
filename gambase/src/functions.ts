import { createConnection, escape, OkPacket } from 'mysql'
import { NextMove } from './types'
require('dotenv').config()

let environment: 'cli' | 'web'
const {
  SCRIPT_URI,
  PASSENGER_APP_ENV,
  SSH_CONNECTION,
  SSH_CLIENT,
  DB_USER,
  DB_USER_READONLY,
  DB_PASSWORD,
  DB_PASSWORD_READONLY,
  DB_NAME,
} = process.env

if (SCRIPT_URI && PASSENGER_APP_ENV && !SSH_CONNECTION && !SSH_CLIENT) environment = 'web'
else if (!SCRIPT_URI && !PASSENGER_APP_ENV && SSH_CONNECTION && SSH_CLIENT) environment = 'cli'
else throw new Error('Could not determine environment')

const [user, password] =
  environment === 'web' ? [DB_USER_READONLY, DB_PASSWORD_READONLY] : [DB_USER, DB_PASSWORD]

const connection = createConnection({ host: 'localhost', user, password, database: DB_NAME })
connection.connect(err => console.log('connected: ' + connection.threadId + ' error: ' + err))

export const end = () => connection.end()

const START_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export function selectFromDb<T>(query: string): Promise<T[]> {
  return new Promise((resolve, reject) =>
    connection.query(query, (error, result) => (error ? reject(error) : resolve(result))),
  )
}

export const insertIntoDb = <T = { [columnName: string]: string | number | undefined }>(
  table: string,
  data: T[],
  ignore?: boolean,
): Promise<OkPacket> =>
  new Promise((resolve, reject) => {
    const keys = Object.keys(data[0]) as (keyof T)[]

    connection.query(
      `insert ${ignore ? 'ignore' : ''} into ${table} (${keys.join(',')}) values ?`,
      [data.map(d => keys.map(k => d[k]))],
      (error, result) => (error ? reject(error) : resolve(result)),
    )
  })

export const getNextMoves = async (fen: string, n: number) => {
  const query =
    fen === START_POSITION
      ? `
          select move, color, count(*) as count
          from game_fen_bridge
          where move_number <= ${n} ${n === 1 ? 'and color = "w"' : ''}
          group by move, color
          order by count(*) desc`
      : `
          select fen, move, color, count(*) as count
          from (
            select f.fen, b2.move_number, b2.move, b2.color
            from game_fen_bridge b1
              inner join fens f on b1.fen_id = f.fen_id
              inner join game_fen_bridge b2 on b1.game_id = b2.game_id
            where b2.ply > b1.ply and b2.ply < b1.ply + ${n * 2}
          ) d1
          where fen = ${escape(fen)}
          group by fen, move, color
          order by count(*) desc`

  const qr = await selectFromDb<NextMove>(query)

  return qr.map(nm => ({ move: nm.move, color: nm.color, count: nm.count }))
}
