/**
 * EventDetail - Full page for event details with seat selection
 * 
 * Seat selection flow:
 * 1. Pick ticket type (VIP/STANDARD)
 * 2. Choose mode: fast-pick (auto) or manual
 * 3. Enter quantity (1-10 seats)
 * 4. Select seats or let system pick best block
 * 5. Checkout with backend validation
 * 
 * Fast-pick tries to find continuous block in same row, 
 * falls back to best available seats if no block found.
 * Manual mode shows suggestions but lets user click freely.
 * 
 * Backend re-checks seat availability before payment to prevent
 * race conditions (two users booking same seats).
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, Users, Clock, MapPin, ArrowLeft, Edit, ShoppingCart, CheckCircle, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { EventDetail } from '../types/event'
import { SeatGrid, type Seat } from '../components/common/SeatGrid'
import { useAuth } from '../contexts/AuthContext'
import { useSeatSelection } from '../hooks/useSeatSelection'
import { calculateSuggestedSeats, checkSeatsAdjacency, findBestSeatBlock, verifySeatAvailability, temporarilyReserveSeats } from '../utils/seatUtils'
import { VIPTicketCard, StandardTicketCard } from '../components/tickets/TicketCards'
import { ModeSelectionModal, QuantityModal, ReservationTimer, ScatteredWarning, SelectedSeatsList } from '../components/events/SeatSelectionModals'

// Ticket type definition (VIP or STANDARD)
type Ticket = {
  categoryTicketId: number  // Database ID for this ticket category
  name: string              // "VIP" or "STANDARD"
  price: number             // Price per ticket
  maxQuantity: number       // Maximum tickets available
  status: string            // Ticket availability status
  description?: string      // Optional ticket description
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const token = localStorage.getItem('token')
  
  // Event data state
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Seat data from API (must be declared before seatSelection hook)
  // Hook needs allSeats for adjacency checking and suggestions
  const [allSeats, setAllSeats] = useState<Seat[]>([])
  const [vipTotal, setVipTotal] = useState<number>(0) // Booked VIP count
  const [standardTotal, setStandardTotal] = useState<number>(0) // Booked standard count
  const [loadingSeats, setLoadingSeats] = useState(false)
  
  // Stats for this specific event
  const [eventStats, setEventStats] = useState({
    totalRegistered: 0,
    totalCheckedIn: 0,
    checkInRate: '0.00%'
  })
  
  // Currently selected ticket type (VIP or STANDARD)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  
  // Custom hook manages: selectedSeats, numberOfSeats, selectionMode, 
  // reservationExpiry, remainingTime, showScatteredWarning, etc.
  const seatSelection = useSeatSelection({
    allSeats,
    selectedTicketName: selectedTicket?.name
  })

  const isOrganizer = user?.role === 'ORGANIZER'
  const isStaff = user?.role === 'STAFF'

  // Load event data
  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!token || !id) return

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/events/detail?id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error('Không thể tải chi tiết sự kiện')
        }

        const data = await res.json()
        setEvent(data)
      } catch (err: any) {
        console.error('Error loading event detail:', err)
        setError(err.message ?? 'Không thể tải chi tiết sự kiện')
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetail()
  }, [id, token])
  
  // Fetch stats for this event
  useEffect(() => {
    const fetchEventStats = async () => {
      if (!token || !id) return

      try {
        const res = await fetch(`/api/events/stats?eventId=${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          setEventStats({
            totalRegistered: data.totalRegistered || 0,
            totalCheckedIn: data.totalCheckedIn || 0,
            checkInRate: data.checkInRate || '0.00%'
          })
        }
      } catch (err) {
        console.error('Error loading event stats:', err)
      }
    }

    fetchEventStats()
  }, [id, token])
  
  // Fetch seats when event detail loads
  useEffect(() => {
    const fetchSeats = async () => {
      if (!event || !event.areaId || !token) return

      setLoadingSeats(true)

      try {
        // Fetch all seats for display
        const seatsRes = await fetch(`/api/seats?areaId=${event.areaId}&eventId=${event.eventId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (seatsRes.ok) {
          const seatsData = await seatsRes.json()
          setAllSeats(seatsData.seats || [])
        }

        // Fetch VIP and STANDARD totals
        const [vipRes, standardRes] = await Promise.all([
          fetch(`/api/seats?areaId=${event.areaId}&eventId=${event.eventId}&seatType=VIP`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`/api/seats?areaId=${event.areaId}&eventId=${event.eventId}&seatType=STANDARD`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        if (vipRes.ok) {
          const vipData = await vipRes.json()
          setVipTotal(vipData.total || 0)
        }

        if (standardRes.ok) {
          const standardData = await standardRes.json()
          setStandardTotal(standardData.total || 0)
        }
      } catch (err: any) {
        console.error('Error loading seats:', err)
      } finally {
        setLoadingSeats(false)
      }
    }

    fetchSeats()
  }, [event, token])

  // Ticket selection opens mode picker (fast/manual)

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    seatSelection.resetSelection()
    seatSelection.setShowSeatOptions(true)
  }


  
  /**
   * Handles individual seat selection/deselection from seat map
   * IMPROVED: Validates ticket type, checks adjacency in real-time, enforces quantity limits
   * 
   * Behavior:
   * - Click unselected seat → Add to selection (up to N seats, same ticket type)
   * - Click selected seat → Remove from selection (toggle off)
   * - Real-time adjacency checking with immediate warning
   * - Disables other seats when limit reached
   * - In manual mode: Can select up to N seats, not forced to select exactly N
   * - In fast mode: Can add/remove seats but maintain block continuity
   * 
   * Validation:
   * - Must be same ticket type as selected ticket
   * - Cannot exceed numberOfSeats quantity
   * - Real-time scattered seat warning
   */
  const handleSeatSelect = (seat: Seat | null) => {
    // Only allow selection of available seats
    if (!seat || seat.status !== 'AVAILABLE') return
    
    // Validate: Must match selected ticket type
    if (selectedTicket && seat.seatType !== selectedTicket.name) {
      alert(`Vui lòng chọn ghế loại ${selectedTicket.name}. Ghế này là ${seat.seatType}.`)
      return
    }
    
    seatSelection.setSelectedSeats(prev => {
      // Check if this seat is already in the selection array
      const isAlreadySelected = prev.some(s => s.seatId === seat.seatId)
      
      if (isAlreadySelected) {
        // Deselect: Remove from array (toggle off)
        const newSelection = prev.filter(s => s.seatId !== seat.seatId)
        
        // Recalculate suggested seats after removal
        const suggested = calculateSuggestedSeats(allSeats, selectedTicket?.name || '', newSelection)
        seatSelection.setSuggestedSeats(suggested)
        
        return newSelection
      } else {
        // Check if user is at seat limit
        if (prev.length >= seatSelection.numberOfSeats) {
          alert(`Bạn đã chọn đủ ${seatSelection.numberOfSeats} ghế. Hãy bỏ chọn ghế khác trước khi thêm ghế mới.`)
          return prev
        }
        
        // Add seat to selection
        const newSelection = [...prev, seat]
        
        // Recalculate suggested seats
        const suggested = calculateSuggestedSeats(allSeats, selectedTicket?.name || '', newSelection)
        seatSelection.setSuggestedSeats(suggested)
        
        return newSelection
      }
    })
  }

  const handleFastChoose = () => {
    seatSelection.setSelectionMode('fast')
    seatSelection.setShowQuantityModal(true)
    seatSelection.setShowSeatOptions(false)
  }
  
  // Auto-pick best seat block after user enters quantity
  const executeFastPick = () => {
    if (!selectedTicket) return
    
    // Use utility function to find best seat block
    const bestBlock = findBestSeatBlock(allSeats, selectedTicket.name, seatSelection.numberOfSeats)
    
    // Set selected seats
    seatSelection.setSelectedSeats(bestBlock)
    
    // Set 5-minute reservation timer
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000)
    seatSelection.setReservationExpiry(expiryTime)
    
    // Calculate suggested seats for adding more
    const suggested = calculateSuggestedSeats(allSeats, selectedTicket.name, bestBlock)
    seatSelection.setSuggestedSeats(suggested)
    
    seatSelection.setShowQuantityModal(false)
    
    // Scroll to seat map
    setTimeout(() => {
      document.getElementById('seat-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const handleManualChoose = () => {
    seatSelection.setSelectionMode('manual')
    seatSelection.setShowQuantityModal(true)
    seatSelection.setShowSeatOptions(false)
  }
  
  // Show suggestions, let user click seats manually
  const executeManualPick = () => {
    seatSelection.setShowQuantityModal(false)
    
    // Calculate suggested seats to guide user
    const suggested = calculateSuggestedSeats(allSeats, selectedTicket?.name || '', [])
    seatSelection.setSuggestedSeats(suggested)
    
    // Scroll to seat map
    setTimeout(() => {
      document.getElementById('seat-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  // Checkout: validate selections then go to payment
  const handleRegister = async () => {
    if (!selectedTicket) {
      alert('Vui lòng chọn loại vé')
      return
    }

    if (seatSelection.selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ghế để tiếp tục')
      return
    }
    
    if (seatSelection.reservationExpiry && new Date() > seatSelection.reservationExpiry) {
      alert('Thời gian giữ ghế đã hết. Vui lòng chọn lại.')
      seatSelection.resetSelection()
      return
    }
    
    // Warn about scattered seats
    if (seatSelection.selectedSeats.length > 1 && !checkSeatsAdjacency(seatSelection.selectedSeats)) {
      const confirmed = window.confirm(
        'Ghế bạn chọn không kề nhau. Bạn có muốn tiếp tục?\n\n' +
        'Gợi ý: Chọn lại để có ghế ngồi cạnh nhau.'
      )
      if (!confirmed) return
    }

    if (event?.status !== 'OPEN') {
      alert('Sự kiện không mở đăng ký. Vui lòng thử lại sau.')
      return
    }

    try {
      console.log('Đang kiểm tra tình trạng ghế...')

      // Re-check with backend in case someone else just booked these seats
      const verification = await verifySeatAvailability(
        seatSelection.selectedSeats,
        event.eventId,
        event.areaId || 0,
        selectedTicket.name,
        token || ''
      )

      if (!verification.available) {
        const conflictList = verification.conflicts.map(s => s.seatCode).join(', ')
        alert(
          `Rất tiếc, một số ghế bạn chọn đã được đặt bởi người khác:\n${conflictList}\n\n` +
          'Vui lòng chọn ghế khác và thử lại.'
        )
        
        // Auto-remove conflicting seats from selection
        seatSelection.setSelectedSeats(prev => 
          prev.filter(s => !verification.conflicts.some(cs => cs.seatId === s.seatId))
        )
        
        // Refresh seat data
        setAllSeats(verification.latestSeats)
        return
      }

      // Try to lock seats for 5 min (optional endpoint)
      await temporarilyReserveSeats(
        event.eventId,
        seatSelection.selectedSeats.map(s => s.seatId),
        token || ''
      )

      navigate('/dashboard/payment', {
        state: {
          eventId: event.eventId,
          categoryTicketId: selectedTicket.categoryTicketId,
          seatIds: seatSelection.selectedSeats.map(s => s.seatId),
          quantity: seatSelection.selectedSeats.length,
          totalPrice: selectedTicket.price * seatSelection.selectedSeats.length,
          reservationExpiry: seatSelection.reservationExpiry?.getTime(),
        },
      })

    } catch (error: any) {
      console.error('Checkout validation error:', error)
      alert(error.message || 'Có lỗi xảy ra khi xác thực ghế. Vui lòng thử lại.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải chi tiết sự kiện...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error || 'Không tìm thấy sự kiện'}</p>
        </div>
      </div>
    )
  }

  const tickets = (event.tickets || []) as Ticket[]
  const vipTicket = tickets.find((t) => t.name === 'VIP')
  const standardTicket = tickets.find((t) => t.name === 'STANDARD')
  return (
    <div className="max-w-7xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Header: Back button + Edit button (organizer only)              */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Link>

        {isOrganizer && (
          <Link
            to={`/dashboard/events/${event.eventId}/edit`}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Link>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* Layout: Left (event info + seats) | Right (ticket selection)    */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Event details and seat map (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner */}
          {event.bannerUrl && (
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Event Stats - Only for Organizers */}
          {isOrganizer && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Tổng đăng ký</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">
                      {eventStats.totalRegistered}
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Đã check-in</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      {eventStats.totalCheckedIn}
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Tỷ lệ check-in</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">
                      {eventStats.checkInRate}
                    </p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-orange-500 opacity-20" />
                </div>
              </div>
            </div>
          )}

          {/* Title and Status */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-900">{event.title}</h1>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  event.status === 'OPEN'
                    ? 'bg-green-100 text-green-700'
                    : event.status === 'CLOSED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {event.status === 'OPEN'
                  ? 'Đang mở'
                  : event.status === 'CLOSED'
                  ? 'Đã đóng'
                  : event.status}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">Mô tả</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Time */}
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Thời gian</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(event.startTime), 'dd/MM/yyyy • HH:mm', { locale: vi })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">đến</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(event.endTime), 'dd/MM/yyyy • HH:mm', { locale: vi })}
                  </p>
                </div>
              </div>

              {/* Location */}
              {event.venueName && (
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl">
                  <MapPin className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-600 font-medium mb-1">Địa điểm</p>
                    <p className="font-semibold text-gray-900">{event.venueName}</p>
                    {event.areaName && (
                      <p className="text-sm text-gray-700 mt-2">
                        Khu vực: <span className="font-medium">{event.areaName}</span>
                        {event.floor && <span className="text-gray-600"> (Tầng {event.floor})</span>}
                      </p>
                    )}
                    {event.areaCapacity != null && (
                      <p className="text-xs text-gray-500 mt-1">
                        Sức chứa: {event.areaCapacity} chỗ
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Speaker Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Thông tin diễn giả</h2>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Speaker Image */}
              <div className="flex-shrink-0">
                <img 
                  src="https://via.placeholder.com/200x200?text=Speaker" 
                  alt="Speaker" 
                  className="w-48 h-48 rounded-xl object-cover border-4 border-orange-100"
                />
              </div>
              
              {/* Speaker Details */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tên diễn giả</h3>
                <p className="text-sm text-orange-600 font-medium mb-4">Chức vụ / Chuyên môn</p>
                <div className="prose prose-sm text-gray-600">
                  <p>
                    Mô tả về diễn giả sẽ được hiển thị ở đây. Bao gồm thông tin về kinh nghiệm, 
                    thành tựu, lĩnh vực chuyên môn và những đóng góp nổi bật trong ngành.
                  </p>
                  <p className="mt-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                    exercitation ullamco laboris.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────── */}
          {/* Seat Map: Only shown if event has venue and seats     */}
          {/* ───────────────────────────────────────────────────── */}
          {event.areaId && allSeats.length > 0 && (
            <div id="seat-map" className="bg-white rounded-2xl shadow-lg p-8 scroll-mt-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Sơ đồ chỗ ngồi</h2>
              
              {/* Current selection status banner */}
              {selectedTicket && (
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-700 mb-1">
                    Đang chọn ghế loại: <span className="font-bold text-orange-600">{selectedTicket.name}</span>
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Đã chọn: <span className="font-bold text-blue-600">{seatSelection.selectedSeats.length}/{seatSelection.numberOfSeats}</span> ghế
                    </span>
                    {seatSelection.selectionMode === 'manual' && seatSelection.selectedSeats.length < seatSelection.numberOfSeats && (
                      <span className="text-green-600 font-medium">
                        👆 Nhấn vào ghế để chọn
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Suggested Seats Hint */}
              {seatSelection.suggestedSeats.length > 0 && seatSelection.selectionMode === 'manual' && seatSelection.selectedSeats.length < seatSelection.numberOfSeats && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-800 mb-1">
                    💡 Gợi ý ghế tốt
                  </p>
                  <p className="text-xs text-green-700">
                    Ghế gần sân khấu và ở giữa: {seatSelection.suggestedSeats.slice(0, 3).map(s => `${s.rowNo}${s.colNo}`).join(', ')}
                  </p>
                </div>
              )}
              
              {loadingSeats ? (
                <p className="text-gray-500 text-center py-8">Đang tải sơ đồ chỗ ngồi...</p>
              ) : (
                <>
                  <SeatGrid 
                    seats={allSeats} 
                    selectedSeats={seatSelection.selectedSeats} 
                    onSeatSelect={handleSeatSelect}
                    highlightType={selectedTicket?.name}
                    numberOfSeats={seatSelection.numberOfSeats}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* ───────────────────────────────────────────────────── */}
        {/* Right Column - Ticket selection panel (1/3 width)     */}
        {/* Sticky positioning keeps it visible while scrolling   */}
        {/* ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Đăng ký tham gia</h2>

            {/* Step 1: Choose ticket type (VIP or STANDARD) */}
            {/* Uses extracted TicketCards components */}
            <div className="space-y-4 mb-6">
              {vipTicket && (
                <div className={selectedTicket?.categoryTicketId === vipTicket.categoryTicketId ? 'ring-2 ring-orange-500 rounded-xl' : ''}>
                  <VIPTicketCard 
                    ticket={vipTicket}
                    onSelect={() => handleTicketSelect(vipTicket)}
                  />
                </div>
              )}

              {standardTicket && (
                <div className={selectedTicket?.categoryTicketId === standardTicket.categoryTicketId ? 'ring-2 ring-orange-500 rounded-xl' : ''}>
                  <StandardTicketCard 
                    ticket={standardTicket}
                    onSelect={() => handleTicketSelect(standardTicket)}
                  />
                </div>
              )}
            </div>

            {/* ───────────────────────────────────────────────────── */}
            {/* Step 2: Mode selection (Fast/Manual) */}
            {/* Shown after user selects ticket type */}
            {/* ───────────────────────────────────────────────────── */}
            {seatSelection.showSeatOptions && selectedTicket && (
              <ModeSelectionModal 
                onFastChoose={handleFastChoose}
                onManualChoose={handleManualChoose}
              />
            )}

            {/* ───────────────────────────────────────────────────── */}
            {/* Step 3: Quantity input (1-10 seats) */}
            {/* Shown after user selects fast or manual mode */}
            {/* ───────────────────────────────────────────────────── */}
            {seatSelection.showQuantityModal && selectedTicket && seatSelection.selectionMode && (
              <QuantityModal 
                selectionMode={seatSelection.selectionMode}
                numberOfSeats={seatSelection.numberOfSeats}
                onNumberChange={(value) => seatSelection.setNumberOfSeats(value)}
                onConfirm={seatSelection.selectionMode === 'fast' ? executeFastPick : executeManualPick}
                onBack={() => {
                  seatSelection.setShowQuantityModal(false)
                  seatSelection.setShowSeatOptions(true)
                }}
              />
            )}

            {/* ───────────────────────────────────────────────────── */}
            {/* Reservation countdown (5-minute timer) */}
            {/* Only shown in fast-pick mode after seats selected */}
            {/* ───────────────────────────────────────────────────── */}
            {seatSelection.reservationExpiry && seatSelection.remainingTime > 0 && (
              <ReservationTimer remainingTime={seatSelection.remainingTime} />
            )}

            {/* Warning when selected seats are not adjacent */}
            {seatSelection.showScatteredWarning && (
              <ScatteredWarning onDismiss={() => {}} />
            )}

            {/* List of currently selected seats with remove buttons */}
            {seatSelection.selectedSeats.length > 0 && (
              <SelectedSeatsList 
                selectedSeats={seatSelection.selectedSeats}
                numberOfSeats={seatSelection.numberOfSeats}
                onRemoveSeat={handleSeatSelect}
              />
            )}

            {/* ───────────────────────────────────────────────────── */}
            {/* Final step: Register button (checkout) */}
            {/* Only shown for ATTENDEE role when event is OPEN */}
            {/* Disabled until ticket type is selected */}
            {/* ───────────────────────────────────────────────────── */}
            {event.status === 'OPEN' && !isOrganizer && !isStaff && (
              <button
                onClick={handleRegister}
                disabled={!selectedTicket}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  selectedTicket
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/50'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  <span>Đăng ký ngay</span>
                </div>
                {selectedTicket && seatSelection.selectedSeats.length > 0 && (
                  <div className="text-sm font-normal mt-1">
                    Tổng: {(selectedTicket.price * seatSelection.selectedSeats.length).toLocaleString('vi-VN')} VNĐ
                  </div>
                )}
              </button>
            )}

            {event.status === 'CLOSED' && (
              <div className="p-4 bg-gray-100 rounded-xl text-center">
                <p className="text-gray-600 font-medium">Sự kiện đã đóng đăng ký</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
