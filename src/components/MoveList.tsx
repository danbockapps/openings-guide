import { FC } from 'react'
import { NextMove } from '../types'

interface Props {
  nextMoves?: NextMove[]
}

const MoveList: FC<Props> = props => (
  <div className="move-list">
    {props.nextMoves?.map((n, i) => (
      <div key={i}>{n.move}</div>
    ))}
  </div>
)

export default MoveList
