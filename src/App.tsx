import axios from 'axios'
import * as ChessJS from 'chess.js'
import { FC, useState } from 'react'
import './App.scss'
import Board from './components/Board'

// https://stackoverflow.com/a/65243150/400765
const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

const App: FC = () => {
  const [history, setHistory] = useState<string[]>([])

  const chess = new Chess()
  history.forEach(move => chess.move(move))

  return (
    <div className="App">
      <Board
        position={chess.fen()}
        onDrop={({ sourceSquare, targetSquare }) => {
          chess.move({ from: sourceSquare, to: targetSquare })
          console.log(chess.fen())
          setHistory(chess.history())

          axios
            .get('https://danbock.net/gambase', { params: { fen: chess.fen() } })
            .then(response => console.log(response.data))
        }}
      />
      <div
        style={{
          background: 'yellow',
          height: '100px',
        }}
      />
    </div>
  )
}

export default App
