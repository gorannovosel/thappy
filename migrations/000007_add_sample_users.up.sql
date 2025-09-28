-- Add sample/test user data for all environments
-- IMPORTANT: These test users are included in production for testing purposes
-- WARNING: These users have known passwords - ensure proper security monitoring

DO $$
DECLARE
    existing_test_users integer;
BEGIN
    -- Check if test users already exist to avoid duplicates
    SELECT COUNT(*) INTO existing_test_users
    FROM users
    WHERE email LIKE '%.client@example.com' OR email LIKE 'dr.%@example.com';

    IF existing_test_users > 0 THEN
        RAISE NOTICE 'Test users already exist (% found) - skipping creation to avoid duplicates', existing_test_users;
        RETURN;
    ELSE
        RAISE NOTICE 'Adding test users for testing and demonstration purposes';
        RAISE NOTICE 'SECURITY WARNING: Test users have known passwords - monitor usage';
    END IF;
END $$;

-- Sample Client Users (password: TestPass123!)
INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at) VALUES
    ('a1000001-e29b-41d4-a716-446655440001', 'alice.client@example.com', '$2a$10$fET4rfcHmP/xXTJEp9YCcuXrK.IwE2TetHa6rMx7pk83AUG/wlB9S', 'client', true, NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440002', 'bob.client@example.com', '$2a$10$fET4rfcHmP/xXTJEp9YCcuXrK.IwE2TetHa6rMx7pk83AUG/wlB9S', 'client', true, NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440003', 'carol.client@example.com', '$2a$10$fET4rfcHmP/xXTJEp9YCcuXrK.IwE2TetHa6rMx7pk83AUG/wlB9S', 'client', true, NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440004', 'david.client@example.com', '$2a$10$fET4rfcHmP/xXTJEp9YCcuXrK.IwE2TetHa6rMx7pk83AUG/wlB9S', 'client', false, NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440005', 'eve.client@example.com', '$2a$10$fET4rfcHmP/xXTJEp9YCcuXrK.IwE2TetHa6rMx7pk83AUG/wlB9S', 'client', true, NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440006', 'frank.client@example.com', '$2a$10$fET4rfcHmP/xXTJEp9YCcuXrK.IwE2TetHa6rMx7pk83AUG/wlB9S', 'client', true, NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440007', 'grace.client@example.com', '$2a$10$fET4rfcHmP/xXTJEp9YCcuXrK.IwE2TetHa6rMx7pk83AUG/wlB9S', 'client', true, NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440008', 'henry.client@example.com', '$2a$10$fET4rfcHmP/xXTJEp9YCcuXrK.IwE2TetHa6rMx7pk83AUG/wlB9S', 'client', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Sample Therapist Users (password: TestPass123!)
INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at) VALUES
    ('b1000001-e29b-41d4-a716-446655440001', 'dr.martinez@example.com', '$2a$10$fET4rfcHmP/xXTJEp9YCcuXrK.IwE2TetHa6rMx7pk83AUG/wlB9S', 'therapist', true, NOW(), NOW()),
    ('b1000001-e29b-41d4-a716-446655440002', 'dr.thompson@example.com', '$2a$10$fET4rfcHmP/xXTJEp9YCcuXrK.IwE2TetHa6rMx7pk83AUG/wlB9S', 'therapist', true, NOW(), NOW()),
    ('b1000001-e29b-41d4-a716-446655440003', 'dr.anderson@example.com', '$2a$10$fET4rfcHmP/xXTJEp9YCcuXrK.IwE2TetHa6rMx7pk83AUG/wlB9S', 'therapist', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Sample Client Profiles
INSERT INTO client_profiles (user_id, first_name, last_name, date_of_birth, phone, emergency_contact, therapist_id, notes, created_at, updated_at) VALUES
    ('a1000001-e29b-41d4-a716-446655440001', 'Alice', 'Johnson', '1990-05-15', '+1-555-1001', 'John Johnson (Father) - +1-555-1099', '550e8400-e29b-41d4-a716-446655440001', 'Seeking help with anxiety and work-related stress.', NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440002', 'Bob', 'Williams', '1985-11-22', '+1-555-1002', 'Mary Williams (Wife) - +1-555-1098', '550e8400-e29b-41d4-a716-446655440002', 'Working through trauma from car accident.', NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440003', 'Carol', 'Davis', '1993-03-08', '+1-555-1003', 'Tom Davis (Brother) - +1-555-1097', '550e8400-e29b-41d4-a716-446655440003', 'Family therapy sessions with teenage daughter.', NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440004', 'David', 'Miller', '1988-07-30', '+1-555-1004', 'Sarah Miller (Sister) - +1-555-1096', NULL, 'New client, intake pending.', NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440005', 'Eve', 'Garcia', '1995-12-03', '+1-555-1005', 'Maria Garcia (Mother) - +1-555-1095', '550e8400-e29b-41d4-a716-446655440005', 'Recovery from eating disorder, making good progress.', NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440006', 'Frank', 'Rodriguez', '1987-09-18', '+1-555-1006', 'Linda Rodriguez (Wife) - +1-555-1094', 'b1000001-e29b-41d4-a716-446655440001', 'Depression and relationship counseling.', NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440007', 'Grace', 'Lee', '1992-01-25', '+1-555-1007', 'Kevin Lee (Husband) - +1-555-1093', 'b1000001-e29b-41d4-a716-446655440002', 'Postpartum depression support.', NOW(), NOW()),
    ('a1000001-e29b-41d4-a716-446655440008', 'Henry', 'Taylor', '1983-06-12', '+1-555-1008', 'Janet Taylor (Mother) - +1-555-1092', 'b1000001-e29b-41d4-a716-446655440003', 'Substance abuse recovery, 6 months sober.', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Additional Sample Therapist Profiles
INSERT INTO therapist_profiles (user_id, first_name, last_name, license_number, specializations, phone, bio, is_accepting_clients, created_at, updated_at) VALUES
    ('b1000001-e29b-41d4-a716-446655440001', 'Carlos', 'Martinez', 'LIC111222',
     '["Depression", "Bipolar Disorder", "Mood Disorders"]',
     '+1-555-2001',
     'Dr. Carlos Martinez specializes in mood disorders and has extensive experience helping clients manage depression and bipolar disorder. He uses a combination of therapy approaches tailored to each individual.',
     true, NOW(), NOW()),
    ('b1000001-e29b-41d4-a716-446655440002', 'Jennifer', 'Thompson', 'LIC333444',
     '["Maternal Mental Health", "Postpartum Depression", "Women''s Issues"]',
     '+1-555-2002',
     'Dr. Jennifer Thompson is a specialist in maternal mental health and women''s issues. She provides compassionate care for mothers dealing with postpartum depression and pregnancy-related mental health concerns.',
     true, NOW(), NOW()),
    ('b1000001-e29b-41d4-a716-446655440003', 'Robert', 'Anderson', 'LIC555666',
     '["Substance Abuse", "Addiction Recovery", "Motivational Interviewing"]',
     '+1-555-2003',
     'Dr. Robert Anderson is an addiction specialist with over 15 years of experience in substance abuse treatment. He uses evidence-based approaches including motivational interviewing to support clients in recovery.',
     true, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;