import { FC } from 'react'

interface Props {
  move: string
}

const Goal: FC<Props> = props => <div>{props.move}</div>

export default Goal
