-- Insert sample therapist users
INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'dr.smith@example.com', '$2a$10$K2C3VJdOkq9OKd9N2DtOTOJ8fqGFbQ8t2OKMlZh9Wq2vXkYsLmRVC', 'therapist', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'dr.johnson@example.com', '$2a$10$K2C3VJdOkq9OKd9N2DtOTOJ8fqGFbQ8t2OKMlZh9Wq2vXkYsLmRVC', 'therapist', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'dr.wilson@example.com', '$2a$10$K2C3VJdOkq9OKd9N2DtOTOJ8fqGFbQ8t2OKMlZh9Wq2vXkYsLmRVC', 'therapist', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'dr.brown@example.com', '$2a$10$K2C3VJdOkq9OKd9N2DtOTOJ8fqGFbQ8t2OKMlZh9Wq2vXkYsLmRVC', 'therapist', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', 'dr.davis@example.com', '$2a$10$K2C3VJdOkq9OKd9N2DtOTOJ8fqGFbQ8t2OKMlZh9Wq2vXkYsLmRVC', 'therapist', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert sample therapist profiles
INSERT INTO therapist_profiles (user_id, first_name, last_name, license_number, specializations, phone, bio, is_accepting_clients, created_at, updated_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Emily', 'Smith', 'LIC001234',
     '["Anxiety Disorders", "Depression", "Cognitive Behavioral Therapy"]',
     '+1-555-0101',
     'Dr. Emily Smith is a licensed clinical psychologist with over 10 years of experience specializing in anxiety and depression. She uses evidence-based approaches including CBT and mindfulness techniques to help her clients achieve their mental health goals.',
     true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Michael', 'Johnson', 'LIC005678',
     '["Trauma Therapy", "PTSD", "EMDR"]',
     '+1-555-0102',
     'Dr. Michael Johnson specializes in trauma recovery and PTSD treatment. With extensive training in EMDR and trauma-focused therapies, he helps clients process difficult experiences and build resilience.',
     true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Sarah', 'Wilson', 'LIC009876',
     '["Family Therapy", "Couples Counseling", "Child Psychology"]',
     '+1-555-0103',
     'Dr. Sarah Wilson is a family therapist with expertise in relationship counseling and child psychology. She works with families, couples, and children to improve communication and strengthen relationships.',
     true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'David', 'Brown', 'LIC054321',
     '["Addiction Recovery", "Substance Abuse", "Group Therapy"]',
     '+1-555-0104',
     'Dr. David Brown specializes in addiction recovery and substance abuse treatment. He combines individual and group therapy approaches to support clients in their journey to recovery.',
     false, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', 'Lisa', 'Davis', 'LIC098765',
     '["Eating Disorders", "Body Image", "Adolescent Therapy"]',
     '+1-555-0105',
     'Dr. Lisa Davis is an expert in eating disorders and adolescent therapy. She provides compassionate, specialized care for teens and young adults struggling with eating disorders and body image issues.',
     true, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;