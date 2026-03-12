  -- =====================================================
  -- Club Event Management Platform - Database Schema
  -- Run this in Supabase SQL Editor
  -- =====================================================

  -- Note: Supabase Auth (auth.users) handles actual credentials.
  -- This table is for our application-specific roles and data.
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'STUDENT', -- 'ADMIN' or 'STUDENT'
    name TEXT,
    register_number TEXT,
    department TEXT,
    year TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- We keep the old admins table just as a fallback or drop it later,
  -- but the new RBAC system uses the `profiles` table linked to Supabase Auth.

  -- ─── Events ──────────────────────────────────────────
  DO $$ BEGIN
      CREATE TYPE event_type AS ENUM ('INDIVIDUAL', 'TEAM');
  EXCEPTION
      WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
      CREATE TYPE event_status AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED');
  EXCEPTION
      WHEN duplicate_object THEN null;
  END $$;

  CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    poster TEXT,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    registration_deadline TIMESTAMPTZ NOT NULL,
    event_type event_type NOT NULL DEFAULT 'INDIVIDUAL',
    max_participants INT,
    max_teams INT,
    team_size INT,
    status event_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
  CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

  -- ─── Teams ───────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    leader_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_teams_event_id ON teams(event_id);
  CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(code);

  -- ─── Participants ────────────────────────────────────
  CREATE TABLE IF NOT EXISTS participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(email, event_id)
  );

  CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
  CREATE INDEX IF NOT EXISTS idx_participants_team_id ON participants(team_id);

  -- ─── Attendance ──────────────────────────────────────
  DO $$ BEGIN
      CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT');
  EXCEPTION
      WHEN duplicate_object THEN null;
  END $$;

  CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status attendance_status NOT NULL DEFAULT 'ABSENT',
    marked_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(participant_id, event_id)
  );

  CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON attendance(event_id);

  -- ─── Announcements ──────────────────────────────────
  CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- ─── Club Members ───────────────────────────────────
  CREATE TABLE IF NOT EXISTS club_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    photo TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- ─── Update leader_id FK after participants table exists ───
  ALTER TABLE teams DROP CONSTRAINT IF EXISTS fk_teams_leader;
  ALTER TABLE teams
    ADD CONSTRAINT fk_teams_leader
    FOREIGN KEY (leader_id) REFERENCES participants(id) ON DELETE SET NULL;

  -- ─── Trigger to automatically create a profile for new users ───
  CREATE OR REPLACE FUNCTION public.handle_new_user() 
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'STUDENT');
    RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

  -- ─── Admins Table (Fallback/Legacy) ────────────────
  CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'club_admin',
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
