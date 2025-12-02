import { useAuth } from '../../contexts/AuthContext'
import { getRegistrationsByUser, getEventById } from '../../data/mockData'
import { TicketCard, EmptyTicketState } from '../../components/tickets'

export default function MyTickets() {
  const { user } = useAuth()
  const registrations = user ? getRegistrationsByUser(user.id) : []

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Vé của tôi</h1>

      {registrations.length === 0 ? (
        <EmptyTicketState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((registration) => {
            const event = getEventById(registration.eventId)
            if (!event) return null

            return (
              <TicketCard
                key={registration.id}
                registration={registration}
                event={event}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}


