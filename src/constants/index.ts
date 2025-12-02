// Application Routes
export const ROUTES = {
  HOME: '/',
  GUEST: '/guest',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EVENTS: '/dashboard/events',
  EVENT_DETAIL: (id: string) => `/dashboard/events/${id}`,
  EVENT_CREATE: '/dashboard/events/create',
  EVENT_EDIT: (id: string) => `/dashboard/events/${id}/edit`,
  MY_TICKETS: '/dashboard/my-tickets',
  TICKET_DETAIL: (id: string) => `/dashboard/tickets/${id}`,
  CHECK_IN: '/dashboard/check-in',
  SEAT_MANAGEMENT: (eventId: string) => `/dashboard/seats/${eventId}`,
  REPORTS: '/dashboard/reports',
} as const

// Event Types
export const EVENT_TYPES = {
  WORKSHOP: 'Workshop',
  TALKSHOW: 'Talkshow',
  SEMINAR: 'Seminar',
  COMPETITION: 'Competition',
  CONFERENCE: 'Conference',
} as const

export const EVENT_TYPE_OPTIONS = [
  { value: EVENT_TYPES.WORKSHOP, label: 'Workshop' },
  { value: EVENT_TYPES.TALKSHOW, label: 'Talkshow' },
  { value: EVENT_TYPES.SEMINAR, label: 'Seminar' },
  { value: EVENT_TYPES.COMPETITION, label: 'Competition' },
  { value: EVENT_TYPES.CONFERENCE, label: 'Conference' },
]

// Event Status
export const EVENT_STATUS = {
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const

export const EVENT_STATUS_OPTIONS = [
  { value: EVENT_STATUS.UPCOMING, label: 'Sắp diễn ra' },
  { value: EVENT_STATUS.ONGOING, label: 'Đang diễn ra' },
  { value: EVENT_STATUS.COMPLETED, label: 'Đã kết thúc' },
  { value: EVENT_STATUS.CANCELLED, label: 'Đã hủy' },
]

// Organizer Types
export const ORGANIZER_TYPES = {
  DEPARTMENT: 'Department',
  CLUB: 'Club',
} as const

export const ORGANIZER_TYPE_OPTIONS = [
  { value: ORGANIZER_TYPES.DEPARTMENT, label: 'Phòng ban' },
  { value: ORGANIZER_TYPES.CLUB, label: 'CLB' },
]

// Seat Status
export const SEAT_STATUS = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  OCCUPIED: 'Occupied',
  BLOCKED: 'Blocked',
} as const

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
} as const

// Validation Constants
export const VALIDATION = {
  MAX_FILE_SIZE_MB: 5,
  MAX_EVENT_TITLE_LENGTH: 100,
  MAX_EVENT_DESCRIPTION_LENGTH: 500,
  MIN_PASSWORD_LENGTH: 6,
} as const

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_USER: 'fpt_event_user',
  EVENTS: 'fpt_events',
  REGISTRATIONS: 'fpt_event_registrations',
} as const
