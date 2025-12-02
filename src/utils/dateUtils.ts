import { format as dateFnsFormat } from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * Format a date string to Vietnamese format
 * @param dateString - ISO date string
 * @param formatString - Date format pattern (default: 'dd/MM/yyyy HH:mm')
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  formatString: string = 'dd/MM/yyyy HH:mm'
): string {
  try {
    return dateFnsFormat(new Date(dateString), formatString, { locale: vi })
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

/**
 * Format a date for datetime-local input
 * @param dateString - ISO date string
 * @returns Formatted date string for input
 */
export function formatDateForInput(dateString: string): string {
  try {
    return dateString.slice(0, 16)
  } catch (error) {
    console.error('Error formatting date for input:', error)
    return ''
  }
}

/**
 * Check if a date is in the past
 * @param dateString - ISO date string
 * @returns True if date is in the past
 */
export function isPastDate(dateString: string): boolean {
  return new Date(dateString) < new Date()
}

/**
 * Check if a date is in the future
 * @param dateString - ISO date string
 * @returns True if date is in the future
 */
export function isFutureDate(dateString: string): boolean {
  return new Date(dateString) > new Date()
}

/**
 * Get time remaining until a date
 * @param dateString - ISO date string
 * @returns Object with days, hours, minutes
 */
export function getTimeRemaining(dateString: string): {
  days: number
  hours: number
  minutes: number
  total: number
} {
  const total = Date.parse(dateString) - Date.parse(new Date().toISOString())
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return {
    total,
    days,
    hours,
    minutes,
  }
}
