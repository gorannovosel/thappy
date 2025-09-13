import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as clientProfileApi from '../../services/clientProfile';
import { ClientProfile } from '../../types/api';
import EditProfileForm from './EditProfileForm';

// Mock the API
jest.mock('../../services/clientProfile', () => ({
  clientProfileApi: {
    updatePersonalInfo: jest.fn(),
    updateContactInfo: jest.fn(),
    setDateOfBirth: jest.fn(),
  },
}));

const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();

const mockClientProfileApi = clientProfileApi.clientProfileApi as jest.Mocked<
  typeof clientProfileApi.clientProfileApi
>;

const mockProfile: ClientProfile = {
  user_id: '1',
  first_name: 'John',
  last_name: 'Doe',
  phone: '123-456-7890',
  emergency_contact: 'Jane Doe',
  date_of_birth: '1990-01-01T00:00:00Z',
  therapist_id: null,
  notes: '',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

describe('EditProfileForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with existing profile data', () => {
    render(
      <EditProfileForm
        profile={mockProfile}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getAllByText('Date of Birth')).toHaveLength(2); // Section heading and label

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123-456-7890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument();
  });

  it('updates personal information successfully', async () => {
    const user = userEvent.setup();
    const updatedProfile = {
      ...mockProfile,
      first_name: 'Jane',
      last_name: 'Smith',
    };

    mockClientProfileApi.updatePersonalInfo.mockResolvedValueOnce({
      profile: updatedProfile,
      message: 'Personal information updated',
    } as any);

    render(
      <EditProfileForm
        profile={mockProfile}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const firstNameInput = screen.getByDisplayValue('John');
    const lastNameInput = screen.getByDisplayValue('Doe');

    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Smith');

    const updateButton = screen.getByRole('button', {
      name: /update personal info/i,
    });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockClientProfileApi.updatePersonalInfo).toHaveBeenCalledWith({
        first_name: 'Jane',
        last_name: 'Smith',
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(updatedProfile);
  });

  it('validates personal information fields', async () => {
    const user = userEvent.setup();
    render(
      <EditProfileForm
        profile={mockProfile}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const firstNameInput = screen.getByDisplayValue('John');
    await user.clear(firstNameInput);

    const updateButton = screen.getByRole('button', {
      name: /update personal info/i,
    });
    await user.click(updateButton);

    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(mockClientProfileApi.updatePersonalInfo).not.toHaveBeenCalled();
  });

  it('updates contact information successfully', async () => {
    const user = userEvent.setup();
    const updatedProfile = { ...mockProfile, phone: '987-654-3210' };

    mockClientProfileApi.updateContactInfo.mockResolvedValueOnce({
      profile: updatedProfile,
      message: 'Contact information updated',
    } as any);

    render(
      <EditProfileForm
        profile={mockProfile}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const phoneInput = screen.getByDisplayValue('123-456-7890');
    await user.clear(phoneInput);
    await user.type(phoneInput, '987-654-3210');

    const updateButton = screen.getByRole('button', {
      name: /update contact info/i,
    });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockClientProfileApi.updateContactInfo).toHaveBeenCalledWith({
        phone: '987-654-3210',
        emergency_contact: 'Jane Doe',
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(updatedProfile);
  });

  it('validates phone number format', async () => {
    const user = userEvent.setup();
    render(
      <EditProfileForm
        profile={mockProfile}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const phoneInput = screen.getByDisplayValue('123-456-7890');
    await user.clear(phoneInput);
    await user.type(phoneInput, '123'); // Invalid phone

    const updateButton = screen.getByRole('button', {
      name: /update contact info/i,
    });
    await user.click(updateButton);

    expect(
      screen.getByText('Please enter a valid phone number')
    ).toBeInTheDocument();
    expect(mockClientProfileApi.updateContactInfo).not.toHaveBeenCalled();
  });

  it('updates date of birth successfully', async () => {
    const user = userEvent.setup();
    const updatedProfile = {
      ...mockProfile,
      date_of_birth: '1995-06-15T00:00:00Z',
    };

    mockClientProfileApi.setDateOfBirth.mockResolvedValueOnce({
      profile: updatedProfile,
      message: 'Date of birth updated',
    } as any);

    render(
      <EditProfileForm
        profile={mockProfile}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const dateInput = screen.getByDisplayValue('1990-01-01');
    await user.clear(dateInput);
    await user.type(dateInput, '1995-06-15');

    const updateButton = screen.getByRole('button', {
      name: /update date of birth/i,
    });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockClientProfileApi.setDateOfBirth).toHaveBeenCalledWith({
        date_of_birth: '1995-06-15',
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(updatedProfile);
  });

  it('validates future date of birth', async () => {
    const user = userEvent.setup();
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];

    render(
      <EditProfileForm
        profile={mockProfile}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const dateInput = screen.getByDisplayValue('1990-01-01');
    await user.clear(dateInput);
    await user.type(dateInput, futureDateString);

    const updateButton = screen.getByRole('button', {
      name: /update date of birth/i,
    });
    await user.click(updateButton);

    expect(
      screen.getByText('Date of birth cannot be in the future')
    ).toBeInTheDocument();
    expect(mockClientProfileApi.setDateOfBirth).not.toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    mockClientProfileApi.updatePersonalInfo.mockRejectedValueOnce(
      new Error('API Error')
    );

    render(
      <EditProfileForm
        profile={mockProfile}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const updateButton = screen.getByRole('button', {
      name: /update personal info/i,
    });
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('calls onCancel when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EditProfileForm
        profile={mockProfile}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
