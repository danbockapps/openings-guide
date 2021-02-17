import { Connection, escape } from 'mysql'
import { NextMove } from './types'

export function selectFromDb<T>(connection: Connection, query: string): Promise<T[]> {
  return new Promise((resolve, reject) =>
    connection.query(query, (error, result) => (error ? reject(error) : resolve(result))),
  )
}

export const getNextMoves = async (connection: Connection, fen: string, n: number) => {
  const qr = await selectFromDb<NextMove>(
    connection,
    `
      select fen,
        move,
        color,
      count(*) as count
      from (
        select f.fen,
          b2.move_number,
          b2.move,
          b2.color
        from game_fen_bridge b1
          inner join fens f on b1.fen_id = f.fen_id
          inner join game_fen_bridge b2 on b1.game_id = b2.game_id
        where b2.ply > b1.ply
          and b2.ply < b1.ply + ${n * 2}
      ) d1
      where fen = ${escape(fen)}
      group by fen,
        move,
        color
      order by count(*) desc;
    `,
  )

  return qr.map(nm => ({ move: nm.move, color: nm.color, count: nm.count }))
}
