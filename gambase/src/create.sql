create table games (
  game_id bigint unsigned primary key,
  pgn text,
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
  constraint foreign key (fen_id) references fens (fen_id)
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
  added datetime
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