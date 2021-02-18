import './App.scss'
import Board from './components/Board'

function App() {
  return (
    <div className="App">
      <Board />
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
