/**
 * Application-wide constants strictly matching the backend schema
 */

export const APPLICATION_STATUSES = [
  'Saved',
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
];

export const WORK_MODES = ['Remote', 'Hybrid', 'Onsite'];

export const ALLOWED_SORT_COLUMNS = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'date_applied', label: 'Date Applied' },
  { value: 'application_deadline', label: 'Application Deadline' },
  { value: 'company_name', label: 'Company Name' },
  { value: 'status', label: 'Status' },
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'CAD', symbol: 'CA$' },
  { code: 'SGD', symbol: 'S$' },
];

export const STATUS_DESCRIPTIONS = {
  Saved: 'Draft application saved for later submission',
  Applied: 'Submitted to employer portal or referral',
  Assessment: 'Online assessment, coding challenge, or take-home quiz',
  Interview: 'Behavioral, technical, or executive interview rounds',
  Offer: 'Official offer received! Congratulations!',
  Rejected: 'Application was not selected for this cycle',
  Withdrawn: 'Withdrawn by candidate due to another offer or conflict',
};
