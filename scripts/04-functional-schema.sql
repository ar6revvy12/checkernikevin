-- Functional tests table for tracking functional testing
create table public.functional_tests (
  id text not null,
  game_id text not null,
  test_case_id text not null,
  module text not null,
  test_scenario text not null,
  precondition text null,
  test_steps text not null,
  expected_result text not null,
  status text not null default 'not-running',
  comments text null,
  created_at bigint not null,
  updated_at bigint not null default (
    (
      EXTRACT(
        epoch
        from
          now()
      )
    )::bigint * 1000
  ),
  constraint functional_tests_pkey primary key (id),
  constraint functional_tests_game_id_fkey foreign KEY (game_id) references games (id) on delete CASCADE,
  constraint functional_tests_status_check check (
    (
      status = any (
        array[
          'running'::text,
          'not-running'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_functional_tests_game_id on public.functional_tests using btree (game_id) TABLESPACE pg_default;
create index IF not exists idx_functional_tests_created_at on public.functional_tests using btree (created_at desc) TABLESPACE pg_default;
create index IF not exists idx_functional_tests_status on public.functional_tests using btree (status) TABLESPACE pg_default;
create index IF not exists idx_functional_tests_module on public.functional_tests using btree (module) TABLESPACE pg_default;
