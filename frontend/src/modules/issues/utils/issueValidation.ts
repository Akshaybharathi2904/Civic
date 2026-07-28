import { CreateIssueDTO, UpdateIssueDTO } from '../types/issue.dto';

export interface IssueValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const issueValidation = {
  validateCreateIssue(dto: CreateIssueDTO): IssueValidationResult {
    const errors: Record<string, string> = {};

    if (!dto.title || !dto.title.trim()) {
      errors.title = 'Issue title is required.';
    } else if (dto.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long.';
    } else if (dto.title.length > 150) {
      errors.title = 'Title cannot exceed 150 characters.';
    }

    if (!dto.description || !dto.description.trim()) {
      errors.description = 'Issue description is required.';
    } else if (dto.description.trim().length < 15) {
      errors.description = 'Description must be at least 15 characters to provide adequate context.';
    }

    if (!dto.category || !dto.category.trim()) {
      errors.category = 'Category selection is required.';
    }

    if (!dto.address || !dto.address.trim()) {
      errors.address = 'Incident location address is required.';
    }

    if (typeof dto.latitude !== 'number' || isNaN(dto.latitude) || dto.latitude < -90 || dto.latitude > 90) {
      errors.latitude = 'Valid latitude coordinate between -90 and 90 is required.';
    }

    if (typeof dto.longitude !== 'number' || isNaN(dto.longitude) || dto.longitude < -180 || dto.longitude > 180) {
      errors.longitude = 'Valid longitude coordinate between -180 and 180 is required.';
    }

    if (dto.anonymous && dto.contactInformation) {
      if (dto.contactInformation.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.contactInformation.email)) {
          errors.contactEmail = 'Please provide a valid contact email address.';
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateUpdateIssue(dto: UpdateIssueDTO): IssueValidationResult {
    const errors: Record<string, string> = {};

    if (dto.title !== undefined) {
      if (!dto.title.trim() || dto.title.trim().length < 5) {
        errors.title = 'Title must be at least 5 characters long.';
      }
    }

    if (dto.description !== undefined) {
      if (!dto.description.trim() || dto.description.trim().length < 15) {
        errors.description = 'Description must be at least 15 characters.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

export default issueValidation;
