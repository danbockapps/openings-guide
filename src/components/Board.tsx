import { Square } from 'chess.js'
import Chessboard from 'chessboardjsx'
import { FC } from 'react'

interface Props {
  position: string
  onDrop: (obj: { sourceSquare: Square; targetSquare: Square }) => void
}

const Board: FC<Props> = props => {
  return (
    <Chessboard
      position={props.position}
      calcWidth={({ screenWidth, screenHeight }) => {
        if (screenHeight > screenWidth) /* vertical orientation */ return screenWidth
        else if (screenWidth - 300 < screenHeight) /* horiz but squarish */ return screenWidth - 300
        else return screenHeight
      }}
      onDrop={props.onDrop}
    />
  )
}

export default Board
