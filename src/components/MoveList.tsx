import { FC, useState } from 'react'
import { NextMove } from '../types'

interface Props {
  nextMoves?: NextMove[]
}

const MoveList: FC<Props> = props => {
  const [hover, setHover] = useState<number>()

  return (
    <table className="move-list">
      <tbody>
        {props.nextMoves?.map((n, i) => (
          <tr
            key={i}
            className={hover === i ? 'hover' : undefined}
            onMouseOver={() => setHover(i)}
            onMouseOut={() => setHover(undefined)}
          >
            <td>{n.move}</td>
            <td>{n.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default MoveList
