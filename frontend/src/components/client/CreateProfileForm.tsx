import React, { useState } from 'react';
import { clientProfileApi } from '../../services/clientProfile';
import { ClientProfile } from '../../types/api';
import styles from './CreateProfileForm.module.css';

interface CreateProfileFormProps {
  onSuccess: (profile: ClientProfile) => void;
  onCancel?: () => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  emergency_contact: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
  emergency_contact?: string;
  general?: string;
}

const CreateProfileForm: React.FC<CreateProfileFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    phone: '',
    emergency_contact: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (formData.phone.trim() && !/^\+?[\d\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const requestData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        ...(formData.phone.trim() && { phone: formData.phone.trim() }),
        ...(formData.emergency_contact.trim() && {
          emergency_contact: formData.emergency_contact.trim(),
        }),
      };

      const response = await clientProfileApi.createProfile(requestData);
      onSuccess(response.profile);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Failed to create profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h2>Create Your Profile</h2>
        <p>Let's set up your client profile to get started.</p>
      </div>

      {errors.general && (
        <div className={styles.error} role="alert">
          {errors.general}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="first_name" className={styles.label}>
          First Name *
        </label>
        <input
          id="first_name"
          name="first_name"
          type="text"
          value={formData.first_name}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.first_name ? styles.inputError : ''}`}
          required
          disabled={isLoading}
          aria-describedby={errors.first_name ? 'first_name-error' : undefined}
        />
        {errors.first_name && (
          <span
            id="first_name-error"
            className={styles.fieldError}
            role="alert"
          >
            {errors.first_name}
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="last_name" className={styles.label}>
          Last Name *
        </label>
        <input
          id="last_name"
          name="last_name"
          type="text"
          value={formData.last_name}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.last_name ? styles.inputError : ''}`}
          required
          disabled={isLoading}
          aria-describedby={errors.last_name ? 'last_name-error' : undefined}
        />
        {errors.last_name && (
          <span id="last_name-error" className={styles.fieldError} role="alert">
            {errors.last_name}
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone" className={styles.label}>
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
          disabled={isLoading}
          placeholder="Optional"
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && (
          <span id="phone-error" className={styles.fieldError} role="alert">
            {errors.phone}
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="emergency_contact" className={styles.label}>
          Emergency Contact
        </label>
        <input
          id="emergency_contact"
          name="emergency_contact"
          type="text"
          value={formData.emergency_contact}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.emergency_contact ? styles.inputError : ''}`}
          disabled={isLoading}
          placeholder="Optional"
          aria-describedby={
            errors.emergency_contact ? 'emergency_contact-error' : undefined
          }
        />
        {errors.emergency_contact && (
          <span
            id="emergency_contact-error"
            className={styles.fieldError}
            role="alert"
          >
            {errors.emergency_contact}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Profile...' : 'Create Profile'}
        </button>
      </div>
    </form>
  );
};

export default CreateProfileForm;
