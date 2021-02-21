import { Square } from 'chess.js'
import Chessboard from 'chessboardjsx'
import { FC } from 'react'

interface Props {
  position: string
  onDrop: (obj: { sourceSquare: Square; targetSquare: Square }) => void
}

const Board: FC<Props> = props => (
  <Chessboard
    key={Math.random() /* Hack to make back button work. Breaks animation though. */}
    position={props.position}
    calcWidth={d => (d.screenHeight - 178 > d.screenWidth ? d.screenWidth : d.screenHeight - 178)}
    onDrop={props.onDrop}
  />
)

export default Board
