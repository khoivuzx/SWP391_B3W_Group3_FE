import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { mockEvents } from '../../data/mockData'
import { EventCard } from '../../components/events'
import { LinkButton } from '../../components/common'

export default function Events() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isOrganizer = user?.role === 'Event Organizer' || user?.role === 'Staff'

  const handleEdit = (id: string) => {
    navigate(`/events/${id}/edit`)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      // TODO: Implement delete functionality with eventService
      console.log('Delete event:', id)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Danh sách sự kiện</h1>
        {isOrganizer && (
          <LinkButton to="/events/create">
            Tạo sự kiện mới
          </LinkButton>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            showActions={isOrganizer}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}


