-- Create profiles table to extend auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  year TEXT DEFAULT '1st',
  branch TEXT DEFAULT 'CSE',
  goal TEXT DEFAULT '',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create skills table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'beginner',
  icon TEXT,
  prerequisites TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_skills for tracking progress
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  level INTEGER DEFAULT 1,
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, skill_id)
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[],
  status TEXT DEFAULT 'idea',
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create chat history for AI mentor
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Skills are public for reading
CREATE POLICY "skills_select_all" ON skills FOR SELECT
  TO authenticated USING (true);

-- RLS Policies for user_skills
CREATE POLICY "select_own_user_skills" ON user_skills FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_user_skills" ON user_skills FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_user_skills" ON user_skills FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_user_skills" ON user_skills FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "select_own_projects" ON projects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_projects" ON projects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_projects" ON projects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "select_own_messages" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_messages" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Insert default skills
INSERT INTO skills (name, category, description, difficulty, icon) VALUES
  ('React', 'Frontend', 'Build modern web applications with React', 'beginner', 'code'),
  ('Node.js', 'Backend', 'Server-side JavaScript development', 'intermediate', 'server'),
  ('Python', 'Programming', 'Versatile programming language', 'beginner', 'terminal'),
  ('Machine Learning', 'AI/ML', 'Build intelligent systems', 'advanced', 'brain'),
  ('System Design', 'Architecture', 'Design scalable systems', 'advanced', 'layout'),
  ('Data Structures', 'Fundamentals', 'Core programming concepts', 'beginner', 'database'),
  ('Algorithms', 'Fundamentals', 'Problem-solving techniques', 'intermediate', 'git-branch'),
  ('SQL', 'Database', 'Database query language', 'beginner', 'database'),
  ('Docker', 'DevOps', 'Container orchestration', 'intermediate', 'box'),
  ('Git', 'Tools', 'Version control system', 'beginner', 'git-branch'),
  ('TypeScript', 'Frontend', 'Typed JavaScript for large applications', 'intermediate', 'code'),
  ('Next.js', 'Full Stack', 'React framework for production', 'intermediate', 'globe'),
  ('AWS', 'Cloud', 'Cloud computing platform', 'advanced', 'cloud'),
  ('REST APIs', 'Backend', 'API design principles', 'beginner', 'link'),
  ('GraphQL', 'Backend', 'Query language for APIs', 'intermediate', 'share-2');
