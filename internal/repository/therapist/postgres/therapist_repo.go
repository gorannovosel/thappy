package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	therapistDomain "github.com/goran/thappy/internal/domain/therapist"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TherapistRepository struct {
	db *pgxpool.Pool
}

func NewTherapistRepository(db *pgxpool.Pool) *TherapistRepository {
	return &TherapistRepository{
		db: db,
	}
}

func (r *TherapistRepository) Create(ctx context.Context, profile *therapistDomain.TherapistProfile) error {
	specializationsJSON, err := json.Marshal(profile.Specializations)
	if err != nil {
		return fmt.Errorf("failed to marshal specializations: %w", err)
	}

	query := `
		INSERT INTO therapist_profiles (
			user_id, first_name, last_name, license_number, specializations,
			phone, bio, is_accepting_clients, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err = r.db.Exec(ctx, query,
		profile.UserID,
		profile.FirstName,
		profile.LastName,
		profile.LicenseNumber,
		specializationsJSON,
		profile.Phone,
		profile.Bio,
		profile.IsAcceptingClients,
		profile.CreatedAt,
		profile.UpdatedAt,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				if strings.Contains(pgErr.Detail, "license_number") {
					return therapistDomain.ErrLicenseNumberAlreadyExists
				}
				return therapistDomain.ErrTherapistProfileAlreadyExists
			}
			if pgErr.Code == "23503" {
				return therapistDomain.ErrInvalidTherapistData
			}
		}
		return err
	}

	return nil
}

func (r *TherapistRepository) GetByUserID(ctx context.Context, userID string) (*therapistDomain.TherapistProfile, error) {
	query := `
		SELECT user_id, first_name, last_name, license_number, specializations,
			   phone, bio, is_accepting_clients, created_at, updated_at
		FROM therapist_profiles
		WHERE user_id = $1
	`

	var profile therapistDomain.TherapistProfile
	var specializationsJSON []byte

	err := r.db.QueryRow(ctx, query, userID).Scan(
		&profile.UserID,
		&profile.FirstName,
		&profile.LastName,
		&profile.LicenseNumber,
		&specializationsJSON,
		&profile.Phone,
		&profile.Bio,
		&profile.IsAcceptingClients,
		&profile.CreatedAt,
		&profile.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, therapistDomain.ErrTherapistProfileNotFound
		}
		return nil, err
	}

	err = json.Unmarshal(specializationsJSON, &profile.Specializations)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal specializations: %w", err)
	}

	return &profile, nil
}

func (r *TherapistRepository) GetByLicenseNumber(ctx context.Context, licenseNumber string) (*therapistDomain.TherapistProfile, error) {
	query := `
		SELECT user_id, first_name, last_name, license_number, specializations,
			   phone, bio, is_accepting_clients, created_at, updated_at
		FROM therapist_profiles
		WHERE license_number = $1
	`

	var profile therapistDomain.TherapistProfile
	var specializationsJSON []byte

	err := r.db.QueryRow(ctx, query, licenseNumber).Scan(
		&profile.UserID,
		&profile.FirstName,
		&profile.LastName,
		&profile.LicenseNumber,
		&specializationsJSON,
		&profile.Phone,
		&profile.Bio,
		&profile.IsAcceptingClients,
		&profile.CreatedAt,
		&profile.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, therapistDomain.ErrTherapistProfileNotFound
		}
		return nil, err
	}

	err = json.Unmarshal(specializationsJSON, &profile.Specializations)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal specializations: %w", err)
	}

	return &profile, nil
}

func (r *TherapistRepository) Update(ctx context.Context, profile *therapistDomain.TherapistProfile) error {
	specializationsJSON, err := json.Marshal(profile.Specializations)
	if err != nil {
		return fmt.Errorf("failed to marshal specializations: %w", err)
	}

	query := `
		UPDATE therapist_profiles
		SET first_name = $2, last_name = $3, license_number = $4, specializations = $5,
			phone = $6, bio = $7, is_accepting_clients = $8, updated_at = $9
		WHERE user_id = $1
	`

	result, err := r.db.Exec(ctx, query,
		profile.UserID,
		profile.FirstName,
		profile.LastName,
		profile.LicenseNumber,
		specializationsJSON,
		profile.Phone,
		profile.Bio,
		profile.IsAcceptingClients,
		profile.UpdatedAt,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" && strings.Contains(pgErr.Detail, "license_number") {
				return therapistDomain.ErrLicenseNumberAlreadyExists
			}
			if pgErr.Code == "23503" {
				return therapistDomain.ErrInvalidTherapistData
			}
		}
		return err
	}

	if result.RowsAffected() == 0 {
		return therapistDomain.ErrTherapistProfileNotFound
	}

	return nil
}

func (r *TherapistRepository) Delete(ctx context.Context, userID string) error {
	query := `DELETE FROM therapist_profiles WHERE user_id = $1`

	result, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return therapistDomain.ErrTherapistProfileNotFound
	}

	return nil
}

func (r *TherapistRepository) GetAcceptingClients(ctx context.Context) ([]*therapistDomain.TherapistProfile, error) {
	query := `
		SELECT tp.user_id, tp.first_name, tp.last_name, tp.license_number, tp.specializations,
			   tp.phone, tp.bio, tp.is_accepting_clients, tp.created_at, tp.updated_at
		FROM therapist_profiles tp
		INNER JOIN users u ON tp.user_id = u.id
		WHERE tp.is_accepting_clients = true AND u.is_active = true
		ORDER BY tp.first_name, tp.last_name
	`

	return r.scanTherapistProfiles(ctx, query)
}

func (r *TherapistRepository) GetBySpecialization(ctx context.Context, specialization string) ([]*therapistDomain.TherapistProfile, error) {
	query := `
		SELECT tp.user_id, tp.first_name, tp.last_name, tp.license_number, tp.specializations,
			   tp.phone, tp.bio, tp.is_accepting_clients, tp.created_at, tp.updated_at
		FROM therapist_profiles tp
		INNER JOIN users u ON tp.user_id = u.id
		WHERE tp.specializations @> $1 AND u.is_active = true
		ORDER BY tp.first_name, tp.last_name
	`

	specializationJSON, err := json.Marshal([]string{specialization})
	if err != nil {
		return nil, fmt.Errorf("failed to marshal specialization: %w", err)
	}

	return r.scanTherapistProfiles(ctx, query, specializationJSON)
}

func (r *TherapistRepository) SearchTherapists(ctx context.Context, filters therapistDomain.TherapistSearchFilters) ([]*therapistDomain.TherapistProfile, error) {
	var queryParts []string
	var args []interface{}
	argIndex := 1

	baseQuery := `
		SELECT tp.user_id, tp.first_name, tp.last_name, tp.license_number, tp.specializations,
			   tp.phone, tp.bio, tp.is_accepting_clients, tp.created_at, tp.updated_at
		FROM therapist_profiles tp
		INNER JOIN users u ON tp.user_id = u.id
		WHERE u.is_active = true
	`

	if filters.AcceptingClients != nil {
		queryParts = append(queryParts, fmt.Sprintf("tp.is_accepting_clients = $%d", argIndex))
		args = append(args, *filters.AcceptingClients)
		argIndex++
	}

	if len(filters.Specializations) > 0 {
		for _, spec := range filters.Specializations {
			specializationJSON, err := json.Marshal([]string{spec})
			if err != nil {
				return nil, fmt.Errorf("failed to marshal specialization: %w", err)
			}
			queryParts = append(queryParts, fmt.Sprintf("tp.specializations @> $%d", argIndex))
			args = append(args, specializationJSON)
			argIndex++
		}
	}

	if filters.SearchText != "" {
		searchPattern := "%" + strings.ToLower(filters.SearchText) + "%"
		queryParts = append(queryParts, fmt.Sprintf("(LOWER(tp.first_name) LIKE $%d OR LOWER(tp.last_name) LIKE $%d OR LOWER(tp.bio) LIKE $%d)", argIndex, argIndex, argIndex))
		args = append(args, searchPattern)
		argIndex++
	}

	var whereClause string
	if len(queryParts) > 0 {
		whereClause = " AND " + strings.Join(queryParts, " AND ")
	}

	orderClause := " ORDER BY tp.first_name, tp.last_name"

	var limitClause string
	if filters.Limit > 0 {
		limitClause = fmt.Sprintf(" LIMIT $%d", argIndex)
		args = append(args, filters.Limit)
		argIndex++

		if filters.Offset > 0 {
			limitClause += fmt.Sprintf(" OFFSET $%d", argIndex)
			args = append(args, filters.Offset)
		}
	}

	finalQuery := baseQuery + whereClause + orderClause + limitClause

	return r.scanTherapistProfiles(ctx, finalQuery, args...)
}

func (r *TherapistRepository) ExistsByUserID(ctx context.Context, userID string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM therapist_profiles WHERE user_id = $1)`

	var exists bool
	err := r.db.QueryRow(ctx, query, userID).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (r *TherapistRepository) ExistsByLicenseNumber(ctx context.Context, licenseNumber string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM therapist_profiles WHERE license_number = $1)`

	var exists bool
	err := r.db.QueryRow(ctx, query, licenseNumber).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (r *TherapistRepository) scanTherapistProfiles(ctx context.Context, query string, args ...interface{}) ([]*therapistDomain.TherapistProfile, error) {
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var profiles []*therapistDomain.TherapistProfile
	for rows.Next() {
		var profile therapistDomain.TherapistProfile
		var specializationsJSON []byte

		err := rows.Scan(
			&profile.UserID,
			&profile.FirstName,
			&profile.LastName,
			&profile.LicenseNumber,
			&specializationsJSON,
			&profile.Phone,
			&profile.Bio,
			&profile.IsAcceptingClients,
			&profile.CreatedAt,
			&profile.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		err = json.Unmarshal(specializationsJSON, &profile.Specializations)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal specializations: %w", err)
		}

		profiles = append(profiles, &profile)
	}

	return profiles, rows.Err()
}
