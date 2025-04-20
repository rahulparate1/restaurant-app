export interface LeaveData {
  types: {
    leaveBalance?: any;
    id: number;
    value: string;
    label: string;
  }[];
}

export const leaveData: LeaveData = {
  types: [
    {
      id: 1,
      value: 'privilegeLeave',
      label: 'Privilege Leave',
    },
    {
      id: 2,
      value: 'casualLeave',
      label: 'Casual Leave',
    },
    {
      id: 3,
      value: 'sickLeave',
      label: 'Sick Leave',
    },
    {
      id: 4,
      value: 'maternityLeave',
      label: 'Maternity Leave',
    },
    {
      id: 5,
      value: 'compensatoryOff',
      label: 'Compensatory Off',
    },
    {
      id: 6,
      value: 'marriageLeave',
      label: 'Marriage Leave',
    },
    {
      id: 7,
      value: 'paternityLeave',
      label: 'Paternity Leave',
    },
    {
      id: 8,
      value: 'bereavementLeave',
      label: 'Bereavement Leave',
    },
    {
      id: 9,
      value: 'loss of pay',
      label: 'loss of pay',
    },
  ],
};


// constants.ts
export const DEPARTMENTS = [
  { value: '', label: 'Select departments' },
  { value: 'HR', label: 'HR' },
  { value: 'Developer', label: 'Developer' },
];
// Leave Data
export const LeaveStatus = [
  {
    id: 1,
    label: 'Approved',
    className: 'bg-light-accent text-accent rounded p-6 p-y-4 f-s-12 center',
  },
  {
    id: 2,
    label: 'Rejected',
    className: 'bg-light-error text-error rounded p-6 p-y-4 f-s-12 center',
  },
  {
    id: 3,
    label: 'Pending',
    className: 'bg-light-warning text-warning rounded p-6 p-y-4 f-s-12 center',
  },
];

export const reimbursementStatusList = [
  {
    id: 1,
    label: 'Approved',
    className: 'text-success rounded p-6 p-y-4 f-s-12 center', // Bootstrap class for green text (Approved)
  },
  {
    id: 2,
    label: 'Rejected',
    className: 'text-danger rounded p-6 p-y-4 f-s-12 center', // Bootstrap class for red text (Rejected)
  },
  {
    id: 3,
    label: 'Pending',
    className: 'text-warning rounded p-6 p-y-4 f-s-12 center', // Bootstrap class for yellow text (Pending)
  },
];

export const monthStr = [
  {},
  { value: 'Jan' },
  { value: 'Feb' },
  { value: 'Mar' },
  { value: 'Apr' },
  { value: 'May' },
  { value: 'Jun' },
  { value: 'Jul' },
  { value: 'Aug' },
  { value: 'Sep' },
  { value: 'Oct' },
  { value: 'Nov' },
  { value: 'Dec' },
];

export const designationType = [
  'Associate Software Engineer',
  'Software Engineer',
  'Systems analyst',
  'Network engineer',
  'Network administrator',
  'System administrator',
];

export const rolesType = [
  {
    key: '0',
    value: 'super-admin',
  },
  {
    key: '1',
    value: 'admin',
  },
  {
    key: '2',
    value: 'HR',
  },
  {
    key: '3',
    value: 'employee',
  },
  {
    key: '4',
    value: 'accountant',
  },
];

export const CountryName = [
 "India"
];

const eventCalendarTypes = ['holiday', 'birthday', 'leaves', 'other'];
export { eventCalendarTypes };
export const documentType = [
  {
    key: '1',
    docType: 'KYC Document',
  },
  {
    key: '2',
    docType: 'Bank Details Document',
  },
  {
    key: '3',
    docType: 'Education Document',
  },
  {
    key: '4',
    docType: 'Exit Document',
  },
];

const reimbursementType = [
  'Project Expense',
  'Trip Expense',
  'Medical Expense',
  'Other',
];
export { reimbursementType };

const ImageExtensions = ['pdf', 'jpg', 'png', 'svg', 'jpeg', 'wabp'];
export { ImageExtensions };

const ImageExtensionsLeaves = ['jpg', 'png', 'svg', 'jpeg', 'wabp'];
export { ImageExtensionsLeaves };

const DocumentExtensions = ['jpg', 'png', 'svg', 'jpeg', 'webp', 'pdf', 'txt'];
export { DocumentExtensions };

const supportType = [
  'Employee Ralation Support',
  'Misconduct',
  'Employee Engagement Support',
  'Legal Compliance Support',
  'Compensation and Benefits Support',
  'Training and Development Support',
  'other',
];
export { supportType };

export const SupportStatusList = [
  {
    id: '1',
    label: 'Requested',
    className: 'bg-light-primary text-primary  rounded p-6 p-y-4 f-s-12 center',
  },
  {
    id: '2',
    label: 'InProcess',
    className: 'bg-light-warning text-warning rounded p-6 p-y-4 f-s-12 center',
  },
  {
    id: '3',
    label: 'Resolved',
    className: 'bg-light-success text-success rounded p-6 p-y-4 f-s-12 center',
  },
  {
    id: '4',
    label: 'Closed',
    className: 'bg-light-gray text-gray rounded p-6 p-y-4 f-s-12 center',
  },
  {
    id: '5',
    label: 'Rejected',
    className: 'bg-light-danger text-danger rounded p-6 p-y-4 f-s-12 center',
  }
];

const supportDesignationList = ['Admin', 'Employee', 'HR'];
export { supportDesignationList };

export const bankNameList = [
  'Allahabad Bank',
  'Andhra Bank',
  'Axis Bank',
  'Bank of Bahrain and Kuwait',
  'Bank of Baroda - Corporate Banking',
  'Bank of Baroda - Retail Banking',
  'Bank of India',
  'Bank of Maharashtra',
  'Bandhan Bank',
  'Canara Bank',
  'Central Bank of India',
  'City Union Bank',
  'Corporation Bank',
  'Deutsche Bank',
  'Development Credit Bank',
  'Dhanlaxmi Bank',
  'Federal Bank',
  'HDFC Bank',
  'ICICI Bank',
  'IDBI Bank',
  'IDFC FIRST Bank',
  'Indian Bank',
  'Indian Overseas Bank',
  'IndusInd Bank',
  'ING Vysya Bank',
  'Jammu and Kashmir Bank',
  'Karnataka Bank Ltd',
  'Karur Vysya Bank',
  'Kotak Bank',
  'Laxmi Vilas Bank',
  'Oriental Bank of Commerce',
  'Punjab National Bank - Corporate Banking',
  'Punjab National Bank - Retail Banking',
  'Punjab & Sind Bank',
  'Shamrao Vitthal Co-operative Bank',
  'South Indian Bank',
  'State Bank of Bikaner & Jaipur',
  'State Bank of Hyderabad',
  'State Bank of India',
  'State Bank of Mysore',
  'State Bank of Patiala',
  'State Bank of Travancore',
  'Syndicate Bank',
  'Tamilnad Mercantile Bank Ltd.',
  'UCO Bank',
  'Union Bank of India',
  'United Bank of India',
  'Vijaya Bank',
  'Yes Bank Ltd',
];
