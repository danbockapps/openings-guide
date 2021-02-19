import { FC } from 'react'
import { AppContext } from '../App'
import { NextMove } from '../types'

interface Props {
  move: NextMove
}

const Goal: FC<Props> = props => (
  <div className={`goal ${props.move.color === 'b' ? 'black-goal' : 'white-goal'}`}>
    <div className="move">{props.move.move}</div>
    <div>
      <span style={{ fontSize: 'larger' }}>
        <AppContext.Consumer>
          {({ totalGames }) => Math.round((props.move.count * 100) / totalGames) + '%'}
        </AppContext.Consumer>
      </span>
      <br />
      <span style={{ fontSize: 'smaller' }}>of games</span>
    </div>
  </div>
)

export default Goal
