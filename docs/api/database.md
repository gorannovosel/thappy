# Database Schema

This document describes the database structure, relationships, and migration system for the Thappy API.

## Database Information

- **Database Engine:** PostgreSQL 15
- **Connection Details:**
  - Host: `localhost` (external) / `postgres` (internal Docker)
  - Port: `5433` (external) / `5432` (internal Docker)
  - Database: `thappy`
  - Username: `thappy`
  - Password: `thappy_dev_password`

## Schema Overview

### Users Table

The main table storing user account information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address (used for login) |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

#### Indexes

```sql
-- Primary key index (automatic)
CREATE UNIQUE INDEX users_pkey ON users USING btree (id);

-- Email unique constraint index (automatic)  
CREATE UNIQUE INDEX users_email_key ON users USING btree (email);

-- Email search optimization
CREATE INDEX idx_users_email ON users USING btree (email);
```

#### Triggers

```sql
-- Auto-update updated_at column on row updates
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Constraints

- **Primary Key:** `id` field ensures each user has a unique identifier
- **Unique Email:** `email` field prevents duplicate email addresses
- **Not Null:** Both `email` and `password_hash` are required fields

### Schema Migrations Table

Automatically created by the migration system to track applied migrations.

```sql
CREATE TABLE schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL,
    PRIMARY KEY (version)
);
```

## Migration System

### Migration Files

Located in `/migrations/` directory:

- `000001_create_users_table.up.sql` - Creates users table and related objects
- `000001_create_users_table.down.sql` - Drops users table and related objects

### Running Migrations

```bash
# Apply all pending migrations
make migrate-up

# Rollback the last migration
make migrate-down

# Create a new migration
make migrate-create NAME=add_user_profiles
```

### Migration Commands

```bash
# Direct Docker commands
docker-compose run --rm migrate -path /migrations -database "postgres://thappy:thappy_dev_password@postgres:5432/thappy?sslmode=disable" up
docker-compose run --rm migrate -path /migrations -database "postgres://thappy:thappy_dev_password@postgres:5432/thappy?sslmode=disable" down 1
```

## Data Types and Validation

### User Entity Validation

The application enforces these validation rules:

#### Email Validation
- Must contain `@` and `.` characters
- Must have valid format with parts before and after `@`
- Must be unique across all users
- Stored in lowercase

#### Password Validation  
- Minimum 8 characters length
- Hashed using bcrypt with default cost (currently 10)
- Original password is never stored

#### ID Generation
- Uses PostgreSQL's `uuid_generate_v4()` function
- Fallback to application-generated UUID if database function fails

## Database Queries

### Common Queries

#### Create User
```sql
INSERT INTO users (id, email, password_hash, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5);
```

#### Find User by Email
```sql
SELECT id, email, password_hash, created_at, updated_at
FROM users
WHERE email = $1;
```

#### Find User by ID
```sql
SELECT id, email, password_hash, created_at, updated_at
FROM users
WHERE id = $1;
```

#### Update User
```sql
UPDATE users
SET email = $2, password_hash = $3, updated_at = $4
WHERE id = $1;
```

#### Delete User
```sql
DELETE FROM users WHERE id = $1;
```

## Connection Configuration

### Environment Variables

```bash
# Database connection settings
DB_HOST=localhost
DB_PORT=5433
DB_USER=thappy
DB_PASSWORD=thappy_dev_password
DB_NAME=thappy
DB_SSLMODE=disable

# Connection pool settings
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=5
DB_CONN_MAX_LIFETIME=300s
```

### Connection Pool

The application uses `pgxpool` for connection pooling:

- **Max Open Connections:** 25
- **Max Idle Connections:** 5
- **Connection Lifetime:** 5 minutes

## Backup and Restore

### Backup Database

```bash
# Backup to file
docker-compose exec postgres pg_dump -U thappy thappy > backup.sql

# Backup with compression
docker-compose exec postgres pg_dump -U thappy thappy | gzip > backup.sql.gz
```

### Restore Database

```bash
# Restore from file
docker-compose exec -T postgres psql -U thappy thappy < backup.sql

# Restore from compressed file
gunzip -c backup.sql.gz | docker-compose exec -T postgres psql -U thappy thappy
```

## Performance Considerations

### Current Indexes
- Primary key on `id` (UUID) - Fast lookups by user ID
- Unique index on `email` - Fast authentication queries
- Additional email index for optimization

### Future Optimizations
- Consider adding indexes on `created_at` if needed for user registration analytics
- Monitor query performance and add indexes as needed
- Consider partitioning if user base grows significantly

## Security

### Password Security
- Passwords are hashed using bcrypt with default cost
- Original passwords are never stored or logged
- Password hashes are not exposed in API responses

### Database Security
- Connection uses dedicated database user (`thappy`)
- SSL mode disabled for development (should be enabled in production)
- Database runs in isolated Docker container

### Future Security Enhancements
- Enable SSL for database connections in production
- Implement database connection encryption
- Add audit logging for sensitive operations
- Consider rotating database credentials

## Monitoring

### Health Checks
```sql
-- Check database connectivity
SELECT 1;

-- Check user table status
SELECT COUNT(*) FROM users;

-- Check recent activity
SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours';
```

### Useful Queries for Monitoring

```sql
-- User registration statistics
SELECT 
    DATE(created_at) as date,
    COUNT(*) as registrations
FROM users 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- Active users (based on recent updates)
SELECT COUNT(*) 
FROM users 
WHERE updated_at > NOW() - INTERVAL '24 hours';
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if PostgreSQL container is running: `docker-compose ps`
   - Verify port mapping: should be `5433:5432`

2. **Authentication Failed**
   - Verify username/password: `thappy/thappy_dev_password`
   - Check environment variables in docker-compose.yml

3. **Migration Errors**
   - Check SELinux: volume mount should have `:Z` flag
   - Verify migration files are accessible: `ls -la migrations/`

4. **Performance Issues**
   - Check connection pool settings
   - Monitor slow queries with `EXPLAIN ANALYZE`
   - Consider adding indexes for frequent queries