import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react'
import { Event } from '../../types/event'
import { formatDate } from '../../utils'

interface EventCardProps {
  event: Event
  showActions?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const statusColors = {
  Upcoming: 'bg-green-100 text-green-800',
  Ongoing: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-gray-100 text-gray-800',
  Cancelled: 'bg-red-100 text-red-800',
} as const

const statusLabels = {
  Upcoming: 'Sắp diễn ra',
  Ongoing: 'Đang diễn ra',
  Completed: 'Đã kết thúc',
  Cancelled: 'Đã hủy',
} as const

export default function EventCard({ event, showActions, onEdit, onDelete }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900 flex-1">
            {event.title}
          </h3>
          
          {showActions && (
            <div className="flex space-x-2 ml-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(event.id)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Chỉnh sửa"
                  aria-label="Chỉnh sửa sự kiện"
                >
                  <Edit size={18} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(event.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Xóa"
                  aria-label="Xóa sự kiện"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(event.startDate, 'dd/MM/yyyy HH:mm')}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            {event.currentParticipants}/{event.maxParticipants} người đã đăng ký
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {event.eventType}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
            {statusLabels[event.status]}
          </span>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  )
}
