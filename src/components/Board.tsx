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
      onDrop={({ sourceSquare, targetSquare }) => {
        chess.move({ from: sourceSquare, to: targetSquare })
        console.log(chess.fen())
        setHistory(chess.history())
      }}
    />
  )
}

export default Board
