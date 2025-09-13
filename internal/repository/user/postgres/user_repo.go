package postgres

import (
	"context"
	"errors"
	"strings"

	userDomain "github.com/goran/thappy/internal/domain/user"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (r *UserRepository) Create(ctx context.Context, user *userDomain.User) error {
	query := `
		INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := r.db.Exec(ctx, query,
		user.ID,
		user.Email,
		user.PasswordHash,
		user.Role,
		user.IsActive,
		user.CreatedAt,
		user.UpdatedAt,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" && strings.Contains(pgErr.Detail, "email") {
				return userDomain.ErrUserAlreadyExists
			}
		}
		return err
	}

	return nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*userDomain.User, error) {
	query := `
		SELECT id, email, password_hash, role, is_active, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	var u userDomain.User
	err := r.db.QueryRow(ctx, query, email).Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.Role,
		&u.IsActive,
		&u.CreatedAt,
		&u.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, userDomain.ErrUserNotFound
		}
		return nil, err
	}

	return &u, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*userDomain.User, error) {
	query := `
		SELECT id, email, password_hash, role, is_active, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var u userDomain.User
	err := r.db.QueryRow(ctx, query, id).Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.Role,
		&u.IsActive,
		&u.CreatedAt,
		&u.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, userDomain.ErrUserNotFound
		}
		return nil, err
	}

	return &u, nil
}

func (r *UserRepository) Update(ctx context.Context, user *userDomain.User) error {
	query := `
		UPDATE users
		SET email = $2, password_hash = $3, role = $4, is_active = $5, updated_at = $6
		WHERE id = $1
	`

	result, err := r.db.Exec(ctx, query,
		user.ID,
		user.Email,
		user.PasswordHash,
		user.Role,
		user.IsActive,
		user.UpdatedAt,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" && strings.Contains(pgErr.Detail, "email") {
				return userDomain.ErrUserAlreadyExists
			}
		}
		return err
	}

	if result.RowsAffected() == 0 {
		return userDomain.ErrUserNotFound
	}

	return nil
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return userDomain.ErrUserNotFound
	}

	return nil
}

func (r *UserRepository) GetByRole(ctx context.Context, role userDomain.UserRole) ([]*userDomain.User, error) {
	query := `
		SELECT id, email, password_hash, role, is_active, created_at, updated_at
		FROM users
		WHERE role = $1
		ORDER BY created_at DESC
	`

	return r.scanUsers(ctx, query, role)
}

func (r *UserRepository) GetActiveUsers(ctx context.Context) ([]*userDomain.User, error) {
	query := `
		SELECT id, email, password_hash, role, is_active, created_at, updated_at
		FROM users
		WHERE is_active = true
		ORDER BY created_at DESC
	`

	return r.scanUsers(ctx, query)
}

func (r *UserRepository) GetActiveUsersByRole(ctx context.Context, role userDomain.UserRole) ([]*userDomain.User, error) {
	query := `
		SELECT id, email, password_hash, role, is_active, created_at, updated_at
		FROM users
		WHERE role = $1 AND is_active = true
		ORDER BY created_at DESC
	`

	return r.scanUsers(ctx, query, role)
}

func (r *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`

	var exists bool
	err := r.db.QueryRow(ctx, query, email).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (r *UserRepository) scanUsers(ctx context.Context, query string, args ...interface{}) ([]*userDomain.User, error) {
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*userDomain.User
	for rows.Next() {
		var u userDomain.User
		err := rows.Scan(
			&u.ID,
			&u.Email,
			&u.PasswordHash,
			&u.Role,
			&u.IsActive,
			&u.CreatedAt,
			&u.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, &u)
	}

	return users, rows.Err()
}
