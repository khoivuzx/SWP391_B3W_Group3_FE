export interface Event {
  id: string
  title: string
  description: string
  organizer: string
  organizerType: 'Club' | 'Department'
  eventType: 'Workshop' | 'Talkshow' | 'Other'
  startDate: string
  endDate: string
  location: string
  maxParticipants: number
  currentParticipants: number
  hasSeating: boolean
  totalSeats?: number
  availableSeats?: number
  imageUrl?: string
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'
  createdAt: string
}

export interface Registration {
  id: string
  eventId: string
  userId: string
  userName: string
  userEmail: string
  studentId?: string
  seatNumber?: string
  qrCode: string
  registeredAt: string
  checkedIn: boolean
  checkedInAt?: string
}

export interface Seat {
  id: string
  eventId: string
  seatNumber: string
  row: string
  column: number
  status: 'Available' | 'Reserved' | 'Occupied'
  registrationId?: string
}


