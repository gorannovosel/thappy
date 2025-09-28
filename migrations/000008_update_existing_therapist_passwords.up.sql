-- Update existing therapist passwords to use TestPass123!
-- This standardizes all test user passwords

UPDATE users
SET password_hash = '$2a$10$fET4rfcHmP/xXTJEp9YCcuXrK.IwE2TetHa6rMx7pk83AUG/wlB9S'
WHERE email IN (
    'dr.smith@example.com',
    'dr.johnson@example.com',
    'dr.wilson@example.com',
    'dr.brown@example.com',
    'dr.davis@example.com'
) AND role = 'therapist';