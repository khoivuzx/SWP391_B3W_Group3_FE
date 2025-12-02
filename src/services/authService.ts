/**
 * Authentication Service
 * Handles user authentication and authorization
 * This will be replaced with actual API calls when backend is ready
 */

export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'organizer'
  studentId?: string
  organizerName?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

// Mock users for development
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'student@fpt.edu.vn',
    role: 'student',
    studentId: 'SE123456',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'organizer@fpt.edu.vn',
    role: 'organizer',
    organizerName: 'IT Club',
  },
]

// Login
export async function login(credentials: LoginCredentials): Promise<User> {
  // TODO: Replace with actual API call
  // return await axios.post('/api/auth/login', credentials)
  
  // Mock authentication
  const user = mockUsers.find(u => u.email === credentials.email)
  if (!user || credentials.password !== 'password') {
    throw new Error('Invalid credentials')
  }
  
  return Promise.resolve(user)
}

// Logout
export async function logout(): Promise<void> {
  // TODO: Replace with actual API call
  // return await axios.post('/api/auth/logout')
  return Promise.resolve()
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  // TODO: Replace with actual API call
  // return await axios.get('/api/auth/me')
  
  // Mock: retrieve from localStorage
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  return Promise.resolve(JSON.parse(userStr) as User)
}

// Verify token
export async function verifyToken(token: string): Promise<boolean> {
  // TODO: Replace with actual API call
  // return await axios.post('/api/auth/verify', { token })
  return Promise.resolve(!!token)
}
