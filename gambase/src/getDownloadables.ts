import axios from 'axios'
import { insertIntoDb, logAndEnd, selectFromDb } from './functions'

const run = async () => {
  const randomPlayer = await selectFromDb<{ username: string }>(`
    select p.username
    from players p left join downloadables d on d.url like concat("%", p.username, "%")
    where d.id is null
    order by rand()
    limit 1`)

  console.log(`Getting downloadables for ${randomPlayer[0].username}`)

  await axios
    .get<{ archives: string[] }>(
      `https://api.chess.com/pub/player/${randomPlayer[0].username}/games/archives`,
    )
    .then(response =>
      insertIntoDb<{ url: string }>(
        'downloadables',
        response.data.archives.map(url => ({ url })),
        true,
      ),
    )
    .then(logAndEnd)
}

run()
