import { Registration, Seat } from '../types/event'
import { mockRegistrations, mockSeats } from '../data/mockData'

/**
 * Ticket Service
 * Handles event registrations and seat assignments
 * This will be replaced with actual API calls when backend is ready
 */

// Get all registrations for a user
export async function getRegistrationsByUser(userId: string): Promise<Registration[]> {
  // TODO: Replace with actual API call
  // return await axios.get(`/api/registrations?userId=${userId}`)
  return Promise.resolve(mockRegistrations.filter(r => r.userId === userId))
}

// Get registration by ID
export async function getRegistrationById(id: string): Promise<Registration | undefined> {
  // TODO: Replace with actual API call
  // return await axios.get(`/api/registrations/${id}`)
  return Promise.resolve(mockRegistrations.find(r => r.id === id))
}

// Create new registration
export async function createRegistration(
  registration: Omit<Registration, 'id' | 'registeredAt'>
): Promise<Registration> {
  // TODO: Replace with actual API call
  // return await axios.post('/api/registrations', registration)
  const newRegistration: Registration = {
    ...registration,
    id: `reg-${Date.now()}`,
    registeredAt: new Date().toISOString(),
  }
  return Promise.resolve(newRegistration)
}

// Cancel registration
export async function cancelRegistration(_id: string): Promise<void> {
  // TODO: Replace with actual API call
  // return await axios.delete(`/api/registrations/${_id}`)
  return Promise.resolve()
}

// Get seats for an event
export async function getSeatsByEvent(eventId: string): Promise<Seat[]> {
  // TODO: Replace with actual API call
  // return await axios.get(`/api/events/${eventId}/seats`)
  return Promise.resolve(mockSeats.filter(s => s.eventId === eventId))
}

// Reserve seat
export async function reserveSeat(
  eventId: string,
  seatNumber: string,
  userId: string
): Promise<Seat> {
  // TODO: Replace with actual API call
  // return await axios.post(`/api/events/${eventId}/seats/${seatNumber}/reserve`, { userId })
  const seat = mockSeats.find(s => s.eventId === eventId && s.seatNumber === seatNumber)
  if (!seat) {
    throw new Error('Seat not found')
  }
  if (seat.status !== 'Reserved') {
    throw new Error('Seat not available')
  }
  const updatedSeat: Seat = {
    ...seat,
    status: 'Occupied',
    registrationId: userId,
  }
  return Promise.resolve(updatedSeat)
}

// Check in with registration
export async function checkInRegistration(registrationId: string): Promise<Registration> {
  // TODO: Replace with actual API call
  // return await axios.post(`/api/registrations/${registrationId}/checkin`)
  const registration = mockRegistrations.find(r => r.id === registrationId)
  if (!registration) {
    throw new Error('Registration not found')
  }
  const updatedRegistration: Registration = {
    ...registration,
    checkedIn: true,
    checkedInAt: new Date().toISOString(),
  }
  return Promise.resolve(updatedRegistration)
}
