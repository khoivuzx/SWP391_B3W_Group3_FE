/**
 * SeatGrid Component - Interactive venue seat map visualization
 * Used by: EventDetail page for seat selection during ticket purchase
 * 
 * Features:
 * - Visual seat map with rows and columns
 * - Color-coded seat status (available, occupied, VIP, standard)
 * - Multiple seat selection support (for group bookings)
 * - Click to select/deselect seats
 * - VIP section highlighting with golden border
 * - Responsive grid layout
 */
// src/components/common/SeatGrid.tsx
import { useState } from 'react'

/**
 * Seat data structure from backend API
 * Represents a single seat in the venue
 */
export type Seat = {
  seatId: number        // Unique identifier
  seatCode: string      // Display code (e.g., "A1", "B5")
  rowNo: string         // Row letter (A, B, C, etc.)
  colNo: string         // Column number (1, 2, 3, etc.)
  status: string        // "AVAILABLE", "OCCUPIED", "RESERVED", "BOOKED"
  seatType?: string     // "VIP" or "STANDARD"
  areaId: number        // Venue area identifier
}

/**
 * Props for SeatGrid component
 * Supports both single and multiple seat selection modes
 */
interface SeatGridProps {
  seats: Seat[]           // All seats in the venue (from API)
  loading?: boolean       // Show loading state during seat fetch
  
  // *** Multiple Seat Selection (NEW) ***
  // Implements: Group booking feature in EventDetail
  selectedSeats?: Seat[]  // Array of currently selected seats (e.g., [A1, A2, B3])
  
  // *** Single Seat Selection (LEGACY) ***
  // Kept for backward compatibility with other components
  selectedSeat?: Seat | null  // Single selected seat (old approach)
  
  onSeatSelect: (seat: Seat | null) => void  // Callback when user clicks a seat
  highlightType?: string  // Filter to highlight specific seat types (VIP/STANDARD)
  numberOfSeats?: number  // Maximum seats allowed (disables others when limit reached)
}

/**
 * SeatGrid Component Function
 * Renders an interactive seat map for event ticket purchasing
 * 
 * Props:
 * @param seats - All seats from venue (fetched from API)
 * @param loading - Shows loading message during data fetch
 * @param selectedSeats - Array of selected seats (multiple selection support)
 * @param selectedSeat - Single selected seat (backward compatibility)
 * @param onSeatSelect - Callback when user clicks a seat
 * @param highlightType - Optional filter for seat type highlighting
 * @param numberOfSeats - Maximum seats allowed (disables others when reached)
 * 
 * Key Features:
 * - Groups seats by row (A, B, C, etc.)
 * - Creates aligned grid with placeholders for missing seats
 * - Highlights VIP sections with red border
 * - Color codes seats: Blue (selected), Green (standard), Red (VIP), Grey (booked)
 * - Disables seats when selection limit reached
 * - Supports multiple seat selection via selectedSeats array
 * - Maintains backward compatibility with single selection
 */
export function SeatGrid({ 
  seats, 
  loading = false, 
  selectedSeats = [],      // Default to empty array for multiple selection
  selectedSeat = null,     // Default to null for single selection
  onSeatSelect,
  highlightType,
  numberOfSeats = 999      // Default to high number (no limit)
}: SeatGridProps) {
  const [error] = useState<string | null>(null)

  // Loading state - show while fetching seats from API
  if (loading) {
    return <p className="text-gray-500 mb-3">Đang tải danh sách ghế...</p>
  }

  // Error state - show if seat fetch failed
  if (error) {
    return <p className="text-red-500 mb-3">{error}</p>
  }

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

  /**
   * Determines the visual styling (colors) for each seat button
   * Used by: Seat rendering logic below to apply Tailwind classes
   * 
   * @param seat - The seat object containing type, status, etc.
   * @param isSelected - Whether this seat is currently selected by the user
   * @param isDisabledByLimit - Whether seat is disabled due to selection limit reached
   * @returns Tailwind CSS classes as a string
   * 
   * NEW Color scheme:
   * - Selected seats: Blue (indicates user's choice)
   * - Unavailable seats: Grey (reserved/occupied/booked)
   * - Disabled by limit: Grey (limit reached, not selected)
   * - VIP available: Red (premium seats)
   * - Standard available: Green (regular seats)
   */
  const getSeatColor = (seat: Seat, isSelected: boolean, isDisabledByLimit: boolean = false) => {
    // Highlight selected seats with blue color for visibility
    if (isSelected) return 'border-blue-600 bg-blue-100 font-semibold'
    
    // Disabled by limit - grey out with not-allowed cursor
    if (isDisabledByLimit) {
      return 'border-gray-300 bg-gray-100 cursor-not-allowed text-gray-400 opacity-50'
    }
    
    // Reserved, booked, and occupied seats are grey and non-clickable
    if (seat.status === 'RESERVED' || seat.status === 'OCCUPIED' || seat.status === 'BOOKED') {
      return 'border-gray-400 bg-gray-200 cursor-not-allowed text-gray-500'
    }
    
    // Available seats: VIP = red (premium), STANDARD = green (regular)
    if (seat.seatType === 'VIP') {
      return 'border-red-400 bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer'
    }
    
    // STANDARD or default seats - green
    return 'border-green-400 bg-green-50 hover:bg-green-100 text-green-700 cursor-pointer'
  }

  // Identify VIP rows
  const sortedRows = Object.keys(seatsByRow).sort()
  const vipRows = sortedRows.filter(row => 
    seatsByRow[row].some(seat => seat.seatType === 'VIP')
  )
  const firstVipRow = vipRows[0]
  const lastVipRow = vipRows[vipRows.length - 1]
  const hasVipSection = vipRows.length > 0

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
          const isFirstVipRow = row === firstVipRow
          const isLastVipRow = row === lastVipRow
          
          return (
            <div 
              key={row} 
              className={`flex items-center space-x-2 ${
                isVipRow 
                  ? `${isFirstVipRow ? 'pt-3' : ''} ${isLastVipRow ? 'pb-3' : ''} pl-2 pr-2 border-l-4 border-r-4 border-red-500 ${
                      isFirstVipRow ? 'border-t-4 rounded-t-lg' : ''
                    } ${
                      isLastVipRow ? 'border-b-4 rounded-b-lg' : ''
                    } bg-red-50/30`
                  : ''
              }`}
            >
              <div className="w-8 text-center font-semibold text-gray-700 text-sm">{row}</div>
              <div className="flex-1 flex gap-2">
                {seatGrid.map((seat, index) => (
                  seat ? (
                    // Individual seat button - clickable for available seats
                    // Implements: Multiple seat selection from EventDetail page with limit enforcement
                    (() => {
                      const isSelected = selectedSeats?.some(s => s.seatId === seat.seatId) || selectedSeat?.seatId === seat.seatId
                      const isLimitReached = (selectedSeats?.length || 0) >= numberOfSeats
                      const isDisabledByLimit = isLimitReached && !isSelected && seat.status === 'AVAILABLE'
                      const isDisabled = seat.status === 'OCCUPIED' || seat.status === 'RESERVED' || seat.status === 'BOOKED' || isDisabledByLimit
                      
                      return (
                        <button
                          key={seat.seatId}
                          type="button"
                          // Only allow clicking available seats OR already selected seats (for deselection)
                          onClick={() => {
                            if (seat.status !== 'OCCUPIED' && seat.status !== 'RESERVED' && seat.status !== 'BOOKED') {
                              if (isSelected || !isLimitReached) {
                                onSeatSelect(seat)
                              }
                            }
                          }}
                          disabled={isDisabled}
                          className={`w-12 h-10 border-2 rounded-lg text-xs font-medium transition-colors ${
                            // Check if seat is selected in EITHER selectedSeats array OR single selectedSeat
                            // This supports both new multiple selection and legacy single selection
                            getSeatColor(seat, isSelected, isDisabledByLimit)
                          }`}
                          title={`${seat.seatCode} (${seat.seatType}): ${seat.status}`}
                        >
                          {seat.seatCode}
                        </button>
                      )
                    })()
                  ) : (
                    // Empty placeholder for missing seats (maintains grid alignment)
                    <div key={`empty-${row}-${index}`} className="w-12 h-10"></div>
                  )
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend - Updated color scheme */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-2">Chú thích:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-100 border-2 border-blue-600 rounded mr-1.5"></div>
            <span>Đã chọn</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-50 border-2 border-red-400 rounded mr-1.5"></div>
            <span>VIP (Trống)</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-50 border-2 border-green-400 rounded mr-1.5"></div>
            <span>Standard (Trống)</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-200 border-2 border-gray-400 rounded mr-1.5"></div>
            <span>Đã đặt/Đã ngồi</span>
          </div>
        </div>
      </div>
    </div>
  )
}
