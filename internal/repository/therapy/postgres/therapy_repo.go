package postgres

import (
	"context"
	"errors"
	"strings"

	therapyDomain "github.com/goran/thappy/internal/domain/therapy"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TherapyRepository struct {
	db *pgxpool.Pool
}

func NewTherapyRepository(db *pgxpool.Pool) *TherapyRepository {
	return &TherapyRepository{
		db: db,
	}
}

func (r *TherapyRepository) Create(ctx context.Context, therapy *therapyDomain.Therapy) error {
	query := `
		INSERT INTO therapies (id, title, short_description, icon, detailed_info, when_needed, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := r.db.Exec(ctx, query,
		therapy.ID,
		therapy.Title,
		therapy.ShortDescription,
		therapy.Icon,
		therapy.DetailedInfo,
		therapy.WhenNeeded,
		therapy.IsActive,
		therapy.CreatedAt,
		therapy.UpdatedAt,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" && strings.Contains(pgErr.Detail, "id") {
				return therapyDomain.ErrTherapyAlreadyExists
			}
		}
		return err
	}

	return nil
}

func (r *TherapyRepository) GetByID(ctx context.Context, id string) (*therapyDomain.Therapy, error) {
	query := `
		SELECT id, title, short_description, icon, detailed_info, when_needed, is_active, created_at, updated_at
		FROM therapies
		WHERE id = $1
	`

	var t therapyDomain.Therapy
	err := r.db.QueryRow(ctx, query, id).Scan(
		&t.ID,
		&t.Title,
		&t.ShortDescription,
		&t.Icon,
		&t.DetailedInfo,
		&t.WhenNeeded,
		&t.IsActive,
		&t.CreatedAt,
		&t.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, therapyDomain.ErrTherapyNotFound
		}
		return nil, err
	}

	return &t, nil
}

func (r *TherapyRepository) GetAll(ctx context.Context) ([]*therapyDomain.Therapy, error) {
	query := `
		SELECT id, title, short_description, icon, detailed_info, when_needed, is_active, created_at, updated_at
		FROM therapies
		ORDER BY created_at ASC
	`

	return r.scanTherapies(ctx, query)
}

func (r *TherapyRepository) GetAllActive(ctx context.Context) ([]*therapyDomain.Therapy, error) {
	query := `
		SELECT id, title, short_description, icon, detailed_info, when_needed, is_active, created_at, updated_at
		FROM therapies
		WHERE is_active = true
		ORDER BY created_at ASC
	`

	return r.scanTherapies(ctx, query)
}

func (r *TherapyRepository) Update(ctx context.Context, therapy *therapyDomain.Therapy) error {
	query := `
		UPDATE therapies
		SET title = $2, short_description = $3, icon = $4, detailed_info = $5, when_needed = $6, is_active = $7, updated_at = $8
		WHERE id = $1
	`

	result, err := r.db.Exec(ctx, query,
		therapy.ID,
		therapy.Title,
		therapy.ShortDescription,
		therapy.Icon,
		therapy.DetailedInfo,
		therapy.WhenNeeded,
		therapy.IsActive,
		therapy.UpdatedAt,
	)

	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return therapyDomain.ErrTherapyNotFound
	}

	return nil
}

func (r *TherapyRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM therapies WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return therapyDomain.ErrTherapyNotFound
	}

	return nil
}

func (r *TherapyRepository) scanTherapies(ctx context.Context, query string, args ...interface{}) ([]*therapyDomain.Therapy, error) {
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var therapies []*therapyDomain.Therapy
	for rows.Next() {
		var t therapyDomain.Therapy
		err := rows.Scan(
			&t.ID,
			&t.Title,
			&t.ShortDescription,
			&t.Icon,
			&t.DetailedInfo,
			&t.WhenNeeded,
			&t.IsActive,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		therapies = append(therapies, &t)
	}

	return therapies, rows.Err()
}
