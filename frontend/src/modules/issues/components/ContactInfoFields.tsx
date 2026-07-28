import React from 'react';
import { User as UserIcon, Phone, Mail } from 'lucide-react';
import { Input } from '../../../shared/components/ui/Input';
import { IssueContactInfo } from '../../../shared/types/issue.domain';

export interface ContactInfoFieldsProps {
  contactInfo: IssueContactInfo;
  onChange: (info: IssueContactInfo) => void;
  errors?: Record<string, string>;
}

export const ContactInfoFields: React.FC<ContactInfoFieldsProps> = ({
  contactInfo,
  onChange,
  errors = {},
}) => {
  return (
    <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 animate-fadeIn">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <UserIcon className="w-4 h-4 text-cyan-400" />
        <h4 className="text-xs font-mono font-bold text-slate-200 uppercase">
          Reporter Contact Details
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Reporter Name"
          type="text"
          value={contactInfo.name || ''}
          onChange={(e) => onChange({ ...contactInfo, name: e.target.value })}
          placeholder="Arun Kumar"
          leftIcon={<UserIcon size={14} />}
          error={errors.contactName}
        />

        <Input
          label="Phone Number"
          type="text"
          value={contactInfo.phone || ''}
          onChange={(e) => onChange({ ...contactInfo, phone: e.target.value })}
          placeholder="+91-9988771001"
          leftIcon={<Phone size={14} />}
          error={errors.contactPhone}
        />

        <Input
          label="Email Address"
          type="email"
          value={contactInfo.email || ''}
          onChange={(e) => onChange({ ...contactInfo, email: e.target.value })}
          placeholder="citizen@civicswarm.gov.in"
          leftIcon={<Mail size={14} />}
          error={errors.contactEmail}
        />
      </div>
    </div>
  );
};

export default ContactInfoFields;
