import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateProfileForm from './CreateProfileForm';
import * as clientProfileApi from '../../services/clientProfile';

// Mock the API
jest.mock('../../services/clientProfile', () => ({
  clientProfileApi: {
    createProfile: jest.fn(),
  },
}));

const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();

const mockClientProfileApi = clientProfileApi.clientProfileApi as jest.Mocked<
  typeof clientProfileApi.clientProfileApi
>;

describe('CreateProfileForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form elements correctly', () => {
    render(
      <CreateProfileForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    expect(screen.getByText('Create Your Profile')).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/emergency contact/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create profile/i })
    ).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(
      <CreateProfileForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const submitButton = screen.getByRole('button', {
      name: /create profile/i,
    });
    await user.click(submitButton);

    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
  });

  it('validates phone number format', async () => {
    const user = userEvent.setup();
    render(
      <CreateProfileForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const phoneInput = screen.getByLabelText(/phone number/i);

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(phoneInput, '123'); // Invalid phone

    const submitButton = screen.getByRole('button', {
      name: /create profile/i,
    });
    await user.click(submitButton);

    expect(
      screen.getByText('Please enter a valid phone number')
    ).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockProfile = {
      user_id: '1',
      first_name: 'John',
      last_name: 'Doe',
      phone: '123-456-7890',
      emergency_contact: 'Jane Doe',
      date_of_birth: null,
      therapist_id: null,
      notes: '',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    mockClientProfileApi.createProfile.mockResolvedValueOnce({
      profile: mockProfile,
      message: 'Profile created successfully',
    } as any);

    render(
      <CreateProfileForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    const emergencyContactInput = screen.getByLabelText(/emergency contact/i);

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(phoneInput, '123-456-7890');
    await user.type(emergencyContactInput, 'Jane Doe');

    const submitButton = screen.getByRole('button', {
      name: /create profile/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockClientProfileApi.createProfile).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        phone: '123-456-7890',
        emergency_contact: 'Jane Doe',
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(mockProfile);
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    mockClientProfileApi.createProfile.mockRejectedValueOnce(
      new Error('API Error')
    );

    render(
      <CreateProfileForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');

    const submitButton = screen.getByRole('button', {
      name: /create profile/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CreateProfileForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
