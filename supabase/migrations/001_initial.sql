-- =====================================================
-- PilgrimHands — Initial Database Schema
-- =====================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'knight', 'ally', 'admin')),
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  telegram_id BIGINT,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Knight profiles
CREATE TABLE IF NOT EXISTS knights (
  id UUID REFERENCES profiles ON DELETE CASCADE PRIMARY KEY,
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  location_name TEXT,
  lat FLOAT,
  lng FLOAT,
  radius_km INT DEFAULT 50,
  pilgrim_id TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  rating FLOAT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  completed_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  knight_id UUID REFERENCES profiles ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other' CHECK (
    category IN ('pilgrimage', 'delivery', 'photography', 'documents', 'tech', 'research', 'representation', 'other')
  ),
  location_name TEXT,
  lat FLOAT,
  lng FLOAT,
  is_remote BOOLEAN DEFAULT FALSE NOT NULL,
  budget DECIMAL(10,2) CHECK (budget > 0),
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT DEFAULT 'open' NOT NULL CHECK (
    status IN ('draft', 'open', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed')
  ),
  deadline TIMESTAMPTZ,
  visibility TEXT DEFAULT 'public' NOT NULL CHECK (visibility IN ('public', 'private', 'api_only')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Offers
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks ON DELETE CASCADE,
  knight_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  message TEXT,
  eta_hours INT CHECK (eta_hours > 0),
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(task_id, knight_id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks ON DELETE RESTRICT,
  offer_id UUID REFERENCES offers ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'held', 'released', 'refunded', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- API Keys (for AI agents)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  label TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_knight_id ON tasks(knight_id);
CREATE INDEX IF NOT EXISTS idx_tasks_visibility ON tasks(visibility);
CREATE INDEX IF NOT EXISTS idx_offers_task_id ON offers(task_id);
CREATE INDEX IF NOT EXISTS idx_offers_knight_id ON offers(knight_id);
CREATE INDEX IF NOT EXISTS idx_knights_verification ON knights(verification_status);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- =====================================================
-- Functions & Triggers
-- =====================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update knight stats on task completion
CREATE OR REPLACE FUNCTION update_knight_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.knight_id IS NOT NULL THEN
    UPDATE knights
    SET completed_count = completed_count + 1
    WHERE id = NEW.knight_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_completed_stats AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_knight_stats();

-- =====================================================
-- Row Level Security
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Knights: public read verified, own write
CREATE POLICY "knights_public_read" ON knights FOR SELECT USING (verification_status = 'verified');
CREATE POLICY "knights_own_all" ON knights FOR ALL USING (auth.uid() = id);

-- Tasks: public read open/public, own client/knight full access
CREATE POLICY "tasks_public_read" ON tasks FOR SELECT
  USING (visibility = 'public' OR auth.uid() = client_id OR auth.uid() = knight_id);
CREATE POLICY "tasks_client_insert" ON tasks FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "tasks_client_update" ON tasks FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "tasks_knight_update_status" ON tasks FOR UPDATE
  USING (auth.uid() = knight_id);

-- Offers: knights can create, task owner and offer owner can read
CREATE POLICY "offers_read" ON offers FOR SELECT
  USING (
    auth.uid() = knight_id OR
    auth.uid() IN (SELECT client_id FROM tasks WHERE id = task_id)
  );
CREATE POLICY "offers_knight_insert" ON offers FOR INSERT WITH CHECK (auth.uid() = knight_id);
CREATE POLICY "offers_own_update" ON offers FOR UPDATE USING (auth.uid() = knight_id);

-- Transactions: own client or knight
CREATE POLICY "transactions_own_read" ON transactions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT client_id FROM tasks WHERE id = task_id
      UNION
      SELECT knight_id FROM tasks WHERE id = task_id AND knight_id IS NOT NULL
    )
  );

-- API keys: own only
CREATE POLICY "api_keys_own" ON api_keys FOR ALL USING (auth.uid() = user_id);
