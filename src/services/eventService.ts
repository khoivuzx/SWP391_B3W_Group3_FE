import { Event } from '../types/event'
import { mockEvents } from '../data/mockData'

/**
 * Event Service
 * This will be replaced with actual API calls when backend is ready
 */

// Get all events
export async function getAllEvents(): Promise<Event[]> {
  // TODO: Replace with actual API call
  // return await axios.get('/api/events')
  return Promise.resolve(mockEvents)
}

// Get event by ID
export async function getEventById(id: string): Promise<Event | undefined> {
  // TODO: Replace with actual API call
  // return await axios.get(`/api/events/${id}`)
  return Promise.resolve(mockEvents.find(e => e.id === id))
}

// Create new event
export async function createEvent(event: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
  // TODO: Replace with actual API call
  // return await axios.post('/api/events', event)
  const newEvent: Event = {
    ...event,
    id: `event-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  return Promise.resolve(newEvent)
}

// Update event
export async function updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
  // TODO: Replace with actual API call
  // return await axios.put(`/api/events/${id}`, updates)
  const event = mockEvents.find(e => e.id === id)
  if (!event) {
    throw new Error('Event not found')
  }
  const updatedEvent = { ...event, ...updates }
  return Promise.resolve(updatedEvent)
}

// Delete event
export async function deleteEvent(_id: string): Promise<void> {
  // TODO: Replace with actual API call
  // return await axios.delete(`/api/events/${_id}`)
  return Promise.resolve()
}

// Get events by organizer
export async function getEventsByOrganizer(organizerName: string): Promise<Event[]> {
  // TODO: Replace with actual API call
  // return await axios.get(`/api/events?organizer=${organizerName}`)
  return Promise.resolve(mockEvents.filter(e => e.organizer === organizerName))
}

// Search events
export async function searchEvents(query: string): Promise<Event[]> {
  // TODO: Replace with actual API call
  // return await axios.get(`/api/events/search?q=${query}`)
  const lowerQuery = query.toLowerCase()
  return Promise.resolve(
    mockEvents.filter(
      e =>
        e.title.toLowerCase().includes(lowerQuery) ||
        e.description.toLowerCase().includes(lowerQuery) ||
        e.organizer.toLowerCase().includes(lowerQuery)
    )
  )
}
