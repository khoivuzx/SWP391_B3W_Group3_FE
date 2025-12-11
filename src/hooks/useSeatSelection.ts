/**
 * Custom hook for seat selection logic
 * Handles all seat selection state and operations
 */
import { useState, useEffect } from 'react'
import type { Seat } from '../components/common/SeatGrid'

type SelectionMode = 'fast' | 'manual' | null

interface UseSeatSelectionProps {
  allSeats: Seat[]
  selectedTicketName?: string
}

export function useSeatSelection({ allSeats, selectedTicketName }: UseSeatSelectionProps) {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [numberOfSeats, setNumberOfSeats] = useState(1)
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null)
  const [showSeatOptions, setShowSeatOptions] = useState(false)
  const [showQuantityModal, setShowQuantityModal] = useState(false)
  const [reservationExpiry, setReservationExpiry] = useState<Date | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [showScatteredWarning, setShowScatteredWarning] = useState(false)
  const [suggestedSeats, setSuggestedSeats] = useState<Seat[]>([])

  // Reservation timer countdown effect
  useEffect(() => {
    if (!reservationExpiry) {
      setRemainingTime(0)
      return
    }
    
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expiry = reservationExpiry.getTime()
      const diff = Math.max(0, Math.floor((expiry - now) / 1000))
      
      setRemainingTime(diff)
      
      if (diff === 0) {
        setReservationExpiry(null)
        alert('Thời gian giữ ghế đã hết. Vui lòng chọn lại.')
        setSelectedSeats([])
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [reservationExpiry])

  const resetSelection = () => {
    setSelectedSeats([])
    setSelectionMode(null)
    setNumberOfSeats(1)
    setReservationExpiry(null)
    setShowSeatOptions(false)
    setShowQuantityModal(false)
    setShowScatteredWarning(false)
  }

  return {
    selectedSeats,
    setSelectedSeats,
    numberOfSeats,
    setNumberOfSeats,
    selectionMode,
    setSelectionMode,
    showSeatOptions,
    setShowSeatOptions,
    showQuantityModal,
    setShowQuantityModal,
    reservationExpiry,
    setReservationExpiry,
    remainingTime,
    showScatteredWarning,
    setShowScatteredWarning,
    suggestedSeats,
    setSuggestedSeats,
    resetSelection,
  }
}
