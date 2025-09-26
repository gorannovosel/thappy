CREATE TABLE IF NOT EXISTS therapies (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short_description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL,
    detailed_info TEXT NOT NULL,
    when_needed TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_therapies_is_active ON therapies(is_active);
CREATE INDEX idx_therapies_created_at ON therapies(created_at);

-- Create updated_at trigger for therapies table
CREATE TRIGGER update_therapies_updated_at
    BEFORE UPDATE ON therapies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();