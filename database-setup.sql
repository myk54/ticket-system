-- =============================================
-- Ticket System - Database Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert default roles
INSERT INTO roles (name, display_name, level) VALUES
    ('admin', 'مدير النظام', 100),
    ('processor', 'معالج التذاكر', 50),
    ('reviewer', 'مدقق', 40),
    ('support', 'الدعم الفني', 10)
ON CONFLICT (name) DO NOTHING;

-- 3. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role_id UUID REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add new columns to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_id VARCHAR(50);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES auth.users(id);

-- 5. Update existing tickets with ticket_id
UPDATE tickets 
SET ticket_id = '#T' || LPAD(ticket_number::TEXT, 4, '0')
WHERE ticket_id IS NULL;

-- 6. Create comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create activity log table
CREATE TABLE IF NOT EXISTS ticket_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_activity_ticket_id ON ticket_activity(ticket_id);

-- 9. Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_activity ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert profiles" ON user_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Only admins can update profiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- 11. RLS Policies for ticket_comments
CREATE POLICY "Users can view comments" ON ticket_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add comments" ON ticket_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. RLS Policies for ticket_activity
CREATE POLICY "Users can view activity" ON ticket_activity
    FOR SELECT USING (true);

CREATE POLICY "System can insert activity" ON ticket_activity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 13. Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Create First Admin User (Run manually after setup)
-- =============================================
-- 1. First, create a user in Supabase Auth (Dashboard > Authentication > Users)
-- 2. Then run this to make them admin:

-- INSERT INTO user_profiles (user_id, email, full_name, role_id, is_active)
-- SELECT 
--     'YOUR_USER_UUID_HERE',
--     'admin@example.com',
--     'مدير النظام',
--     (SELECT id FROM roles WHERE name = 'admin'),
--     true;

-- =============================================
-- Useful Queries
-- =============================================

-- Get all users with their roles:
-- SELECT up.*, r.name as role_name, r.display_name as role_display
-- FROM user_profiles up
-- LEFT JOIN roles r ON up.role_id = r.id;

-- Get tickets with creator and assignee info:
-- SELECT t.*, 
--        creator.full_name as creator_name,
--        assignee.full_name as assignee_name
-- FROM tickets t
-- LEFT JOIN user_profiles creator ON t.created_by = creator.user_id
-- LEFT JOIN user_profiles assignee ON t.assigned_to = assignee.user_id;
