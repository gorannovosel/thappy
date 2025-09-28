-- Revert therapist passwords to original hash
-- This reverts the password change from the up migration

UPDATE users
SET password_hash = '$2a$10$K2C3VJdOkq9OKd9N2DtOTOJ8fqGFbQ8t2OKMlZh9Wq2vXkYsLmRVC'
WHERE email IN (
    'dr.smith@example.com',
    'dr.johnson@example.com',
    'dr.wilson@example.com',
    'dr.brown@example.com',
    'dr.davis@example.com'
) AND role = 'therapist';