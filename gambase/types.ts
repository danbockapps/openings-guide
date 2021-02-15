export interface GamePlayer {
  username: string
  rating: number
  result:
    | 'win'
    | 'checkmated'
    | 'agreed'
    | 'repetition'
    | 'timeout'
    | 'resigned'
    | 'stalemate'
    | 'lose'
    | 'insufficient'
    | '50move'
    | 'abandoned'
}

export interface Game {
  white: GamePlayer
  black: GamePlayer
  url: string
  fen: string
  pgn: string
  start_time: number
  end_time: number
  time_control: string
  rules: string
  eco: string
  tournament: string
  match: string
}
