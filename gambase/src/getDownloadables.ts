import axios from 'axios'
import { insertIntoDb, logAndEnd } from './functions'

if (!process.argv[2]) throw new Error('No user specified.')

axios
  .get<{ archives: string[] }>(`https://api.chess.com/pub/player/${process.argv[2]}/games/archives`)
  .then(response =>
    insertIntoDb<{ url: string }>(
      'downloadables',
      response.data.archives.map(url => ({ url })),
      true,
    ),
  )
  .then(logAndEnd)
