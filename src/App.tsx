import axios from 'axios'
import * as ChessJS from 'chess.js'
import { createContext, FC, useEffect, useState } from 'react'
import Board from './components/Board'
import Goals from './components/Goals'
import MoveList from './components/MoveList'
import './styles/App.scss'
import { NextMoves } from './types'

// https://stackoverflow.com/a/65243150/400765
const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

export const AppContext = createContext({ totalGames: 0 })

const App: FC = () => {
  const [history, setHistory] = useState<string[]>([])
  const [nextMoves, setNextMoves] = useState<NextMoves>()

  const chess = new Chess()
  history.forEach(move => chess.move(move))
  const split = chess.fen().split(' ')
  const fen = split.filter((_k, i) => i < split.length - 3).join(' ')

  useEffect(() => {
    // TODO error handling
    axios
      .get<NextMoves>('https://danbock.net/gambase', { params: { fen } })
      .then(response => setNextMoves(response.data))
  }, [fen])

  return (
    <AppContext.Provider
      value={{ totalGames: nextMoves?.next1.reduce((acc, cur) => acc + cur.count, 0) || 1 }}
    >
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
        <MoveList
          nextMoves={nextMoves?.next1}
          onMove={move => setHistory(history.concat(move))}
          onBack={() => setHistory(history.filter((_m, i) => i < history.length - 1))}
          onReset={() => setHistory([])}
        />
      </div>
    </AppContext.Provider>
  )
}

export default App
