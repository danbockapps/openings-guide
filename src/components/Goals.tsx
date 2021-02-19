import { FC } from 'react'
import { NextMove } from '../types'
import Goal from './Goal'

interface Props {
  nextMoves?: NextMove[]
}

const Goals: FC<Props> = props => (
  <div className="goals">{props.nextMoves?.map((k, i) => i < 6 && <Goal key={i} move={k} />)}</div>
)

export default Goals
