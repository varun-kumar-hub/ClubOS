-- =====================================================
-- Seed Data for Club Event Management Platform
-- Run after schema.sql in Supabase SQL Editor
-- =====================================================

-- Insert a default admin (password: admin123)
-- bcrypt hash for 'admin123'
INSERT INTO admins (email, password, name) VALUES
  ('admin@club.com', 'club123', 'Club Admin'),
  ('cvarunkumar455@gmail.com', 'varun455', 'Challa Varun Kumar'),
  ('cvkvarun7@gmail.com', 'varun123', 'Varun Kumar')
ON CONFLICT (email) DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name;

-- Sample announcements
INSERT INTO announcements (title, description) VALUES
  ('Welcome to Club Platform!', 'We are excited to launch our new event management platform. Stay tuned for upcoming events!'),
  ('Registrations Open', 'Event registrations are now open. Check the events page for details.');

-- Sample club members
INSERT INTO club_members (name, role, department, year, display_order) VALUES
  ('Nallam Venkata Vinay', 'Content Team Lead', '', '', 1),
  ('A Praneeth', 'Conten Team Co-Lead', '', '', 2),
  ('Barakam Tarun Tej', 'Content Team', '', '', 3),
  ('C Midhun sai', 'Content Team', '', '', 4),
  ('Poluboyina Arya vardhan', 'Content Team', '24S10', '99240040828', 5),
  ('Bethapudi Rupesh', 'Content Team', '', '', 6),
  ('BHUMIREDDY SAI CHARAN REDDY', 'Event Coordinator lead', '24S10', '99240040838', 7),
  ('JUJJAVARAPU RISHYENDRA', 'Event Coordinator', '', '', 8),
  ('DUDDU POTHAN', 'Event Coordinator', '24S16', '99240041354', 9),
  ('Dudekula Dharma teja', 'Event Coordinator', '', '', 10),
  ('G.OMSAI', 'Event Coordinator', '', '', 11),
  ('M.V.SOMESHRAJ', 'Event Coordinator', '', '', 12),
  ('Kantaspurthi Swathi', 'Research Team Lead', '24S06', '99240040570', 13),
  ('DAGGUPATI LIKHITHA', 'Research Team', '', '', 14),
  ('DAGGUPATI VINUSHA', 'Research Team', '', '', 15),
  ('GUDA KAVYA REDDY', 'Research Team', '', '', 16),
  ('N.Mounika', 'Research Team', '24S08', '99240040666', 17),
  ('Tallam Sai hasika', 'Research Team', '24S05', '99240040438', 18),
  ('MANDALA THANUJ KUMAR', 'Social Media', '24S16', '99240041249', 19),
  ('Nambula Akshaya', 'Social Media', '', '', 20),
  ('SIRPA SAI PRAKYATH', 'Technical Team Lead', '', '', 21),
  ('Davuluri Rakesh', 'Technical team', '', '', 22),
  ('ILLURI TEJESHWAR REDDY', 'Technical team', '', '', 23),
  ('Kata Vandana', 'Technical team', '24S06', '99240040568', 24),
  ('RANGAPPAGARI CHAITANYA REDDY', 'Technical team', '24S16', '99240041253', 25),
  ('SHAIK SALMAAN FARIS', 'Technical team', '24S16', '99240041250', 26),
  ('Valluru Venkata Akshitha', 'Technical team', '', '', 27),
  ('Megha R', 'Web Development Lead', 'Kalvium', '99240041397', 28),
  ('Putluru Prashanthi', 'Web Development Co-Lead', '24S08', '99240040717', 29),
  ('BESTHA KRISHNA CHAITHANYA', 'Web Developer', '', '', 30),
  ('Challa varun kumar', 'web developer', '24S16', '99240041355', 31),
  ('Madnoor Rakshitha Mohan', 'Web Developer', '', '', 32),
  ('Mudiyam jagadeswara reddy', 'Web Developer', '', '', 33);
