import axios from 'axios'
import * as ChessJS from 'chess.js'
import Chessboard from 'chessboardjsx'
import { FC, useState } from 'react'

// https://stackoverflow.com/a/65243150/400765
const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

const Board: FC = () => {
  const [history, setHistory] = useState<string[]>([])

  const chess = new Chess()
  history.forEach(move => chess.move(move))

  return (
    <Chessboard
      position={chess.fen()}
      calcWidth={({ screenWidth, screenHeight }) => {
        if (screenHeight > screenWidth) /* vertical orientation */ return screenWidth
        else if (screenWidth - 300 < screenHeight) /* horiz but squarish */ return screenWidth - 300
        else return screenHeight
      }}
      onDrop={({ sourceSquare, targetSquare }) => {
        chess.move({ from: sourceSquare, to: targetSquare })
        console.log(chess.fen())
        setHistory(chess.history())

        axios
          .get('https://danbock.net/gambase', { params: { fen: chess.fen() } })
          .then(response => console.log(response.data))
      }}
    />
  )
}

export default Board
