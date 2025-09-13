-- Add role and is_active columns to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'client';
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add index for role-based queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_role_active ON users(role, is_active);

-- Create client_profiles table
CREATE TABLE IF NOT EXISTS client_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    emergency_contact VARCHAR(255),
    therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create therapist_profiles table
CREATE TABLE IF NOT EXISTS therapist_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    specializations JSONB DEFAULT '[]',
    phone VARCHAR(20),
    bio TEXT,
    is_accepting_clients BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Role validation for therapist_id will be enforced at application level
-- PostgreSQL doesn't support subqueries in CHECK constraints
-- The foreign key constraint ensures therapist_id references a valid user

-- Create indexes for performance
CREATE INDEX idx_client_profiles_therapist_id ON client_profiles(therapist_id);
CREATE INDEX idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX idx_client_profiles_name ON client_profiles(first_name, last_name);

CREATE INDEX idx_therapist_profiles_license ON therapist_profiles(license_number);
CREATE INDEX idx_therapist_profiles_accepting ON therapist_profiles(is_accepting_clients);
CREATE INDEX idx_therapist_profiles_specializations ON therapist_profiles USING gin(specializations);
CREATE INDEX idx_therapist_profiles_name ON therapist_profiles(first_name, last_name);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_client_profiles_updated_at
    BEFORE UPDATE ON client_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapist_profiles_updated_at
    BEFORE UPDATE ON therapist_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();