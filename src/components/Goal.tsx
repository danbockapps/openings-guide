import { FC } from 'react'
import { NextMove } from '../types'

interface Props {
  move: NextMove
}

const Goal: FC<Props> = props => (
  <div className={`goal ${props.move.color === 'b' ? 'black-goal' : 'white-goal'}`}>
    <div className="move">{props.move.move}</div>
    <div>
      {props.move.count}
      <br />
      games
    </div>
  </div>
)

export default Goal
