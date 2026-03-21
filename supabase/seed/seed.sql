begin;

truncate table deutschland_rounds, memory_sessions, sound_items, media_items, buzzer_events, scores, game_states, games, team_members, teams, events restart identity cascade;

insert into events (id, name, slug, status)
values ('11111111-1111-1111-1111-111111111111', 'Schlag den Paul - Demo Event', 'demo-event', 'live');

insert into teams (id, event_id, name, color, sort_order)
values
  ('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Team Nord', '#00C2FF', 1),
  ('22222222-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Team Süd', '#FF4D6D', 2);

insert into team_members (id, team_id, name, nickname)
values
  ('31111111-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111', 'Anna', 'Ace'),
  ('32222222-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111', 'Lukas', 'Lux'),
  ('33333333-1111-1111-1111-111111111111', '22222222-1111-1111-1111-111111111111', 'Mira', 'M'),
  ('34444444-1111-1111-1111-111111111111', '22222222-1111-1111-1111-111111111111', 'Tobias', 'Tobi');

insert into games (id, event_id, title, slug, game_number, point_value, type, status)
values
  ('41111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Länderumrisse', 'laenderumrisse', 1, 1, 'media_laenderumrisse', 'active'),
  ('42222222-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Spaghetti', 'spaghetti', 2, 2, 'standard', 'planned'),
  ('43333333-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Blamieren oder Kassieren', 'blamieren-oder-kassieren', 3, 3, 'standard', 'planned'),
  ('44444444-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Wo liegt was?', 'wo-liegt-was', 4, 4, 'standard', 'planned'),
  ('45555555-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Flaggen', 'flaggen', 5, 5, 'media_flaggen', 'planned'),
  ('46666666-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Golf', 'golf', 6, 6, 'standard', 'planned'),
  ('47777777-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Wer lügt?', 'wer-luegt', 7, 7, 'media_wer_luegt', 'planned'),
  ('48888888-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Biathlon', 'biathlon', 8, 8, 'standard', 'planned'),
  ('49999999-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Luft anhalten', 'luft-anhalten', 9, 9, 'standard', 'planned'),
  ('4aaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Deutschland', 'deutschland', 10, 10, 'deutschland', 'planned'),
  ('4bbbbbbb-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Memory', 'memory', 11, 11, 'memory', 'planned'),
  ('4ccccccc-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '501', '501', 12, 12, 'standard', 'planned'),
  ('4ddddddd-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Wettessen', 'wettessen', 13, 13, 'standard', 'planned'),
  ('4eeeeeee-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Sortieren', 'sortieren', 14, 14, 'media_sortieren', 'planned'),
  ('4fffffff-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Münze', 'muenze', 15, 15, 'standard', 'planned');

insert into game_states (game_id, current_step, reveal_state, timer_state, metadata)
select
  id,
  0,
  false,
  '{"running": false, "startedAt": null, "elapsedMs": 0}'::jsonb,
  '{}'::jsonb
from games
where event_id = '11111111-1111-1111-1111-111111111111';

insert into scores (event_id, team_id, total_points)
values
  ('11111111-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111', 0),
  ('11111111-1111-1111-1111-111111111111', '22222222-1111-1111-1111-111111111111', 0);

insert into media_items (game_id, title, type, asset_url, sort_order, metadata)
select
  '41111111-1111-1111-1111-111111111111',
  country_name,
  'image',
  '/media/laenderumrisse/item-' || lpad(asset_index::text, 2, '0') || '.svg',
  sort_order,
  jsonb_build_object('country', country_name, 'hint', country_name || ' erkennen')
from (
  values
    (1, 'Deutschland', 4),
    (2, 'Brasilien', 1),
    (3, 'Chile', 2),
    (4, 'Dänemark', 3),
    (5, 'Finnland', 5),
    (6, 'Iran', 6),
    (7, 'Island', 7),
    (8, 'Nordkorea', 8),
    (9, 'Norwegen', 9),
    (10, 'Österreich', 10),
    (11, 'Russland', 11),
    (12, 'Schweden', 12),
    (13, 'Spanien', 13),
    (14, 'Türkei', 14),
    (15, 'Ungarn', 15),
    (16, 'Vereinigtes Königreich', 16),
    (17, 'Volksrepublik China', 17)
) as countries(sort_order, country_name, asset_index);

insert into media_items (game_id, title, type, asset_url, sort_order, metadata)
select
  '45555555-1111-1111-1111-111111111111',
  country_name,
  'image',
  '/media/flaggen/' || file_name,
  sort_order,
  jsonb_build_object('country', country_name, 'hint', country_name || ' Flagge')
from (
  values
    (1, 'Bahrain', 'Flag_of_Bahrain.svg.png'),
    (2, 'Kamerun', 'Flag_of_Cameroon.svg.png'),
    (3, 'Tschad', 'Flag_of_Chad.svg.png'),
    (4, 'Côte d''Ivoire', 'Flag_of_Co%CC%82te_d%27Ivoire.svg.png'),
    (5, 'Haiti', 'Flag_of_Haiti.svg.png'),
    (6, 'Libanon', 'Flag_of_Lebanon.svg.png'),
    (7, 'Liechtenstein', 'Flag_of_Liechtenstein.svg.png'),
    (8, 'Nepal', 'Flag_of_Nepal.svg.png'),
    (9, 'Singapur', 'Flag_of_Singapore.svg.png'),
    (10, 'Thailand', 'Flag_of_Thailand.svg.png'),
    (11, 'Vietnam', 'Flag_of_Vietnam.svg.png'),
    (12, 'Sahrauische Arabische Demokratische Republik', 'Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg.png')
) as flags(sort_order, country_name, file_name);

insert into media_items (game_id, title, type, asset_url, sort_order, metadata)
select
  '47777777-1111-1111-1111-111111111111',
  'Aussage ' || s::text,
  'image',
  '/media/wer-luegt/item-' || lpad(s::text, 2, '0') || '.svg',
  s,
  jsonb_build_object('hint', 'Wer-lügt Karte ' || s::text)
from generate_series(1, 12) s;

insert into media_items (game_id, title, type, asset_url, sort_order, metadata)
select
  '4aaaaaaa-1111-1111-1111-111111111111',
  'Deutschland Karte ' || s::text,
  'image',
  '/media/deutschland/item-' || lpad(s::text, 2, '0') || '.svg',
  s,
  jsonb_build_object('hint', 'Deutschland Runde ' || s::text)
from generate_series(1, 10) s;

insert into media_items (game_id, title, type, asset_url, sort_order, metadata)
select
  '4eeeeeee-1111-1111-1111-111111111111',
  'Sortierkarte ' || s::text,
  'image',
  '/media/sortieren/item-' || lpad(s::text, 2, '0') || '.svg',
  s,
  jsonb_build_object('hint', 'Sortieren Runde ' || s::text)
from generate_series(1, 10) s;

insert into sound_items (event_id, title, category, asset_url, sort_order)
values
  ('11111111-1111-1111-1111-111111111111', 'Intro', 'Intro', '/sounds/Intro.mp3', 1),
  ('11111111-1111-1111-1111-111111111111', 'Minigame Intro', 'Intro', '/sounds/Minigame%20Intro.mp3', 2),
  ('11111111-1111-1111-1111-111111111111', 'Tension 01', 'Spannung', '/sounds/Tension%2001.mp3', 3),
  ('11111111-1111-1111-1111-111111111111', 'Tension 02', 'Spannung', '/sounds/Tension%2002.mp3', 4),
  ('11111111-1111-1111-1111-111111111111', 'Konzentrationsspiel', 'Konzentration', '/sounds/Konzentrationsspiel.mp3', 5),
  ('11111111-1111-1111-1111-111111111111', 'Buzzer', 'Buzzer', '/sounds/Buzzer.mp3', 6);

insert into memory_sessions (event_id, game_id, status, board_state, turn_team_id)
values (
  '11111111-1111-1111-1111-111111111111',
  '4bbbbbbb-1111-1111-1111-111111111111',
  'idle',
  '{"pairs": 8, "moves": 0, "layout": "demo"}'::jsonb,
  '21111111-1111-1111-1111-111111111111'
);

insert into deutschland_rounds (event_id, title, city_name, correct_lat, correct_lng, metadata)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Bundesland-Hauptstadt',
    'Erfurt',
    50.9787,
    11.0328,
    '{"difficulty": "mittel"}'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Nord-Süd Einschätzung',
    'Flensburg',
    54.7937,
    9.4469,
    '{"difficulty": "leicht"}'::jsonb
  );

commit;
