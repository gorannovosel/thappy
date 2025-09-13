import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TherapistCard from './TherapistCard';
import { TherapistProfile } from '../../types/api';

const mockTherapist: TherapistProfile = {
  user_id: '1',
  first_name: 'Sarah',
  last_name: 'Johnson',
  license_number: 'LIC12345',
  phone: '555-123-4567',
  bio: 'I am a licensed clinical psychologist with over 10 years of experience helping individuals overcome anxiety, depression, and trauma. My approach combines cognitive-behavioral therapy with mindfulness techniques.',
  specializations: ['Anxiety', 'Depression', 'Trauma'],
  accepting_clients: true,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

const mockTherapistNotAccepting: TherapistProfile = {
  ...mockTherapist,
  user_id: '2',
  accepting_clients: false,
};

const mockTherapistLongBio: TherapistProfile = {
  ...mockTherapist,
  user_id: '3',
  bio: 'This is a very long bio that should be truncated in the card display. '.repeat(
    10
  ),
};

const mockTherapistMinimal: TherapistProfile = {
  user_id: '4',
  first_name: 'John',
  last_name: 'Smith',
  license_number: 'LIC67890',
  phone: '',
  bio: '',
  specializations: [],
  accepting_clients: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

describe('TherapistCard', () => {
  it('renders therapist information correctly', () => {
    render(<TherapistCard therapist={mockTherapist} />);

    expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('License: LIC12345')).toBeInTheDocument();
    expect(screen.getByText('Phone:')).toBeInTheDocument();
    expect(screen.getByText('555-123-4567')).toBeInTheDocument();
    expect(screen.getByText('Accepting Clients')).toBeInTheDocument();
    expect(screen.getByText('Contact Therapist')).toBeInTheDocument();
    expect(screen.getByText('Member since 2020')).toBeInTheDocument();
  });

  it('displays specializations correctly', () => {
    render(<TherapistCard therapist={mockTherapist} />);

    expect(screen.getByText('Specializations')).toBeInTheDocument();
    expect(
      screen.getByText('Anxiety • Depression • Trauma')
    ).toBeInTheDocument();
  });

  it('displays bio section when bio exists', () => {
    render(<TherapistCard therapist={mockTherapist} />);

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(
      screen.getByText(/I am a licensed clinical psychologist/)
    ).toBeInTheDocument();
  });

  it('truncates long bio text', () => {
    render(<TherapistCard therapist={mockTherapistLongBio} />);

    const bioElement = screen.getByText(/This is a very long bio/);
    expect(bioElement.textContent).toMatch(/\.\.\.$/); // Should end with ellipsis
    expect(bioElement.textContent!.length).toBeLessThan(
      mockTherapistLongBio.bio!.length
    );
  });

  it('handles therapist not accepting clients', () => {
    render(<TherapistCard therapist={mockTherapistNotAccepting} />);

    expect(screen.queryByText('Accepting Clients')).not.toBeInTheDocument();

    const button = screen.getByText('Not Accepting Clients');
    expect(button).toBeDisabled();
  });

  it('handles minimal therapist data gracefully', () => {
    render(<TherapistCard therapist={mockTherapistMinimal} />);

    expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
    expect(screen.getByText('License: LIC67890')).toBeInTheDocument();

    // Should not display empty sections (no specializations section for empty array)
    expect(screen.queryByText('Specializations')).not.toBeInTheDocument();
    expect(screen.queryByText('About')).not.toBeInTheDocument();
    expect(screen.queryByText('Phone:')).not.toBeInTheDocument();
  });

  it('formats specializations correctly for different counts', () => {
    // Single specialization
    const singleSpec = { ...mockTherapist, specializations: ['Anxiety'] };
    const { rerender } = render(<TherapistCard therapist={singleSpec} />);
    expect(screen.getByText('Anxiety')).toBeInTheDocument();

    // Two specializations
    const twoSpecs = {
      ...mockTherapist,
      specializations: ['Anxiety', 'Depression'],
    };
    rerender(<TherapistCard therapist={twoSpecs} />);
    expect(screen.getByText('Anxiety • Depression')).toBeInTheDocument();

    // Many specializations (should show +more)
    const manySpecs = {
      ...mockTherapist,
      specializations: ['Anxiety', 'Depression', 'Trauma', 'PTSD', 'Bipolar'],
    };
    rerender(<TherapistCard therapist={manySpecs} />);
    expect(
      screen.getByText('Anxiety • Depression +3 more')
    ).toBeInTheDocument();
  });

  it('calls onContact when contact button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnContact = jest.fn();

    render(
      <TherapistCard therapist={mockTherapist} onContact={mockOnContact} />
    );

    const contactButton = screen.getByText('Contact Therapist');
    await user.click(contactButton);

    expect(mockOnContact).toHaveBeenCalledWith(mockTherapist);
  });

  it('does not call onContact when therapist not accepting clients', async () => {
    const user = userEvent.setup();
    const mockOnContact = jest.fn();

    render(
      <TherapistCard
        therapist={mockTherapistNotAccepting}
        onContact={mockOnContact}
      />
    );

    const contactButton = screen.getByText('Not Accepting Clients');
    await user.click(contactButton);

    expect(mockOnContact).not.toHaveBeenCalled();
  });

  it('works without onContact callback', async () => {
    const user = userEvent.setup();

    render(<TherapistCard therapist={mockTherapist} />);

    const contactButton = screen.getByText('Contact Therapist');

    // Should not throw error when clicking without callback
    await expect(user.click(contactButton)).resolves.not.toThrow();
  });
});
