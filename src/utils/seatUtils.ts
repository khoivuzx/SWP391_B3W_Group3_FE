/**
 * Utility functions for seat selection algorithms
 */
import type { Seat } from '../components/common/SeatGrid'

/**
 * Calculate suggested seats - highlights best available seats for user
 * Shows seats closest to stage and center for optimal viewing
 */
export function calculateSuggestedSeats(
  allSeats: Seat[],
  selectedTicketName: string,
  currentSelection: Seat[]
): Seat[] {
  const availableSeats = allSeats.filter(seat => 
    seat.status === 'AVAILABLE' && 
    seat.seatType === selectedTicketName &&
    !currentSelection.some(s => s.seatId === seat.seatId)
  )
  
  // Sort by proximity to stage (front rows) and center position
  const sorted = availableSeats.sort((a, b) => {
    if (a.rowNo !== b.rowNo) return a.rowNo.localeCompare(b.rowNo)
    return Math.abs(parseInt(a.colNo) - 10) - Math.abs(parseInt(b.colNo) - 10)
  })
  
  return sorted.slice(0, 5) // Top 5 suggestions
}

/**
 * Check if selected seats are scattered (not adjacent)
 * Warns user about poor seat selection
 */
export function checkSeatsAdjacency(seats: Seat[]): boolean {
  if (seats.length <= 1) return true
  
  // Check if seats are in same row and have sequential columns
  const sameRow = seats.every(seat => seat.rowNo === seats[0].rowNo)
  if (!sameRow) return false
  
  const sortedSeats = [...seats].sort((a, b) => parseInt(a.colNo) - parseInt(b.colNo))
  
  for (let i = 1; i < sortedSeats.length; i++) {
    const colDiff = parseInt(sortedSeats[i].colNo) - parseInt(sortedSeats[i - 1].colNo)
    if (colDiff > 1) return false // Gap found
  }
  
  return true
}

/**
 * Fast-pick block finding algorithm
 * Finds continuous block of N adjacent seats
 */
export function findBestSeatBlock(
  allSeats: Seat[],
  selectedTicketName: string,
  numberOfSeats: number
): Seat[] {
  // Get all available seats for this ticket type
  const availableSeats = allSeats.filter(seat => 
    seat.status === 'AVAILABLE' && seat.seatType === selectedTicketName
  )
  
  // Group seats by row
  const seatsByRow: Record<string, Seat[]> = {}
  availableSeats.forEach(seat => {
    if (!seatsByRow[seat.rowNo]) seatsByRow[seat.rowNo] = []
    seatsByRow[seat.rowNo].push(seat)
  })
  
  // Sort each row by column number
  Object.keys(seatsByRow).forEach(row => {
    seatsByRow[row].sort((a, b) => parseInt(a.colNo) - parseInt(b.colNo))
  })
  
  let bestBlock: Seat[] = []
  
  // PRIORITY 1: Find continuous block of N seats in same row
  for (const row of Object.keys(seatsByRow).sort()) {
    const rowSeats = seatsByRow[row]
    
    // Look for continuous sequences
    for (let i = 0; i <= rowSeats.length - numberOfSeats; i++) {
      const block = rowSeats.slice(i, i + numberOfSeats)
      
      // Check if seats are continuous (column numbers are sequential)
      const isContinuous = block.every((seat, idx) => {
        if (idx === 0) return true
        return parseInt(seat.colNo) === parseInt(block[idx - 1].colNo) + 1
      })
      
      if (isContinuous) {
        bestBlock = block
        break // Found perfect block, use it
      }
    }
    
    if (bestBlock.length > 0) break
  }
  
  // PRIORITY 2: If no continuous block, find closest seats in front rows
  if (bestBlock.length === 0) {
    const sortedSeats = availableSeats.sort((a, b) => {
      // Sort by row (front first), then by column (center first)
      if (a.rowNo !== b.rowNo) return a.rowNo.localeCompare(b.rowNo)
      // Prefer center seats (assuming columns are numbered from edges)
      return Math.abs(parseInt(a.colNo) - 10) - Math.abs(parseInt(b.colNo) - 10)
    })
    
    bestBlock = sortedSeats.slice(0, numberOfSeats)
  }
  
  return bestBlock
}

/**
 * Verify seat availability from latest backend data
 */
export async function verifySeatAvailability(
  selectedSeats: Seat[],
  eventId: number,
  areaId: number,
  ticketType: string,
  token: string
): Promise<{ available: boolean; conflicts: Seat[]; latestSeats: Seat[] }> {
  try {
    const response = await fetch(
      `/api/seats?areaId=${areaId}&eventId=${eventId}&seatType=${ticketType}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Không thể kiểm tra tình trạng ghế')
    }

    const data = await response.json()
    const latestSeats: Seat[] = data.seats || []

    // Check if any selected seats are now booked/reserved
    const selectedSeatIds = selectedSeats.map(s => s.seatId)
    const conflicts = latestSeats.filter(seat => 
      selectedSeatIds.includes(seat.seatId) && 
      (seat.status === 'BOOKED' || seat.status === 'RESERVED' || seat.status === 'OCCUPIED')
    )

    return {
      available: conflicts.length === 0,
      conflicts,
      latestSeats,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Temporarily reserve seats (if backend supports it)
 */
export async function temporarilyReserveSeats(
  eventId: number,
  seatIds: number[],
  token: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/seats/temporary-reserve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        eventId,
        seatIds,
        reservationDuration: 300, // 5 minutes
      }),
    })

    return response.ok
  } catch (error) {
    // Backend doesn't have this endpoint yet - that's okay
    console.warn('Temporary reservation API not available:', error)
    return false
  }
}
