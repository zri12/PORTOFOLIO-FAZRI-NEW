
insert into public.contact_messages (name, email, whatsapp, project_type, budget_range, subject, message, status, created_at)
values
('Rafi Pratama','rafi@demo.fazri.dev','+628120000001','Dashboard','Rp3-5 million','Dashboard redesign','I want to discuss an operations dashboard interface.','New','2026-07-12 00:00:00+00'),
('Dewi A.','dewi@demo.fazri.dev','+628120000002','Website','Discuss first','Portfolio website','Looking for a clean portfolio site for a small studio.','Read','2026-07-09 00:00:00+00')
on conflict (email, subject, created_at) do update set
  name = excluded.name,
  whatsapp = excluded.whatsapp,
  project_type = excluded.project_type,
  budget_range = excluded.budget_range,
  message = excluded.message,
  status = excluded.status;

