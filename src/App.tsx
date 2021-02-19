import axios from 'axios'
import * as ChessJS from 'chess.js'
import { FC, useEffect, useState } from 'react'
import './App.scss'
import Board from './components/Board'
import Goals from './components/Goals'
import { NextMoves } from './types'

// https://stackoverflow.com/a/65243150/400765
const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

const App: FC = () => {
  const [history, setHistory] = useState<string[]>([])
  const [nextMoves, setNextMoves] = useState<NextMoves>()

  const chess = new Chess()
  history.forEach(move => chess.move(move))
  const fen = chess.fen()

  useEffect(() => {
    axios
      .get<NextMoves>('https://danbock.net/gambase', { params: { fen } })
      .then(response => setNextMoves(response.data))
  }, [fen])

  return (
    <div className="App">
      <div>
        <Goals nextMoves={nextMoves?.next5.filter(m => m.color === 'b')} />
        <Board
          position={chess.fen()}
          onDrop={({ sourceSquare, targetSquare }) => {
            chess.move({ from: sourceSquare, to: targetSquare })
            setHistory(chess.history())
          }}
        />
        <Goals nextMoves={nextMoves?.next5.filter(m => m.color === 'w')} />
      </div>
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
