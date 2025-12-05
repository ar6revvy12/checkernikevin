-- Regression tests table for tracking regression testing
create table public.regression_tests (
  id text not null,
  game_id text not null,
  test_id text not null,
  test_case_description text not null,
  priority text not null default 'medium',
  expected_result text not null,
  actual_result text not null,
  status text not null default 'pass',
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
  constraint regression_tests_pkey primary key (id),
  constraint regression_tests_game_id_fkey foreign KEY (game_id) references games (id) on delete CASCADE,
  constraint regression_tests_status_check check (
    (
      status = any (
        array[
          'pass'::text,
          'fail'::text
        ]
      )
    )
  ),
  constraint regression_tests_priority_check check (
    (
      priority = any (
        array[
          'low'::text,
          'medium'::text,
          'high'::text,
          'critical'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_regression_tests_game_id on public.regression_tests using btree (game_id) TABLESPACE pg_default;
create index IF not exists idx_regression_tests_created_at on public.regression_tests using btree (created_at desc) TABLESPACE pg_default;
create index IF not exists idx_regression_tests_status on public.regression_tests using btree (status) TABLESPACE pg_default;
create index IF not exists idx_regression_tests_priority on public.regression_tests using btree (priority) TABLESPACE pg_default;
