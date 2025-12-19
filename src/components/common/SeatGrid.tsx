// src/components/common/SeatGrid.tsx
import { useState } from 'react'

export type Seat = {
  seatId: number
  seatCode: string
  rowNo: string
  colNo: string
  status: string
  seatType?: string
  areaId: number
}

interface SeatGridProps {
  seats: Seat[]
  loading?: boolean
  selectedSeats?: Seat[]
  onSeatSelect: (seat: Seat | null) => void
  maxReached?: boolean
  // When true the entire grid is read-only (no interaction). Useful when
  // the event has already ended or selection should be disabled.
  disabled?: boolean
}

export function SeatGrid({ seats, loading = false, selectedSeats = [], onSeatSelect, maxReached = false, disabled = false }: SeatGridProps) {
  const [error] = useState<string | null>(null)

  if (loading) {
    return <p className="text-gray-500 mb-3">Đang tải danh sách ghế...</p>
  }

  if (error) {
    return <p className="text-red-500 mb-3">{error}</p>
  }

  console.log('Seats state:', seats)
  console.log('Seats length:', seats.length)

  if (seats.length === 0) {
    return (
      <p className="text-gray-600 mb-4">
        Hiện không còn ghế trống trong khu vực này.
      </p>
    )
  }

  // Group seats by row
  const seatsByRow: Record<string, Seat[]> = {}
  seats.forEach(seat => {
    const rowKey = seat.rowNo || 'Unknown'
    if (!seatsByRow[rowKey]) {
      seatsByRow[rowKey] = []
    }
    seatsByRow[rowKey].push(seat)
  })

  console.log('Seats grouped by row:', seatsByRow) // Debug log

  // Find the maximum number of columns across all rows
  const maxColumns = Math.max(1, ...Object.values(seatsByRow).map(rowSeats =>
    Math.max(1, ...rowSeats.map(s => parseInt(s.colNo || '1')))
  ))

  // Create a full grid with placeholders for missing seats
  const createSeatGrid = (rowSeats: Seat[], maxCols: number) => {
    const grid: (Seat | null)[] = []
    for (let col = 1; col <= maxCols; col++) {
      const seat = rowSeats.find(s => parseInt(s.colNo) === col)
      grid.push(seat || null)
    }
    return grid
  }

  const getSeatColor = (seat: Seat, isSelected: boolean, gridDisabled: boolean = false) => {
    // If grid is disabled (e.g., event ended) and seat is not selected,
    // show faded/unavailable appearance for all seats.
    if (gridDisabled && !isSelected) {
      return 'border-gray-200 bg-white cursor-not-allowed text-transparent'
    }

    if (isSelected) return 'border-blue-600 bg-blue-100 font-semibold'

    // If max reached and not selected -> faded
    if (maxReached && !isSelected) {
      return 'border-gray-200 bg-white cursor-not-allowed text-transparent'
    }

    if (seat.status === 'BOOKED' || seat.status === 'RESERVED' || seat.status === 'OCCUPIED') {
      return 'border-red-400 bg-red-100 cursor-not-allowed text-red-800'
    }

    if (seat.status === 'HOLD') {
      return 'border-gray-400 bg-gray-200 cursor-not-allowed text-gray-700'
    }

    return 'border-green-400 bg-green-50 hover:bg-green-100 text-green-800'
  }

  // Identify VIP rows
  const sortedRows = Object.keys(seatsByRow).sort()
  const vipRows = sortedRows.filter(row => 
    seatsByRow[row].some(seat => seat.seatType === 'VIP')
  )
  const standardRows = sortedRows.filter(row => 
    seatsByRow[row].some(seat => seat.seatType === 'STANDARD')
  )
  const firstVipRow = vipRows[0]
  const lastVipRow = vipRows[vipRows.length - 1]
  const firstStandardRow = standardRows[0]
  const lastStandardRow = standardRows[standardRows.length - 1]
  const hasVipSection = vipRows.length > 0
  const hasStandardSection = standardRows.length > 0

  return (
    <div className="mb-6">
      {/* VIP Section Label */}
      {hasVipSection && (
        <div className="mb-2 flex items-center gap-2">
          <div className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full border border-red-300">
            VIP SECTION
          </div>
        </div>
      )}

      {/* Seat Grid */}
      <div className="space-y-3">
        {sortedRows.map((row, rowIndex) => {
          const seatGrid = createSeatGrid(seatsByRow[row], maxColumns)
          const isVipRow = vipRows.includes(row)
          const isStandardRow = standardRows.includes(row)
          const isFirstVipRow = row === firstVipRow
          const isLastVipRow = row === lastVipRow
          const isFirstStandardRow = row === firstStandardRow
          const isLastStandardRow = row === lastStandardRow
          
          return (
            <div key={row}>
              {/* STANDARD Section Label - hiện trước hàng STANDARD đầu tiên */}
              {isFirstStandardRow && hasStandardSection && (
                <div className="mb-2 mt-4 flex items-center gap-2">
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-300">
                    STANDARD SECTION
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <div className="w-8 text-center font-semibold text-gray-700 text-sm">{row}</div>
                <div className={`flex gap-2 ${
                  isVipRow 
                    ? `${isFirstVipRow ? 'pt-3' : ''} ${isLastVipRow ? 'pb-3' : ''} pl-2 pr-2 border-l-4 border-r-4 border-red-500 ${
                        isFirstVipRow ? 'border-t-4 rounded-t-lg' : ''
                      } ${
                        isLastVipRow ? 'border-b-4 rounded-b-lg' : ''
                      } bg-red-50/30`
                    : isStandardRow
                    ? `${isFirstStandardRow ? 'pt-3' : ''} ${isLastStandardRow ? 'pb-3' : ''} pl-2 pr-2 border-l-4 border-r-4 border-blue-400 ${
                        isFirstStandardRow ? 'border-t-4 rounded-t-lg' : ''
                      } ${
                        isLastStandardRow ? 'border-b-4 rounded-b-lg' : ''
                      } bg-blue-50/30`
                    : ''
                }`}>
                  {seatGrid.map((seat, index) => (
                    seat ? (
                      <button
                        key={seat.seatId}
                        type="button"
                        onClick={() => {
                          // Prevent clicking when grid disabled
                          if (disabled || seat.status !== 'AVAILABLE') return
                          onSeatSelect(seat)
                        }}
                        // disable when seat unavailable or grid is disabled
                        disabled={disabled || seat.status !== 'AVAILABLE'}
                        className={`w-12 h-10 border-2 rounded-lg text-xs font-medium transition-colors ${
                          getSeatColor(seat, selectedSeats.some(s => s.seatId === seat.seatId), disabled)
                        }`}
                        title={disabled ? `${seat.seatCode}: sự kiện đã kết thúc` : `${seat.seatCode} (${seat.seatType}): ${seat.status}`}
                      >
                        {maxReached && !selectedSeats.some(s => s.seatId === seat.seatId) ? '' : seat.seatCode}
                      </button>
                    ) : (
                      <div key={`empty-${row}-${index}`} className="w-12 h-10"></div>
                    )
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-2">Chú thích:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-50 border-2 border-green-400 rounded mr-1.5"></div>
            <span>Ghế trống</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-200 border-2 border-gray-400 rounded mr-1.5"></div>
            <span>Đang đặt</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-100 border-2 border-red-400 rounded mr-1.5"></div>
            <span>Đã đặt</span>
          </div>
        </div>
      </div>
    </div>
  )
}
