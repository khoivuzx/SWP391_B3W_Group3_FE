/**
 * Generate a QR code data string for event registration
 */
export function generateQRCodeData(
  eventId: string,
  userId: string,
  registrationId: string
): string {
  return `REG-${eventId}-${userId}-${registrationId}-${Date.now()}`
}

/**
 * Parse QR code data
 */
export function parseQRCodeData(qrData: string): {
  eventId: string
  userId: string
  registrationId: string
  timestamp: string
} | null {
  try {
    const parts = qrData.split('-')
    if (parts[0] !== 'REG' || parts.length < 5) {
      return null
    }

    return {
      eventId: parts[1],
      userId: parts[2],
      registrationId: parts[3],
      timestamp: parts[4],
    }
  } catch (error) {
    console.error('Error parsing QR code data:', error)
    return null
  }
}
