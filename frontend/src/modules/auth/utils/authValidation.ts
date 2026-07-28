export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

export const authValidation = {
  validateEmail(email: string): string | null {
    if (!email || !email.trim()) {
      return 'Email address is required.';
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    return null;
  },

  validatePassword(password: string): string | null {
    if (!password) {
      return 'Password is required.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return null;
  },

  validateName(name: string): string | null {
    if (!name || !name.trim()) {
      return 'Full name is required.';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters.';
    }
    return null;
  },

  validatePhone(phone: string): string | null {
    if (!phone || !phone.trim()) {
      return 'Phone number is required.';
    }
    if (phone.trim().length < 7 || !PHONE_REGEX.test(phone.trim())) {
      return 'Please enter a valid phone number.';
    }
    return null;
  },

  validateLoginForm(values: { email: string; password?: string }): ValidationResult {
    const errors: Record<string, string> = {};

    const emailErr = this.validateEmail(values.email);
    if (emailErr) errors.email = emailErr;

    const passErr = this.validatePassword(values.password || '');
    if (passErr) errors.password = passErr;

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateRegisterForm(values: {
    name: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    const nameErr = this.validateName(values.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = this.validateEmail(values.email);
    if (emailErr) errors.email = emailErr;

    const passErr = this.validatePassword(values.password || '');
    if (passErr) errors.password = passErr;

    if (values.confirmPassword !== undefined && values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (values.phone) {
      const phoneErr = this.validatePhone(values.phone);
      if (phoneErr) errors.phone = phoneErr;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

export default authValidation;
