package database

import (
	"context"
	"fmt"
	"time"

	"github.com/goran/thappy/internal/infrastructure/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

// NewPostgresConnection creates a new PostgreSQL connection pool
func NewPostgresConnection(cfg *config.Config) (*pgxpool.Pool, error) {
	// Create connection config
	poolConfig, err := pgxpool.ParseConfig(cfg.DatabaseDSN())
	if err != nil {
		return nil, fmt.Errorf("failed to parse database config: %w", err)
	}

	// Configure connection pool
	poolConfig.MaxConns = int32(cfg.Database.MaxOpenConns)
	poolConfig.MinConns = int32(cfg.Database.MaxIdleConns)
	poolConfig.MaxConnLifetime = cfg.Database.ConnMaxLifetime
	poolConfig.MaxConnIdleTime = 30 * time.Minute

	// Create connection pool
	pool, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return pool, nil
}

// CloseConnection gracefully closes the database connection
func CloseConnection(pool *pgxpool.Pool) {
	if pool != nil {
		pool.Close()
	}
}
