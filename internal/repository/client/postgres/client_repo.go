package postgres

import (
	"context"
	"errors"

	clientDomain "github.com/goran/thappy/internal/domain/client"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ClientRepository struct {
	db *pgxpool.Pool
}

func NewClientRepository(db *pgxpool.Pool) *ClientRepository {
	return &ClientRepository{
		db: db,
	}
}

func (r *ClientRepository) Create(ctx context.Context, profile *clientDomain.ClientProfile) error {
	query := `
		INSERT INTO client_profiles (
			user_id, first_name, last_name, date_of_birth, phone,
			emergency_contact, therapist_id, notes, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err := r.db.Exec(ctx, query,
		profile.UserID,
		profile.FirstName,
		profile.LastName,
		profile.DateOfBirth,
		profile.Phone,
		profile.EmergencyContact,
		profile.TherapistID,
		profile.Notes,
		profile.CreatedAt,
		profile.UpdatedAt,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				return clientDomain.ErrClientProfileAlreadyExists
			}
			if pgErr.Code == "23503" {
				return clientDomain.ErrInvalidClientData
			}
		}
		return err
	}

	return nil
}

func (r *ClientRepository) GetByUserID(ctx context.Context, userID string) (*clientDomain.ClientProfile, error) {
	query := `
		SELECT user_id, first_name, last_name, date_of_birth, phone,
			   emergency_contact, therapist_id, notes, created_at, updated_at
		FROM client_profiles
		WHERE user_id = $1
	`

	var profile clientDomain.ClientProfile
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&profile.UserID,
		&profile.FirstName,
		&profile.LastName,
		&profile.DateOfBirth,
		&profile.Phone,
		&profile.EmergencyContact,
		&profile.TherapistID,
		&profile.Notes,
		&profile.CreatedAt,
		&profile.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, clientDomain.ErrClientProfileNotFound
		}
		return nil, err
	}

	return &profile, nil
}

func (r *ClientRepository) Update(ctx context.Context, profile *clientDomain.ClientProfile) error {
	query := `
		UPDATE client_profiles
		SET first_name = $2, last_name = $3, date_of_birth = $4, phone = $5,
			emergency_contact = $6, therapist_id = $7, notes = $8, updated_at = $9
		WHERE user_id = $1
	`

	result, err := r.db.Exec(ctx, query,
		profile.UserID,
		profile.FirstName,
		profile.LastName,
		profile.DateOfBirth,
		profile.Phone,
		profile.EmergencyContact,
		profile.TherapistID,
		profile.Notes,
		profile.UpdatedAt,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23503" {
				return clientDomain.ErrInvalidClientData
			}
		}
		return err
	}

	if result.RowsAffected() == 0 {
		return clientDomain.ErrClientProfileNotFound
	}

	return nil
}

func (r *ClientRepository) Delete(ctx context.Context, userID string) error {
	query := `DELETE FROM client_profiles WHERE user_id = $1`

	result, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return clientDomain.ErrClientProfileNotFound
	}

	return nil
}

func (r *ClientRepository) GetByTherapistID(ctx context.Context, therapistID string) ([]*clientDomain.ClientProfile, error) {
	query := `
		SELECT user_id, first_name, last_name, date_of_birth, phone,
			   emergency_contact, therapist_id, notes, created_at, updated_at
		FROM client_profiles
		WHERE therapist_id = $1
		ORDER BY first_name, last_name
	`

	rows, err := r.db.Query(ctx, query, therapistID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var profiles []*clientDomain.ClientProfile
	for rows.Next() {
		var profile clientDomain.ClientProfile
		err := rows.Scan(
			&profile.UserID,
			&profile.FirstName,
			&profile.LastName,
			&profile.DateOfBirth,
			&profile.Phone,
			&profile.EmergencyContact,
			&profile.TherapistID,
			&profile.Notes,
			&profile.CreatedAt,
			&profile.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		profiles = append(profiles, &profile)
	}

	return profiles, rows.Err()
}

func (r *ClientRepository) GetActiveClients(ctx context.Context) ([]*clientDomain.ClientProfile, error) {
	query := `
		SELECT cp.user_id, cp.first_name, cp.last_name, cp.date_of_birth, cp.phone,
			   cp.emergency_contact, cp.therapist_id, cp.notes, cp.created_at, cp.updated_at
		FROM client_profiles cp
		INNER JOIN users u ON cp.user_id = u.id
		WHERE u.is_active = true
		ORDER BY cp.first_name, cp.last_name
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var profiles []*clientDomain.ClientProfile
	for rows.Next() {
		var profile clientDomain.ClientProfile
		err := rows.Scan(
			&profile.UserID,
			&profile.FirstName,
			&profile.LastName,
			&profile.DateOfBirth,
			&profile.Phone,
			&profile.EmergencyContact,
			&profile.TherapistID,
			&profile.Notes,
			&profile.CreatedAt,
			&profile.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		profiles = append(profiles, &profile)
	}

	return profiles, rows.Err()
}

func (r *ClientRepository) ExistsByUserID(ctx context.Context, userID string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM client_profiles WHERE user_id = $1)`

	var exists bool
	err := r.db.QueryRow(ctx, query, userID).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}
