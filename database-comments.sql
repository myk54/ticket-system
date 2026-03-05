-- =============================================
-- Comments & Assignment System
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);

-- 3. Update tickets table for assignment
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- 4. Function to get comments with user info
CREATE OR REPLACE FUNCTION get_ticket_comments(p_ticket_id UUID)
RETURNS TABLE (
    id UUID,
    ticket_id UUID,
    user_id UUID,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    username VARCHAR,
    full_name VARCHAR,
    role_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.ticket_id,
        c.user_id,
        c.content,
        c.created_at,
        u.username,
        u.full_name,
        r.name as role_name
    FROM ticket_comments c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE c.ticket_id = p_ticket_id
    ORDER BY c.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. View for tickets with assignment info
CREATE OR REPLACE VIEW tickets_with_users AS
SELECT 
    t.*,
    creator.username as creator_username,
    creator.full_name as creator_name,
    assignee.username as assignee_username,
    assignee.full_name as assignee_name
FROM tickets t
LEFT JOIN users creator ON t.created_by = creator.id
LEFT JOIN users assignee ON t.assigned_to = assignee.id;
