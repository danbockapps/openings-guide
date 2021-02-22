import axios from 'axios'
import { FC, useEffect, useState } from 'react'
import { NextMove } from '../types'

interface Props {
  nextMoves?: NextMove[]
  onMove: (move: string) => void
  onBack: () => void
  onReset: () => void
}

const MoveList: FC<Props> = props => {
  const [hover, setHover] = useState<number>()
  const [totalGames, setTotalGames] = useState<number>()

  useEffect(() => {
    axios.get<number>('https://danbock.net/gambase?totalGames').then(r => setTotalGames(r.data))
  }, [])

  return (
    <div>
      {totalGames ? totalGames + ' total master games ' : ' '}
      <button onClick={props.onBack}>back</button>
      <button onClick={props.onReset}>reset</button>
      <table className="move-list">
        <tbody>
          {props.nextMoves?.map((n, i) => (
            <tr
              key={i}
              className={hover === i ? 'hover' : undefined}
              onMouseOver={() => setHover(i)}
              onMouseOut={() => setHover(undefined)}
              onClick={() => props.onMove(n.move)}
            >
              <td>{n.move}</td>
              <td>{n.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MoveList
