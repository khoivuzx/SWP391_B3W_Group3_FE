import { Link } from 'react-router-dom'
import { Ticket, Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { Registration } from '../../types/event'
import { Event } from '../../types/event'
import { formatDate } from '../../utils'

interface TicketCardProps {
  registration: Registration
  event: Event
}

export default function TicketCard({ registration, event }: TicketCardProps) {
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
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {event.title}
            </h3>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(event.startDate, 'dd/MM/yyyy HH:mm')}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {event.location}
              </div>
              {registration.seatNumber && (
                <div className="flex items-center">
                  <span className="font-medium">Ghế: {registration.seatNumber}</span>
                </div>
              )}
            </div>
          </div>
          
          {registration.checkedIn ? (
            <CheckCircle className="w-6 h-6 text-green-500" aria-label="Đã check-in" />
          ) : (
            <XCircle className="w-6 h-6 text-gray-400" aria-label="Chưa check-in" />
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Trạng thái:</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              registration.checkedIn
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {registration.checkedIn ? 'Đã check-in' : 'Chưa check-in'}
          </span>
        </div>

        <Link
          to={`/tickets/${registration.id}`}
          className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Xem vé QR
        </Link>
      </div>
    </div>
  )
}

interface EmptyTicketStateProps {
  message?: string
  linkText?: string
  linkTo?: string
}

export function EmptyTicketState({
  message = 'Bạn chưa có vé nào',
  linkText = 'Xem các sự kiện sắp tới',
  linkTo = '/events',
}: EmptyTicketStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">{message}</p>
      <Link
        to={linkTo}
        className="mt-4 inline-block text-blue-600 hover:text-blue-700"
      >
        {linkText} →
      </Link>
    </div>
  )
}
