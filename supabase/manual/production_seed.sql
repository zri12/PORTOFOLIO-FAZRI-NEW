-- Production seed for Supabase SQL Editor

insert into public.site_profiles (
  singleton_key, full_name, display_name, title, greeting, headline, description, biography, about_content,
  email, whatsapp, location, availability, github_url, linkedin_url, instagram_url, youtube_url, tiktok_url, cv_path,
  profile_image_path, professional_character_path, spider_character_path
) values (
  'main',
  'Fazri Lukman Nurrohman',
  'Fazri',
  'Creative Web Developer',
  'Hello, I''m Fazri.',
  'I create modern web applications and interactive experiences that combine reliable functionality with thoughtful visual design.',
  'Web development is my main focus, supported by UI design, photography, videography, and visual editing.',
  'A Creative Web Developer who enjoys turning ambiguous ideas into clear, useful, and visually considered web experiences.',
  'My work blends web development with interface design, photography, videography, and visual editing so each product works clearly and communicates well.',
  'hello@fazri.dev',
  '+62 812 0000 0000',
  'Indonesia',
  'Available for selected projects',
  'https://github.com/fazrilukman',
  'https://www.linkedin.com/in/fazrilukman',
  'https://instagram.com/fazrilukman',
  'https://youtube.com/@fazrilukman',
  'https://tiktok.com/@fazrilukman',
  '/cv-fazri-lukman.pdf',
  'seed/fazri.png',
  'seed/character-professional.png',
  'seed/character-spider.png'
) on conflict (singleton_key) do update set
  full_name = excluded.full_name,
  display_name = excluded.display_name,
  title = excluded.title,
  greeting = excluded.greeting,
  headline = excluded.headline,
  description = excluded.description,
  biography = excluded.biography,
  about_content = excluded.about_content,
  email = excluded.email,
  whatsapp = excluded.whatsapp,
  location = excluded.location,
  availability = excluded.availability,
  github_url = excluded.github_url,
  linkedin_url = excluded.linkedin_url,
  instagram_url = excluded.instagram_url,
  youtube_url = excluded.youtube_url,
  tiktok_url = excluded.tiktok_url,
  cv_path = excluded.cv_path,
  profile_image_path = excluded.profile_image_path,
  professional_character_path = excluded.professional_character_path,
  spider_character_path = excluded.spider_character_path;

insert into public.site_settings (
  singleton_key, website_name, description, language, copyright, default_mode, smooth_scroll, splash_enabled,
  three_enabled, comments_enabled, contact_enabled, seo_title, seo_description, keywords
) values (
  'main',
  'Fazri Portfolio',
  'Creative Web Developer portfolio for web applications, interface design, and visual storytelling.',
  'en',
  'Fazri Lukman Nurrohman. All rights reserved.',
  'professional',
  true,
  true,
  true,
  true,
  true,
  'Fazri Lukman Nurrohman - Creative Web Developer',
  'Portfolio of Fazri Lukman Nurrohman, a Creative Web Developer focused on modern web applications and visual digital experiences.',
  'web developer, portfolio, React, Laravel, UI design, Indonesia'
) on conflict (singleton_key) do update set
  website_name = excluded.website_name,
  description = excluded.description,
  language = excluded.language,
  copyright = excluded.copyright,
  default_mode = excluded.default_mode,
  smooth_scroll = excluded.smooth_scroll,
  splash_enabled = excluded.splash_enabled,
  three_enabled = excluded.three_enabled,
  comments_enabled = excluded.comments_enabled,
  contact_enabled = excluded.contact_enabled,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  keywords = excluded.keywords;

with rows(slug, title, full_name, category, project_type, role, year, status, featured, client_type, short_description, full_description, overview, background, solution, architecture, data_structure, live_url, source_url, display_order) as (
  values
  ('sinden','SINDEN','Student Evaluation and Monitoring System','Education','Web Application','Full-Stack Web Developer','2023','published'::public.publish_status,true,'Academic Project'::public.client_type,'Student evaluation and monitoring system with role-based dashboards and analytical tools.','A platform for tracking grades, attendance, and behavioral notes across a school environment.','SINDEN focuses on academic visibility: turning scattered student records into structured, accessible dashboards.','Evaluation data was difficult to review when stored across manual sheets and separate communication channels.','The interface centralizes student data, role-based views, reporting modules, and clear review workflows.','Single-page frontend, authenticated dashboard shell, service layer prepared for Supabase data access.','Students, classes, evaluations, attendance records, behavior notes, and user roles.','https://fazri.dev/projects/sinden','https://github.com/fazrilukman/sinden',1),
  ('so-harmony','SO Harmony','Mess Monitoring System','Dashboard','Operations Dashboard','Full-Stack Web Developer','2023','published',true,'Client Work','Monitoring system for occupancy, maintenance complaints, and room status workflows.','An operational dashboard for lodging facilities with room tracking and maintenance coordination.','SO Harmony organizes daily operational signals into a dashboard that staff can scan quickly.','Manual room status updates created delays between occupancy, housekeeping, and maintenance decisions.','A clear interface for room state, complaint handling, checklists, and historical activity.','Laravel application with relational data model and modular dashboard screens.','Rooms, occupants, complaints, maintenance status, staff notes, and activity logs.','https://fazri.dev/projects/so-harmony','https://github.com/fazrilukman/so-harmony',2),
  ('sumut-cluster','SumutCluster','Tourism Clustering and Recommendation Platform','Data Mining','Recommendation Platform','Web Developer and Data Integration','2024','published',true,'Academic Project','Data mining platform visualizing tourism trends and destination recommendations.','A tourism analysis interface supported by K-Means clustering and interactive destination views.','SumutCluster presents tourism data in a way that helps users compare destination potential.','Tourism records needed clearer grouping and presentation for exploration and recommendation use cases.','The frontend translates clustering results into searchable cards, map-like visuals, and recommendation details.','Next.js frontend prepared to consume Python-generated clustering output and Supabase records.','Destinations, categories, visitor indicators, cluster labels, recommendation metadata.','https://fazri.dev/projects/sumut-cluster','https://github.com/fazrilukman/sumut-cluster',3),
  ('sm-v-lab-ipa','SM V-Lab IPA','Interactive Science Learning Platform','Education','Learning Platform','Web Developer','2022','published',false,'Academic Project','Virtual laboratory platform for interactive science experiments and learning modules.','A remote learning tool with modules, grading support, and teacher oversight.','SM V-Lab IPA makes science practice more accessible when physical lab access is limited.','Remote learning created a gap between theory and hands-on science activities.','Interactive modules, guided activities, and teacher review screens support practical learning online.','Laravel-based application with PWA-friendly frontend patterns.','Modules, experiments, questions, submissions, scores, and teacher feedback.','https://fazri.dev/projects/sm-v-lab-ipa','https://github.com/fazrilukman/sm-v-lab-ipa',4),
  ('marketing-crm','Marketing CRM','Travel Marketing Management System','CRM','Web Application','Web Developer','2023','published',false,'Client Work','Custom CRM for lead generation, follow-up scheduling, and campaign visibility.','A customer relationship management prototype tailored for a travel marketing pipeline.','Marketing CRM helps staff track prospects and follow-up responsibilities in one workspace.','Follow-up notes and lead status were hard to maintain when spread across messaging and spreadsheets.','Pipeline boards, lead profiles, reminders, and campaign views make relationship work easier to manage.','MERN-style frontend and API structure prepared for CRM workflows.','Leads, pipelines, notes, tasks, campaigns, and user assignments.','https://fazri.dev/projects/marketing-crm','https://github.com/fazrilukman/marketing-crm',5),
  ('sistem-cuti-skm','Sistem Cuti SKM Mill','Employee and Leave Management System','Dashboard','Employee Management','Web Developer','2022','published',false,'Client Work','Internal HR tool for leave balances, approval flows, and workforce scheduling.','A focused employee leave management system replacing paper-based request workflows.','The system keeps leave requests visible and reviewable for employees and HR administrators.','Paper forms made leave tracking slow, repetitive, and difficult to audit.','Digital request forms, approval states, and calendar-style views streamline the HR process.','Classic PHP application with Bootstrap interface and MySQL persistence.','Employees, leave quotas, requests, approval steps, schedules, and departments.','https://fazri.dev/projects/sistem-cuti-skm','https://github.com/fazrilukman/sistem-cuti-skm',6)
)
insert into public.projects (
  slug, title, full_name, category, project_type, role, year, status, featured, client_type, short_description, full_description,
  overview, background, solution, architecture, data_structure, live_url, source_url, display_order,
  objectives, target_users, responsibilities, features, process, gallery, challenges, decisions, testing, deployment, result
)
select slug, title, full_name, category, project_type, role, year, status, featured, client_type, short_description, full_description,
  overview, background, solution, architecture, data_structure, live_url, source_url, display_order,
  '["Reduce manual reporting","Clarify user workflows","Make data easier to review","Support responsive access"]'::jsonb,
  '["Administrators","Staff operators","Managers","Students or clients depending on context"]'::jsonb,
  '["Interface planning","Frontend implementation","Database integration planning","Testing and deployment preparation"]'::jsonb,
  '["Role-based dashboard","Structured data views","Search and filtering","Responsive interface","Export-ready reporting"]'::jsonb,
  '["Discovery","Information architecture","Wireframe","Interface system","Implementation","Integration","Testing","Deployment"]'::jsonb,
  '[]'::jsonb,
  '["Balancing dense information with readable layouts","Keeping navigation clear across roles","Maintaining visual consistency on smaller screens"]'::jsonb,
  '["Use card density only where scanning matters","Prefer predictable tables for operational data","Keep public and admin flows visually distinct"]'::jsonb,
  'Tested through form validation, responsive checks, route checks, and common user task walkthroughs.',
  'Prepared for static frontend deployment with future backend integration points.',
  'A clearer frontend experience that communicates system purpose without relying on exaggerated metrics.'
from rows
on conflict (slug) do update set
  title = excluded.title,
  full_name = excluded.full_name,
  category = excluded.category,
  project_type = excluded.project_type,
  role = excluded.role,
  year = excluded.year,
  status = excluded.status,
  featured = excluded.featured,
  client_type = excluded.client_type,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  overview = excluded.overview,
  background = excluded.background,
  solution = excluded.solution,
  architecture = excluded.architecture,
  data_structure = excluded.data_structure,
  live_url = excluded.live_url,
  source_url = excluded.source_url,
  display_order = excluded.display_order;

with rows(name, icon_key, category, level, description, featured, active, display_order) as (
  values
  ('HTML5','html5','Frontend'::public.technology_category,'Main Stack'::public.technology_level,'HTML5 for responsive web interfaces.',true,true,1),
  ('CSS3','css3','Frontend','Main Stack','CSS3 for responsive web interfaces.',true,true,2),
  ('JavaScript','javascript','Frontend','Main Stack','JavaScript for responsive web interfaces.',true,true,3),
  ('TypeScript','typescript','Frontend','Main Stack','TypeScript for responsive web interfaces.',true,true,4),
  ('React','react','Frontend','Main Stack','React for responsive web interfaces.',true,true,5),
  ('Vite','vite','Frontend','Frequently Used','Vite for responsive web interfaces.',true,true,6),
  ('Next.js','nextjs','Frontend','Frequently Used','Next.js for responsive web interfaces.',false,true,7),
  ('Tailwind CSS','tailwindcss','Frontend','Frequently Used','Tailwind CSS for responsive web interfaces.',false,true,8),
  ('Bootstrap','bootstrap','Frontend','Frequently Used','Bootstrap for responsive web interfaces.',false,true,9),
  ('Laravel','laravel','Backend','Frequently Used','Laravel for server-side application work.',true,true,20),
  ('PHP','php','Backend','Frequently Used','PHP for server-side application work.',true,true,21),
  ('Node.js','nodejs','Backend','Familiar','Node.js for server-side application work.',false,true,22),
  ('Express','express','Backend','Familiar','Express for server-side application work.',false,true,23),
  ('MySQL','mysql','Database','Frequently Used','MySQL for structured application data.',true,true,40),
  ('PostgreSQL','postgresql','Database','Frequently Used','PostgreSQL for structured application data.',true,true,41),
  ('Supabase','supabase','Database','Frequently Used','Supabase for structured application data.',true,true,42),
  ('Firebase','firebase','Database','Familiar','Firebase for structured application data.',false,true,43),
  ('SQLite','sqlite','Database','Familiar','SQLite for structured application data.',false,true,44),
  ('Git','git','Deployment','Frequently Used','Git for delivery and local workflow.',true,true,60),
  ('GitHub','github','Deployment','Frequently Used','GitHub for delivery and local workflow.',true,true,61),
  ('Vercel','vercel','Deployment','Frequently Used','Vercel for delivery and local workflow.',true,true,62),
  ('cPanel','cpanel','Deployment','Familiar','cPanel for delivery and local workflow.',false,true,63),
  ('XAMPP','xampp','Deployment','Familiar','XAMPP for delivery and local workflow.',false,true,64),
  ('Figma','figma','Creative','Frequently Used','Figma supports visual production and storytelling.',true,true,80),
  ('Canva','canva','Creative','Frequently Used','Canva supports visual production and storytelling.',true,true,81),
  ('Photoshop','photoshop','Creative','Frequently Used','Photoshop supports visual production and storytelling.',true,true,82),
  ('Illustrator','illustrator','Creative','Frequently Used','Illustrator supports visual production and storytelling.',true,true,83),
  ('Premiere Pro','premierepro','Creative','Frequently Used','Premiere Pro supports visual production and storytelling.',true,true,84),
  ('After Effects','aftereffects','Creative','Familiar','After Effects supports visual production and storytelling.',false,true,85),
  ('Lightroom','lightroom','Creative','Familiar','Lightroom supports visual production and storytelling.',false,true,86),
  ('CapCut','capcut','Creative','Familiar','CapCut supports visual production and storytelling.',false,true,87),
  ('Blender','blender','Creative','Familiar','Blender supports visual production and storytelling.',false,true,88),
  ('OBS','obs','Creative','Familiar','OBS supports visual production and storytelling.',false,true,89)
)
insert into public.technologies (name, icon_key, category, level, description, featured, active, display_order)
select * from rows
on conflict (name) do update set
  icon_key = excluded.icon_key,
  category = excluded.category,
  level = excluded.level,
  description = excluded.description,
  featured = excluded.featured,
  active = excluded.active,
  display_order = excluded.display_order;

delete from public.project_technologies;
insert into public.project_technologies (project_id, technology_id, display_order)
select p.id, t.id, relation.display_order
from (
  values
  ('sinden','React',1),('sinden','Vite',2),('sinden','Supabase',3),('sinden','Tailwind CSS',4),
  ('so-harmony','Laravel',1),('so-harmony','MySQL',2),('so-harmony','Tailwind CSS',3),('so-harmony','JavaScript',4),
  ('sumut-cluster','Next.js',1),('sumut-cluster','Supabase',2),('sumut-cluster','Tailwind CSS',3),
  ('sm-v-lab-ipa','Laravel',1),('sm-v-lab-ipa','MySQL',2),('sm-v-lab-ipa','JavaScript',3),
  ('marketing-crm','React',1),('marketing-crm','Node.js',2),('marketing-crm','Express',3),
  ('sistem-cuti-skm','PHP',1),('sistem-cuti-skm','Bootstrap',2),('sistem-cuti-skm','MySQL',3)
) as relation(project_slug, tech_name, display_order)
join public.projects p on p.slug = relation.project_slug
join public.technologies t on t.name = relation.tech_name
on conflict (project_id, technology_id) do update set display_order = excluded.display_order;

insert into public.creative_works (slug, title, category, role, year, tools, description, brief, featured, status, display_order)
values
('product-interface-studies','Product Interface Studies','UI/UX Design','UI Designer','2024','["Figma","React"]','Interface explorations for dashboards and product workflows.','Create clear visual hierarchy for data-heavy screens.',true,'published',1),
('visual-brand-moments','Visual Brand Moments','Graphic Design','Visual Designer','2023','["Canva","Photoshop"]','Social and campaign visuals with consistent layout language.','Build reusable promotional layouts.',true,'published',2),
('light-place-people','Light, Place, and People','Photography','Photographer','2024','["Lightroom","Photoshop"]','Photography practice focused on atmosphere and human context.','Capture readable moments with restrained editing.',false,'published',3),
('frame-in-motion','A Frame in Motion','Videography','Video Editor','2023','["Premiere Pro","CapCut"]','Short-form visual sequences with clean rhythm and story structure.','Translate event footage into a concise narrative.',false,'published',4)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  role = excluded.role,
  year = excluded.year,
  tools = excluded.tools,
  description = excluded.description,
  brief = excluded.brief,
  featured = excluded.featured,
  status = excluded.status,
  display_order = excluded.display_order;

insert into public.experiences (role, organization, experience_type, period, location, description, responsibilities, technologies, related_project_id, published, display_order)
values
('Creative Web Developer','Independent & client collaborations','Freelance','2024 - Present','Indonesia','Building useful platforms, interfaces, and visual experiences with strong implementation focus.','["Plan interfaces","Build responsive frontends","Prepare project documentation"]','["React","Tailwind CSS","Figma"]',(select id from public.projects where slug = 'sumut-cluster'),true,1),
('Web Development Projects','Academic and client work','Project-based','2023 - 2024','Medan','Shipped dashboards, operational systems, and data-focused web applications.','["Develop dashboards","Integrate data models","Test workflows"]','["Laravel","MySQL","React"]',(select id from public.projects where slug = 'sinden'),true,2),
('Exploration & Foundation','Learning and organization activities','Learning','2022 - 2023','Indonesia','Strengthened cross-disciplinary practice across development, UI design, and visual production.','["Study web foundations","Create visual assets","Practice deployment"]','["PHP","Bootstrap","JavaScript"]',(select id from public.projects where slug = 'sm-v-lab-ipa'),true,3)
on conflict (role, organization, period) do update set
  experience_type = excluded.experience_type,
  location = excluded.location,
  description = excluded.description,
  responsibilities = excluded.responsibilities,
  technologies = excluded.technologies,
  related_project_id = excluded.related_project_id,
  published = excluded.published,
  display_order = excluded.display_order;

insert into public.certificates (title, issuer, category, issue_date, credential_id, credential_url, featured, published, display_order)
values
('Web Development Fundamentals','Dicoding','Development','2024-04-16','DCD-WEB-2024-FL','https://fazri.dev/certificates/web-development',true,true,1),
('UI/UX Design Essentials','Coursera','Design','2023-09-12','CRS-UIUX-FL','https://fazri.dev/certificates/uiux',false,true,2),
('JavaScript Intermediate','Codepolitan','Development','2023-06-20','CDP-JS-FL','https://fazri.dev/certificates/javascript',false,true,3)
on conflict (title, issuer) do update set
  category = excluded.category,
  issue_date = excluded.issue_date,
  credential_id = excluded.credential_id,
  credential_url = excluded.credential_url,
  featured = excluded.featured,
  published = excluded.published,
  display_order = excluded.display_order;

insert into public.visitor_comments (name, avatar, message, likes_count, admin_reply, pinned, status, created_at, approved_at)
values
('Aulia R.','AR','The portfolio feels clear and personal. The project previews help me understand the work quickly.',8,'Thank you for visiting and reading through the projects.',true,'approved','2026-07-10 00:00:00+00','2026-07-10 00:00:00+00'),
('Muhammad Rizky','MR','Mantap mas, project archive-nya rapi dan mudah dipelajari.',5,null,false,'approved','2026-07-05 00:00:00+00','2026-07-05 00:00:00+00'),
('Nadia S.','NS','The mix of development and creative work feels balanced without distracting from the web focus.',4,null,false,'approved','2026-06-28 00:00:00+00','2026-06-28 00:00:00+00')
on conflict (name, message, created_at) do update set
  likes_count = excluded.likes_count,
  admin_reply = excluded.admin_reply,
  pinned = excluded.pinned,
  status = excluded.status,
  approved_at = excluded.approved_at;
