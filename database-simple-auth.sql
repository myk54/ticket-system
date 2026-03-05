-- =============================================
-- Ticket System - Simple Auth Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Drop old user_profiles if exists (we'll recreate it)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2. Create users table with username/password
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role_id UUID REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create index for faster login
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 4. Function to hash password (simple SHA256)
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(sha256(password::bytea), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 5. Function to verify password
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT, stored_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN hash_password(input_password) = stored_hash;
END;
$$ LANGUAGE plpgsql;

-- 6. Function for user login
CREATE OR REPLACE FUNCTION login_user(input_username TEXT, input_password TEXT)
RETURNS TABLE (
    user_id UUID,
    username VARCHAR,
    full_name VARCHAR,
    role_name VARCHAR,
    role_display VARCHAR,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.full_name,
        r.name,
        r.display_name,
        u.is_active
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.username = input_username 
    AND verify_password(input_password, u.password_hash)
    AND u.is_active = true;
    
    -- Update last login
    UPDATE users SET last_login = NOW() 
    WHERE users.username = input_username;
END;
$$ LANGUAGE plpgsql;

-- 7. Insert default admin user (username: admin, password: admin123)
INSERT INTO users (username, password_hash, full_name, role_id, is_active)
VALUES (
    'admin',
    hash_password('admin123'),
    'مدير النظام',
    (SELECT id FROM roles WHERE name = 'admin'),
    true
) ON CONFLICT (username) DO NOTHING;

-- 8. Disable RLS for users table (we handle auth in app)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 9. Update tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_id VARCHAR(50);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);

-- =============================================
-- Default Login Credentials
-- =============================================
-- Username: admin
-- Password: admin123
-- =============================================

-- To add more users, use:
-- INSERT INTO users (username, password_hash, full_name, role_id, is_active)
-- VALUES (
--     'username_here',
--     hash_password('password_here'),
--     'الاسم الكامل',
--     (SELECT id FROM roles WHERE name = 'processor'), -- or 'reviewer', 'support'
--     true
-- );
