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

export type GameForDb = {
  game_id: number
  pgn: string
  raw_json: string
}

export type BridgeForDb = {
  game_id: number
  fen_id: number
  move: string
  move_number: number
  color: 'w' | 'b'
}

export type NextMove = {
  fen: string
  move: string
  color: 'w' | 'b'
  count: number
}

type Source = 'chess.com'

export type Player = {
  source: Source
  player_id: number
  username: string
  title?: 'GM' | 'IM' | 'FM' | 'NM' | 'WGM' | 'WIM' | 'WFM'
}

export type Leaderboards = {
  daily: Player[]
  live_rapid: Player[]
  live_blitz: Player[]
  live_bullet: Player[]
}
