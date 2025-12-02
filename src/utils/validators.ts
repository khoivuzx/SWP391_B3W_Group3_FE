/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate student ID format (example: SE123456)
 */
export function isValidStudentId(studentId: string): boolean {
  const studentIdRegex = /^[A-Z]{2}\d{6}$/
  return studentIdRegex.test(studentId)
}

/**
 * Validate phone number (Vietnamese format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(0|\+84)[0-9]{9}$/
  return phoneRegex.test(phone)
}

/**
 * Validate required field
 */
export function isRequired(value: string): boolean {
  return value.trim().length > 0
}

/**
 * Validate minimum length
 */
export function minLength(value: string, min: number): boolean {
  return value.trim().length >= min
}

/**
 * Validate maximum length
 */
export function maxLength(value: string, max: number): boolean {
  return value.trim().length <= max
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate image file type
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}
