// src/pages/Reports.tsx
import { useState, useEffect } from 'react'
import { Calendar, Users, CheckCircle, XCircle, Download, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'

// ==== Kiểu dữ liệu (có thể chỉnh lại cho khớp EventStatsDTO nếu cần) ====
type EventOption = {
  id: number
  title: string
  startTime?: string
  type?: string
}

type Registration = {
  id: number
  userName: string
  studentId?: string | null
  userEmail: string
  seatNumber?: string | null
  registeredAt: string
  checkedIn: boolean
  checkedInAt?: string | null
}

type EventStats = {
  eventId: number
  eventTitle: string
  startTime?: string
  totalTickets: number
  totalCheckedIn: number
  totalRegistrations?: number // nếu DTO không có thì BE có thể set = totalTickets
  eventType?: string
  registrations?: Registration[]
}

export default function Reports() {
  const { user } = useAuth()
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const [events, setEvents] = useState<EventOption[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)

  const [selectedStats, setSelectedStats] = useState<EventStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // ================== 1. Load danh sách event ==================
  useEffect(() => {
    const fetchEvents = async () => {
      if (!token) return
      setEventsLoading(true)
      setEventsError(null)

      try {
        const res = await fetch('/api/events', {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': '1',
          },
          credentials: 'include',
        })

        const data = await res.json()
        console.log('API /events response = ', data)

        if (!res.ok) {
          throw new Error(
            data?.error || data?.message || `HTTP ${res.status}`,
          )
        }

        // ⚠️ BE trả: { openEvents: [...], closedEvents: [...] }
        const rawEvents = [
          ...(data.openEvents ?? []),
          ...(data.closedEvents ?? []),
        ]

        const list: EventOption[] = rawEvents.map((e: any) => ({
          id: e.eventId ?? e.id,
          title: e.title,
          startTime: e.startTime,
          type: e.type || e.category || undefined,
        }))

        setEvents(list)

        // auto chọn event đầu tiên nếu chưa chọn gì
        if (!selectedEventId && list.length > 0) {
          setSelectedEventId(String(list[0].id))
        }
      } catch (err: any) {
        console.error('Fetch events error', err)
        setEventsError(err?.message || 'Không tải được danh sách sự kiện')
      } finally {
        setEventsLoading(false)
      }
    }

    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // ================== 2. Load thống kê 1 event từ /api/events/stats ==================
  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !selectedEventId) {
        setSelectedStats(null)
        return
      }

      setStatsLoading(true)
      setStatsError(null)

      try {
        const url = `/api/events/stats?eventId=${encodeURIComponent(
          selectedEventId,
        )}`

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': '1',
          },
          credentials: 'include',
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(
            data?.error || data?.message || `HTTP ${res.status}`,
          )
        }

        // Map về EventStats (chỉnh field name cho đúng với EventStatsDTO)
        const mapped: EventStats = {
          eventId: data.eventId,
          eventTitle: data.eventTitle || data.title,
          startTime: data.startTime,
          totalTickets: data.totalTickets ?? data.totalRegistrations ?? 0,
          totalCheckedIn: data.totalCheckedIn ?? 0,
          totalRegistrations:
            data.totalRegistrations ?? data.totalTickets ?? 0,
          eventType: data.eventType,
          registrations: data.registrations || [],
        }

        setSelectedStats(mapped)
      } catch (err: any) {
        console.error('Fetch stats error', err)
        setStatsError(err?.message || 'Không tải được thống kê sự kiện')
        setSelectedStats(null)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [token, selectedEventId])

  const selectedEvent = events.find(
    (e) => String(e.id) === String(selectedEventId),
  )

  // ============ Data đã map cho UI ============

  const registrations: Registration[] = selectedStats?.registrations || []
  const checkedInCount = selectedStats?.totalCheckedIn ?? 0
  const totalRegistrations =
    selectedStats?.totalRegistrations ?? selectedStats?.totalTickets ?? 0
  const notCheckedInCount =
    totalRegistrations > checkedInCount
      ? totalRegistrations - checkedInCount
      : 0

  const totalEvents = events.length
  const totalCheckedIn = checkedInCount

  // Chart data: 1 event đang chọn
  const eventAttendanceData =
    selectedStats && selectedEvent
      ? [
          {
            name: selectedStats.eventTitle || selectedEvent.title,
            'Đã đăng ký': totalRegistrations,
            'Đã check-in': checkedInCount,
          },
        ]
      : []

  const checkInPieData = [
    { name: 'Đã check-in', value: checkedInCount, color: '#10b981' },
    { name: 'Chưa check-in', value: notCheckedInCount, color: '#f59e0b' },
  ]

  const eventTypeData: Record<string, number> = {}
  if (selectedStats?.eventType) {
    eventTypeData[selectedStats.eventType] = totalRegistrations
  }
  const eventTypeChartData = Object.entries(eventTypeData).map(
    ([name, value]) => ({
      name,
      value,
    }),
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Báo cáo tham dự</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-5 h-5 mr-2" />
          Xuất báo cáo
        </button>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng sự kiện</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalEvents}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đăng ký (sự kiện chọn)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalRegistrations}
              </p>
            </div>
            <Users className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng check-in</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalCheckedIn}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tỷ lệ check-in</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalRegistrations > 0
                  ? Math.round((totalCheckedIn / totalRegistrations) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full">
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Lọc báo cáo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn sự kiện
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {eventsLoading && <option>Đang tải...</option>}
              {!eventsLoading && <option value="">-- Chọn sự kiện --</option>}
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            {eventsError && (
              <p className="mt-1 text-xs text-red-500">{eventsError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Event Attendance Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Thống kê tham dự theo sự kiện (đang chọn)
          </h2>
          {statsLoading ? (
            <p className="text-gray-500 text-sm">Đang tải thống kê...</p>
          ) : statsError ? (
            <p className="text-red-500 text-sm">{statsError}</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Đã đăng ký" fill="#3b82f6" />
                <Bar dataKey="Đã check-in" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Check-in Status Pie Chart */}
        {selectedEvent && selectedStats && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Trạng thái check-in: {selectedStats.eventTitle || selectedEvent.title}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={checkInPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {checkInPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Event Type Distribution (demo: chỉ cho event đang chọn) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Phân bố loại sự kiện</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventTypeChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {eventTypeChartData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Registration List */}
      {selectedEvent && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Danh sách đăng ký: {selectedStats?.eventTitle || selectedEvent.title}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã SV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghế ngồi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian đăng ký
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian check-in
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Chưa có đăng ký nào
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reg.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.studentId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.seatNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(
                          new Date(reg.registeredAt),
                          'dd/MM/yyyy HH:mm',
                          { locale: vi },
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reg.checkedIn ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Đã check-in
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <XCircle className="w-4 h-4 mr-1" />
                            Chưa check-in
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.checkedInAt
                          ? format(
                              new Date(reg.checkedInAt),
                              'dd/MM/yyyy HH:mm',
                              { locale: vi },
                            )
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Table  – có thể sau này fetch stats cho tất cả event để fill thêm */}
      {!selectedEvent && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Tóm tắt theo sự kiện</h2>
          <p className="text-sm text-gray-500">
            Chọn 1 sự kiện ở trên để xem chi tiết thống kê.
          </p>
        </div>
      )}
    </div>
  )
}
