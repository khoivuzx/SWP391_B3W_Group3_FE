import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { mockEvents } from '../data/mockData'
import { Calendar, Users, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function Dashboard() {
  const { user } = useAuth()
  const upcomingEvents = mockEvents.filter(e => e.status === 'Upcoming').slice(0, 3)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Chào mừng, {user?.fullName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Vai trò: <span className="font-medium">{user?.role}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng sự kiện</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{mockEvents.length}</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sự kiện sắp tới</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {upcomingEvents.length}
              </p>
            </div>
            <Clock className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng người tham gia</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {mockEvents.reduce((sum, e) => sum + e.currentParticipants, 0)}
              </p>
            </div>
            <Users className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Sự kiện sắp tới</h2>
        </div>
        <div className="p-6">
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Không có sự kiện sắp tới</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(event.startDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {event.currentParticipants}/{event.maxParticipants} người
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {event.eventType}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-6">
            <Link
              to="/events"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem tất cả sự kiện →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


