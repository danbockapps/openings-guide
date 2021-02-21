create table games (
  game_id bigint unsigned primary key,
  pgn text,
  white_username varchar(50),
  white_rating int,
  black_username varchar(50),
  black_rating int,
  result varchar(20),
  raw_json text
);

create table fens (
  fen_id bigint unsigned auto_increment primary key,
  fen varchar(140) unique
);

create table game_fen_bridge (
  id bigint unsigned auto_increment primary key,
  game_id bigint unsigned,
  fen_id bigint unsigned,
  move varchar(7),
  move_number tinyint unsigned,
  ply tinyint unsigned,
  color enum('w', 'b'),
  constraint foreign key (game_id) references games (game_id),
  constraint foreign key (fen_id) references fens (fen_id),
  unique(game_id, fen_id, ply),
  unique(game_id, fen_id, move_number)
);

create table players (
  source enum('chess.com') not null,
  player_id bigint unsigned not null,
  username varchar(50) not null,
  title enum(
    'GM',
    'IM',
    'FM',
    'NM',
    'WGM',
    'WIM',
    'WFM'
  ),
  unique(source, player_id),
  unique(source, username)
);

create table downloadables (
  id bigint unsigned auto_increment primary key,
  url varchar(200) not null unique,
  added_start datetime,
  added_end datetime
);

-- Utility for finding most popular fens
select
  fen,
  count(*)
from
  fens f
  inner join game_fen_bridge g on f.fen_id = g.fen_id
group by
  fen
order by
  count(*) desc
limit
  25;