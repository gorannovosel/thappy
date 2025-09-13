import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TherapistsPage from './TherapistsPage';
import * as therapistDiscoveryApi from '../../services/therapistDiscovery';
import { TherapistProfile } from '../../types/api';

// Mock the API
jest.mock('../../services/therapistDiscovery', () => ({
  therapistDiscoveryApi: {
    getAcceptingTherapists: jest.fn(),
  },
}));

// Mock alert for contact functionality
global.alert = jest.fn();

const mockTherapistDiscoveryApi =
  therapistDiscoveryApi.therapistDiscoveryApi as jest.Mocked<
    typeof therapistDiscoveryApi.therapistDiscoveryApi
  >;

const mockTherapists: TherapistProfile[] = [
  {
    user_id: '1',
    first_name: 'Sarah',
    last_name: 'Johnson',
    license_number: 'LIC12345',
    phone: '555-123-4567',
    bio: 'Anxiety and depression specialist',
    specializations: ['Anxiety', 'Depression'],
    accepting_clients: true,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    user_id: '2',
    first_name: 'Michael',
    last_name: 'Chen',
    license_number: 'LIC67890',
    phone: '555-987-6543',
    bio: 'Trauma and PTSD therapy expert',
    specializations: ['Trauma', 'PTSD'],
    accepting_clients: true,
    created_at: '2021-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    user_id: '3',
    first_name: 'Emily',
    last_name: 'Davis',
    license_number: 'LIC11111',
    phone: '555-555-5555',
    bio: 'Family therapy and couples counseling',
    specializations: ['Family Therapy', 'Couples Counseling'],
    accepting_clients: false,
    created_at: '2019-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

describe('TherapistsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page header and description', () => {
    mockTherapistDiscoveryApi.getAcceptingTherapists.mockResolvedValue({
      therapists: [],
      message: 'Success',
    });

    render(<TherapistsPage />);

    expect(screen.getByText('Find a Therapist')).toBeInTheDocument();
    expect(
      screen.getByText(/Browse our network of licensed therapists/)
    ).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockTherapistDiscoveryApi.getAcceptingTherapists.mockImplementation(
      () => new Promise(() => {})
    ); // Never resolves

    render(<TherapistsPage />);

    expect(screen.getByText('Loading therapists...')).toBeInTheDocument();
  });

  it('displays therapists when loaded successfully', async () => {
    mockTherapistDiscoveryApi.getAcceptingTherapists.mockResolvedValue({
      therapists: mockTherapists,
      message: 'Success',
    });

    render(<TherapistsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    });

    expect(screen.getByText('Dr. Michael Chen')).toBeInTheDocument();
    expect(screen.getByText('Dr. Emily Davis')).toBeInTheDocument();
  });

  it('displays error state when API fails', async () => {
    mockTherapistDiscoveryApi.getAcceptingTherapists.mockRejectedValue(
      new Error('API Error')
    );

    render(<TherapistsPage />);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('retries loading when try again button is clicked', async () => {
    const user = userEvent.setup();

    // First call fails
    mockTherapistDiscoveryApi.getAcceptingTherapists.mockRejectedValueOnce(
      new Error('API Error')
    );
    // Second call succeeds
    mockTherapistDiscoveryApi.getAcceptingTherapists.mockResolvedValueOnce({
      therapists: mockTherapists,
      message: 'Success',
    });

    render(<TherapistsPage />);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByText('Try Again');
    await user.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    });
  });

  it('filters therapists by search term', async () => {
    const user = userEvent.setup();

    mockTherapistDiscoveryApi.getAcceptingTherapists.mockResolvedValue({
      therapists: mockTherapists,
      message: 'Success',
    });

    render(<TherapistsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /Search by name, specialization/
    );
    await user.type(searchInput, 'Sarah');

    expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Michael Chen')).not.toBeInTheDocument();
  });

  it('filters therapists by specialization', async () => {
    const user = userEvent.setup();

    mockTherapistDiscoveryApi.getAcceptingTherapists.mockResolvedValue({
      therapists: mockTherapists,
      message: 'Success',
    });

    render(<TherapistsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    });

    const specializationSelect = screen.getByLabelText(
      /Filter by Specialization/
    );
    await user.selectOptions(specializationSelect, 'Anxiety');

    expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Michael Chen')).not.toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', async () => {
    const user = userEvent.setup();

    mockTherapistDiscoveryApi.getAcceptingTherapists.mockResolvedValue({
      therapists: mockTherapists,
      message: 'Success',
    });

    render(<TherapistsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    });

    // Apply search filter
    const searchInput = screen.getByPlaceholderText(
      /Search by name, specialization/
    );
    await user.type(searchInput, 'Sarah');

    expect(screen.queryByText('Dr. Michael Chen')).not.toBeInTheDocument();

    // Clear filters
    const clearButton = screen.getByText('Clear Filters');
    await user.click(clearButton);

    expect(screen.getByText('Dr. Michael Chen')).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('shows filter results count', async () => {
    const user = userEvent.setup();

    mockTherapistDiscoveryApi.getAcceptingTherapists.mockResolvedValue({
      therapists: mockTherapists,
      message: 'Success',
    });

    render(<TherapistsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /Search by name, specialization/
    );
    await user.type(searchInput, 'Sarah');

    expect(screen.getByText('Showing 1 of 3 therapists')).toBeInTheDocument();
  });

  it('shows empty state when no therapists are found', async () => {
    mockTherapistDiscoveryApi.getAcceptingTherapists.mockResolvedValue({
      therapists: [],
      message: 'Success',
    });

    render(<TherapistsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('No therapists are currently accepting new clients.')
      ).toBeInTheDocument();
    });
  });

  it('shows no results for search criteria', async () => {
    const user = userEvent.setup();

    mockTherapistDiscoveryApi.getAcceptingTherapists.mockResolvedValue({
      therapists: mockTherapists,
      message: 'Success',
    });

    render(<TherapistsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /Search by name, specialization/
    );
    await user.type(searchInput, 'NonExistentTherapist');

    expect(
      screen.getByText('No therapists match your search criteria.')
    ).toBeInTheDocument();
    expect(screen.getByText('View All Therapists')).toBeInTheDocument();
  });

  it('handles contact therapist functionality', async () => {
    const user = userEvent.setup();

    mockTherapistDiscoveryApi.getAcceptingTherapists.mockResolvedValue({
      therapists: mockTherapists,
      message: 'Success',
    });

    render(<TherapistsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    });

    const contactButtons = screen.getAllByText('Contact Therapist');
    await user.click(contactButtons[0]); // Click first therapist's contact button

    expect(global.alert).toHaveBeenCalledWith(
      'Contact Dr. Sarah Johnson at 555-123-4567'
    );
  });

  it('populates specialization filter dropdown correctly', async () => {
    mockTherapistDiscoveryApi.getAcceptingTherapists.mockResolvedValue({
      therapists: mockTherapists,
      message: 'Success',
    });

    render(<TherapistsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    });

    screen.getByLabelText(/Filter by Specialization/) as HTMLSelectElement;
    const options = Array.from(screen.getAllByRole('option')).map(
      option => option.textContent
    );

    expect(options).toContain('All Specializations');
    expect(options).toContain('Anxiety');
    expect(options).toContain('Depression');
    expect(options).toContain('Trauma');
    expect(options).toContain('PTSD');
  });
});
