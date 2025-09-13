import React, { useState } from 'react';
import { clientProfileApi } from '../../services/clientProfile';
import { ClientProfile } from '../../types/api';
import styles from './EditProfileForm.module.css';

interface EditProfileFormProps {
  profile: ClientProfile;
  onSuccess: (profile: ClientProfile) => void;
  onCancel: () => void;
}

interface PersonalInfoData {
  first_name: string;
  last_name: string;
}

interface ContactInfoData {
  phone: string;
  emergency_contact: string;
}

interface DateOfBirthData {
  date_of_birth: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
  emergency_contact?: string;
  date_of_birth?: string;
  general?: string;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  profile,
  onSuccess,
  onCancel,
}) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    first_name: profile.first_name,
    last_name: profile.last_name,
  });

  const [contactInfo, setContactInfo] = useState<ContactInfoData>({
    phone: profile.phone || '',
    emergency_contact: profile.emergency_contact || '',
  });

  const [dateOfBirth, setDateOfBirth] = useState<DateOfBirthData>({
    date_of_birth: profile.date_of_birth
      ? new Date(profile.date_of_birth).toISOString().split('T')[0]
      : '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState({
    personal: false,
    contact: false,
    dateOfBirth: false,
  });

  const validatePersonalInfo = (): boolean => {
    const newErrors: FormErrors = {};

    if (!personalInfo.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!personalInfo.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateContactInfo = (): boolean => {
    const newErrors: FormErrors = {};

    if (
      contactInfo.phone.trim() &&
      !/^\+?[\d\s\-()]{10,}$/.test(contactInfo.phone)
    ) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDateOfBirth = (): boolean => {
    const newErrors: FormErrors = {};

    if (
      dateOfBirth.date_of_birth &&
      new Date(dateOfBirth.date_of_birth) > new Date()
    ) {
      newErrors.date_of_birth = 'Date of birth cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePersonalInfo()) return;

    setLoading(prev => ({ ...prev, personal: true }));
    setErrors({});

    try {
      const response = await clientProfileApi.updatePersonalInfo({
        first_name: personalInfo.first_name.trim(),
        last_name: personalInfo.last_name.trim(),
      });
      onSuccess(response.profile);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Failed to update personal information',
      });
    } finally {
      setLoading(prev => ({ ...prev, personal: false }));
    }
  };

  const handleContactInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateContactInfo()) return;

    setLoading(prev => ({ ...prev, contact: true }));
    setErrors({});

    try {
      const requestData: { phone?: string; emergency_contact?: string } = {};

      if (contactInfo.phone.trim()) {
        requestData.phone = contactInfo.phone.trim();
      }

      if (contactInfo.emergency_contact.trim()) {
        requestData.emergency_contact = contactInfo.emergency_contact.trim();
      }

      const response = await clientProfileApi.updateContactInfo(requestData);
      onSuccess(response.profile);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Failed to update contact information',
      });
    } finally {
      setLoading(prev => ({ ...prev, contact: false }));
    }
  };

  const handleDateOfBirthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDateOfBirth()) return;

    setLoading(prev => ({ ...prev, dateOfBirth: true }));
    setErrors({});

    try {
      const requestData = {
        date_of_birth: dateOfBirth.date_of_birth || undefined,
      };

      const response = await clientProfileApi.setDateOfBirth(requestData);
      onSuccess(response.profile);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Failed to update date of birth',
      });
    } finally {
      setLoading(prev => ({ ...prev, dateOfBirth: false }));
    }
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<any>>, field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setter((prev: any) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <div className={styles.editForm}>
      <div className={styles.header}>
        <h2>Edit Profile</h2>
        <button onClick={onCancel} className={styles.closeButton}>
          ×
        </button>
      </div>

      {errors.general && (
        <div className={styles.error} role="alert">
          {errors.general}
        </div>
      )}

      {/* Personal Information Section */}
      <form onSubmit={handlePersonalInfoSubmit} className={styles.section}>
        <h3>Personal Information</h3>

        <div className={styles.formGroup}>
          <label htmlFor="edit_first_name" className={styles.label}>
            First Name *
          </label>
          <input
            id="edit_first_name"
            name="first_name"
            type="text"
            value={personalInfo.first_name}
            onChange={handleInputChange(setPersonalInfo, 'first_name')}
            className={`${styles.input} ${errors.first_name ? styles.inputError : ''}`}
            required
            disabled={loading.personal}
          />
          {errors.first_name && (
            <span className={styles.fieldError}>{errors.first_name}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="edit_last_name" className={styles.label}>
            Last Name *
          </label>
          <input
            id="edit_last_name"
            name="last_name"
            type="text"
            value={personalInfo.last_name}
            onChange={handleInputChange(setPersonalInfo, 'last_name')}
            className={`${styles.input} ${errors.last_name ? styles.inputError : ''}`}
            required
            disabled={loading.personal}
          />
          {errors.last_name && (
            <span className={styles.fieldError}>{errors.last_name}</span>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading.personal}
        >
          {loading.personal ? 'Updating...' : 'Update Personal Info'}
        </button>
      </form>

      {/* Contact Information Section */}
      <form onSubmit={handleContactInfoSubmit} className={styles.section}>
        <h3>Contact Information</h3>

        <div className={styles.formGroup}>
          <label htmlFor="edit_phone" className={styles.label}>
            Phone Number
          </label>
          <input
            id="edit_phone"
            name="phone"
            type="tel"
            value={contactInfo.phone}
            onChange={handleInputChange(setContactInfo, 'phone')}
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            disabled={loading.contact}
            placeholder="Optional"
          />
          {errors.phone && (
            <span className={styles.fieldError}>{errors.phone}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="edit_emergency_contact" className={styles.label}>
            Emergency Contact
          </label>
          <input
            id="edit_emergency_contact"
            name="emergency_contact"
            type="text"
            value={contactInfo.emergency_contact}
            onChange={handleInputChange(setContactInfo, 'emergency_contact')}
            className={styles.input}
            disabled={loading.contact}
            placeholder="Optional"
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading.contact}
        >
          {loading.contact ? 'Updating...' : 'Update Contact Info'}
        </button>
      </form>

      {/* Date of Birth Section */}
      <form onSubmit={handleDateOfBirthSubmit} className={styles.section}>
        <h3>Date of Birth</h3>

        <div className={styles.formGroup}>
          <label htmlFor="edit_date_of_birth" className={styles.label}>
            Date of Birth
          </label>
          <input
            id="edit_date_of_birth"
            name="date_of_birth"
            type="date"
            value={dateOfBirth.date_of_birth}
            onChange={handleInputChange(setDateOfBirth, 'date_of_birth')}
            className={`${styles.input} ${errors.date_of_birth ? styles.inputError : ''}`}
            disabled={loading.dateOfBirth}
          />
          {errors.date_of_birth && (
            <span className={styles.fieldError}>{errors.date_of_birth}</span>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading.dateOfBirth}
        >
          {loading.dateOfBirth ? 'Updating...' : 'Update Date of Birth'}
        </button>
      </form>

      <div className={styles.actions}>
        <button onClick={onCancel} className={styles.cancelButton}>
          Close
        </button>
      </div>
    </div>
  );
};

export default EditProfileForm;
