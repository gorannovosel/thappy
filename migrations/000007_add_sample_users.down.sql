-- Remove sample user data
-- This removes all the sample data added by the up migration

-- Remove sample client profiles
DELETE FROM client_profiles WHERE user_id IN (
    'a1000001-e29b-41d4-a716-446655440001',
    'a1000001-e29b-41d4-a716-446655440002',
    'a1000001-e29b-41d4-a716-446655440003',
    'a1000001-e29b-41d4-a716-446655440004',
    'a1000001-e29b-41d4-a716-446655440005',
    'a1000001-e29b-41d4-a716-446655440006',
    'a1000001-e29b-41d4-a716-446655440007',
    'a1000001-e29b-41d4-a716-446655440008'
);

-- Remove additional sample therapist profiles
DELETE FROM therapist_profiles WHERE user_id IN (
    'b1000001-e29b-41d4-a716-446655440001',
    'b1000001-e29b-41d4-a716-446655440002',
    'b1000001-e29b-41d4-a716-446655440003'
);

-- Remove sample client users
DELETE FROM users WHERE id IN (
    'a1000001-e29b-41d4-a716-446655440001',
    'a1000001-e29b-41d4-a716-446655440002',
    'a1000001-e29b-41d4-a716-446655440003',
    'a1000001-e29b-41d4-a716-446655440004',
    'a1000001-e29b-41d4-a716-446655440005',
    'a1000001-e29b-41d4-a716-446655440006',
    'a1000001-e29b-41d4-a716-446655440007',
    'a1000001-e29b-41d4-a716-446655440008'
);

-- Remove additional sample therapist users
DELETE FROM users WHERE id IN (
    'b1000001-e29b-41d4-a716-446655440001',
    'b1000001-e29b-41d4-a716-446655440002',
    'b1000001-e29b-41d4-a716-446655440003'
);