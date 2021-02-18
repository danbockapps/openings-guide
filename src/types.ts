export interface NextMove {
  move: string
  color: 'w' | 'b'
  count: number
}

export interface NextMoves {
  next1: NextMove[]
  next5: NextMove[]
}
