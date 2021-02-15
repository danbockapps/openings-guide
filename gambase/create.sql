create table games (
  game_id bigint unsigned primary key,
  pgn text,
  raw_json text
);
create table fens (
  fen_id bigint unsigned auto_increment primary key,
  fen varchar(500)
);
create table game_fen_bridge (
  id bigint unsigned auto_increment primary key,
  game_id bigint unsigned,
  fen_id bigint unsigned,
  move varchar(6),
  move_number tinyint unsigned,
  constraint foreign key (game_id) references games (game_id),
  constraint foreign key (fen_id) references fens (fen_id)
);