export const API_BASE_URL = 'https://somacontrols.com/api';
export const API_TIMEOUT = 15000;

export const COLORS = {
  primary:     '#0F62FE',
  success:     '#198038',
  danger:      '#DA1E28',
  warning:     '#FF832B',
  purple:      '#6929C4',
  bg:          '#F4F4F4',
  surface:     '#FFFFFF',
  dark:        '#161616',
  dark2:       '#262626',
  gray:        '#6F6F6F',
  border:      '#E0E0E0',
  textPrimary: '#161616',
};

export const PRIORITY_COLORS: Record<string,string> = {
  low: '#6F6F6F', medium: '#F1C21B', high: '#FF832B', urgent: '#DA1E28',
};

export const STATUS_COLORS: Record<string,string> = {
  open: '#0F62FE', in_progress: '#FF832B', completed: '#198038', cancelled: '#6F6F6F',
};

export const ROLE_LABELS: Record<string,string> = {
  technician: 'Teknisi MEP', housekeeping: 'Housekeeping',
  spv: 'Supervisor', building_admin: 'Admin Gedung', security: 'Security',
};
