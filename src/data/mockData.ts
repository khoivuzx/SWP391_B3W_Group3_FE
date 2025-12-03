import { Event, Registration, Seat } from '../types/event'
import { User, UserRole } from '../contexts/AuthContext'

// Mock users for authentication
export const mockUsers: User[] = [
  // Admin user
  {
    id: 1,
    fullName: 'Nguyễn Văn Admin',
    email: 'admin@fpt.edu.vn',
    phone: '0901234567',
    role: 'ADMIN' as UserRole,
    status: 'ACTIVE',
    password: 'admin123',
    createdAt: new Date().toISOString()
  },
  // Staff user
  {
    id: 2,
    fullName: 'Trần Thị Staff',
    email: 'staff@fpt.edu.vn',
    phone: '0902345678',
    role: 'STAFF' as UserRole,
    status: 'ACTIVE',
    password: 'staff123',
    createdAt: new Date().toISOString()
  },
  // Organizer users
  {
    id: 3,
    fullName: 'Lê Văn Organizer',
    email: 'organizer@fpt.edu.vn',
    phone: '0903456789',
    role: 'ORGANIZER' as UserRole,
    status: 'ACTIVE',
    password: 'organizer123',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    fullName: 'Phạm Thị Tổ Chức',
    email: 'organizer2@fpt.edu.vn',
    phone: '0904567890',
    role: 'ORGANIZER' as UserRole,
    status: 'ACTIVE',
    password: 'organizer123',
    createdAt: new Date().toISOString()
  },
  // Student users
  {
    id: 5,
    fullName: 'Hoàng Văn Student',
    email: 'student@fpt.edu.vn',
    phone: '0905678901',
    role: 'STUDENT' as UserRole,
    status: 'ACTIVE',
    password: 'student123',
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    fullName: 'Vũ Thị Sinh Viên',
    email: 'student2@fpt.edu.vn',
    phone: '0906789012',
    role: 'STUDENT' as UserRole,
    status: 'ACTIVE',
    password: 'student123',
    createdAt: new Date().toISOString()
  }
]

// Helper functions for authentication
export const findUserByCredentials = (email: string, password: string): User | undefined => {
  return mockUsers.find(user => user.email === email && user.password === password)
}

export const findUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email === email)
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Workshop: React Advanced Patterns',
    description: 'Học các pattern nâng cao trong React và best practices',
    organizer: 'IT Club',
    organizerType: 'Club',
    eventType: 'Workshop',
    startDate: '2024-02-15T09:00:00',
    endDate: '2024-02-15T12:00:00',
    location: 'Phòng A101, Tòa Alpha',
    maxParticipants: 50,
    currentParticipants: 35,
    hasSeating: true,
    totalSeats: 50,
    availableSeats: 15,
    imageUrl: 'https://via.placeholder.com/400x200?text=React+Workshop',
    status: 'Upcoming',
    createdAt: '2024-01-10T10:00:00'
  },
  {
    id: '2',
    title: 'Talkshow: Career in Tech Industry',
    description: 'Chia sẻ kinh nghiệm từ các chuyên gia trong ngành công nghệ',
    organizer: 'Phòng Đào tạo',
    organizerType: 'Department',
    eventType: 'Talkshow',
    startDate: '2024-02-20T14:00:00',
    endDate: '2024-02-20T16:00:00',
    location: 'Hội trường lớn, Tòa Beta',
    maxParticipants: 200,
    currentParticipants: 180,
    hasSeating: true,
    totalSeats: 200,
    availableSeats: 20,
    imageUrl: 'https://via.placeholder.com/400x200?text=Tech+Talkshow',
    status: 'Upcoming',
    createdAt: '2024-01-15T10:00:00'
  },
  {
    id: '3',
    title: 'Workshop: UI/UX Design Fundamentals',
    description: 'Khóa học cơ bản về thiết kế giao diện người dùng',
    organizer: 'Design Club',
    organizerType: 'Club',
    eventType: 'Workshop',
    startDate: '2024-02-18T09:00:00',
    endDate: '2024-02-18T17:00:00',
    location: 'Phòng Lab B205',
    maxParticipants: 30,
    currentParticipants: 30,
    hasSeating: false,
    status: 'Upcoming',
    createdAt: '2024-01-20T10:00:00'
  }
]

export const mockRegistrations: Registration[] = [
  {
    id: 'reg1',
    eventId: '1',
    userId: '1',
    userName: 'Nguyễn Văn A',
    userEmail: 'student@fpt.edu.vn',
    studentId: 'SE123456',
    seatNumber: 'A5',
    qrCode: 'REG-1-SE123456-20240215',
    registeredAt: '2024-01-12T10:00:00',
    checkedIn: false
  },
  {
    id: 'reg2',
    eventId: '2',
    userId: '1',
    userName: 'Nguyễn Văn A',
    userEmail: 'student@fpt.edu.vn',
    studentId: 'SE123456',
    seatNumber: 'B12',
    qrCode: 'REG-2-SE123456-20240220',
    registeredAt: '2024-01-16T10:00:00',
    checkedIn: true,
    checkedInAt: '2024-02-20T13:45:00'
  }
]

export const mockSeats: Seat[] = [
  { id: 's1', eventId: '1', seatNumber: 'A1', row: 'A', column: 1, status: 'Occupied' },
  { id: 's2', eventId: '1', seatNumber: 'A2', row: 'A', column: 2, status: 'Occupied' },
  { id: 's3', eventId: '1', seatNumber: 'A3', row: 'A', column: 3, status: 'Reserved' },
  { id: 's4', eventId: '1', seatNumber: 'A4', row: 'A', column: 4, status: 'Available' },
  { id: 's5', eventId: '1', seatNumber: 'A5', row: 'A', column: 5, status: 'Reserved', registrationId: 'reg1' },
]

// Helper functions to get data
export const getEventById = (id: string): Event | undefined => {
  return mockEvents.find(e => e.id === id)
}

export const getRegistrationsByEvent = (eventId: string): Registration[] => {
  return mockRegistrations.filter(r => r.eventId === eventId)
}

export const getSeatsByEvent = (eventId: string): Seat[] => {
  return mockSeats.filter(s => s.eventId === eventId)
}

export const getRegistrationsByUser = (userId: string): Registration[] => {
  return mockRegistrations.filter(r => r.userId === userId)
}


