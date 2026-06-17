-- Mock Interviews table
CREATE TABLE mock_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'technical',
  status TEXT DEFAULT 'pending',
  score INTEGER DEFAULT 0,
  feedback TEXT,
  questions JSONB DEFAULT '[]',
  answers JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Career Paths table
CREATE TABLE career_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  present_role TEXT,
  target_role TEXT,
  years_experience INTEGER DEFAULT 0,
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Team Finder profiles
CREATE TABLE team_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'flexible',
  looking_for TEXT DEFAULT '',
  project_ideas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- Team requests
CREATE TABLE team_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Competitions
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'skill',
  start_date DATE,
  end_date DATE,
  prize TEXT,
  participants JSONB DEFAULT '[]',
  leaderboard JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Competition entries
CREATE TABLE competition_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(competition_id, user_id)
);

-- AI Generated Projects
CREATE TABLE ai_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'intermediate',
  tech_stack TEXT[],
  milestones JSONB DEFAULT '[]',
  estimated_hours INTEGER DEFAULT 20,
  skills_required TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Career Twins (similar profiles)
CREATE TABLE career_twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  twin_name TEXT,
  twin_role TEXT,
  twin_company TEXT,
  twin_skills TEXT[],
  story TEXT,
  advice TEXT,
  similarity_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_twins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mock_interviews
CREATE POLICY "select_own_interviews" ON mock_interviews FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_interviews" ON mock_interviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_interviews" ON mock_interviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for career_paths
CREATE POLICY "select_own_paths" ON career_paths FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_paths" ON career_paths FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_paths" ON career_paths FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for team_profiles
CREATE POLICY "select_all_team_profiles" ON team_profiles FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_own_team_profile" ON team_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_team_profile" ON team_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for team_requests
CREATE POLICY "select_own_requests" ON team_requests FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "insert_own_requests" ON team_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "update_own_requests" ON team_requests FOR UPDATE
  TO authenticated USING (auth.uid() = receiver_id);

-- RLS Policies for competitions (public read)
CREATE POLICY "select_all_competitions" ON competitions FOR SELECT
  TO authenticated USING (true);

-- RLS Policies for competition_entries
CREATE POLICY "select_all_entries" ON competition_entries FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_own_entries" ON competition_entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_projects
CREATE POLICY "select_own_ai_projects" ON ai_projects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_ai_projects" ON ai_projects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for career_twins
CREATE POLICY "select_own_twins" ON career_twins FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_twins" ON career_twins FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Insert default competitions
INSERT INTO competitions (title, description, type, start_date, end_date, prize, is_active) VALUES
  ('DSA Sprint', 'Solve 50 DSA problems in 7 days', 'skill', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', '500 XP + Badge', true),
  ('React Master', 'Build 3 React projects', 'project', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', '1000 XP + Certificate', true),
  ('Weekly Quiz', 'Test your knowledge', 'quiz', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', '200 XP', true);