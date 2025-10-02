-- Seed one active test version for each application step for the current month
-- and generate 50 placeholder questions per version.

with steps(step_id, step_title) as (
  values
    ('prerequisites', 'Prerequisites'),
    ('oacp', 'OACP Certificate'),
    ('pre-application-prep', 'Pre-Application Prep'),
    ('application', 'Application'),
    ('prep-fitness-test', 'PREP Fitness Test'),
    ('lfi-interview', 'Local Focus Interview (LFI)'),
    ('eci-panel-interview', 'ECI/Panel Interview'),
    ('background-check', 'Background Check'),
    ('final-steps', 'Final Steps')
),
ins as (
  insert into public.test_versions (step_id, title, published_at, is_active)
  select 
    step_id,
    step_title || ' — ' || to_char(date_trunc('month', now()), 'Mon YYYY') as title,
    date_trunc('month', now()) as published_at,
    true as is_active
  from steps
  returning id as version_id, step_id
)
insert into public.test_questions (version_id, order_index, prompt, choices, correct_index)
select 
  ins.version_id,
  gs as order_index,
  ins.step_id || ' — Question ' || gs as prompt,
  '["A","B","C","D"]'::jsonb as choices,
  ((gs - 1) % 4) as correct_index
from ins
cross join generate_series(1, 50) as gs;


