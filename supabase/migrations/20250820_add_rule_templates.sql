-- Seed additional benchmark rules (anchors and supporting). Safe to re-run.

-- Education
insert into public.benchmark_rules (category_key, rule_key, description, is_anchor, is_unwritten, active)
values
  ('education','education.postgrad_credential','Postgraduate credential (Masters/PhD/Grad Cert)', true, false, true),
  ('education','education.canadian_equivalency','Foreign credential assessed as Canadian-equivalent (e.g., WES)', false, false, true),
  ('education','education.recency_credential_5y','Highest credential earned within last 5 years', false, false, true)
on conflict do nothing;

-- Work Experience
insert into public.benchmark_rules (category_key, rule_key, description, is_anchor, is_unwritten, active)
values
  ('work','work.frontline_public_safety_12m','12+ months in frontline public-safety adjacent role', true, false, true),
  ('work','work.supervisor_reference_present','At least one supervisor reference from current/last 12 months', false, false, true),
  ('work','work.incident_reports_monthly_4','≥ 4 incident reports per month on average', false, false, true),
  ('work','work.community_interactions_high','High volume public interaction (retail/hospitality/call centre)', false, false, true)
on conflict do nothing;

-- Volunteer Experience
insert into public.benchmark_rules (category_key, rule_key, description, is_anchor, is_unwritten, active)
values
  ('volunteer','volunteer.background_checked_role','Volunteer role requiring VSS/background check', false, false, true),
  ('volunteer','volunteer.recency_3mo_24h','≥ 24 hours in last 3 months (recency signal)', false, false, true),
  ('volunteer','volunteer.team_lead_hours_20','≥ 20 hours in lead/coordination roles', false, false, true)
on conflict do nothing;

-- Certifications & Skills
insert into public.benchmark_rules (category_key, rule_key, description, is_anchor, is_unwritten, active)
values
  ('certs_skills','certs.naloxone_trained','Naloxone/overdose response trained', false, false, true),
  ('certs_skills','certs.deescalation_advanced','Advanced de-escalation beyond MHFA/CPI (e.g., ICAT/CIT)', false, false, true),
  ('certs_skills','skills.priority_language','Functional proficiency in priority language(s)', false, false, true),
  ('certs_skills','driver.first_aid_cpr_expiry_6mo','CPR-C validity ≥ 6 months remaining', false, false, true),
  ('certs_skills','fitness.pin_digital_attempts_3','≥ 3 digital PREP/PIN practice attempts', false, false, true)
on conflict do nothing;

-- References
insert into public.benchmark_rules (category_key, rule_key, description, is_anchor, is_unwritten, active)
values
  ('references','refs.supervisor_within_12mo','Supervisor reference within last 12 months', false, false, true),
  ('references','refs.no_family','All references are non-family', false, false, true),
  ('references','refs.contactable_verified','Reference contact details verified (no bounces)', false, false, true)
on conflict do nothing;

-- Conduct (optional)
insert into public.benchmark_rules (category_key, rule_key, description, is_anchor, is_unwritten, active)
values
  ('conduct','conduct.traffic_tickets_24mo_le_2','≤ 2 moving violations in last 24 months', false, false, true),
  ('conduct','conduct.no_job_terminations_36mo','No terminations/resignations-in-lieu in last 36 months', false, false, true),
  ('conduct','conduct.social_media_audit_ok','Social media review acceptable', false, false, true)
on conflict do nothing;


