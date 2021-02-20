import { Connection, escape, OkPacket } from 'mysql'
import { NextMove } from './types'

const START_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export function selectFromDb<T>(connection: Connection, query: string): Promise<T[]> {
  return new Promise((resolve, reject) =>
    connection.query(query, (error, result) => (error ? reject(error) : resolve(result))),
  )
}

export const insertIntoDb = <T = { [columnName: string]: string | number | undefined }>(
  connection: Connection,
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

export const getNextMoves = async (connection: Connection, fen: string, n: number) => {
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

  const qr = await selectFromDb<NextMove>(connection, query)

  return qr.map(nm => ({ move: nm.move, color: nm.color, count: nm.count }))
}
