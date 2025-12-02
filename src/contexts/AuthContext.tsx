import React, { createContext, useContext, useState, useEffect } from 'react'

export type UserRole = 'Student' | 'Event Organizer' | 'Staff'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  studentId?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const login = (email: string, password: string, role: UserRole) => {
    // Mock login - in real app, this would call an API
    const mockUsers: Record<UserRole, User> = {
      Student: {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'student@fpt.edu.vn',
        role: 'Student',
        studentId: 'SE123456'
      },
      'Event Organizer': {
        id: '2',
        name: 'Trần Thị B',
        email: 'organizer@fpt.edu.vn',
        role: 'Event Organizer'
      },
      Staff: {
        id: '3',
        name: 'Lê Văn C',
        email: 'staff@fpt.edu.vn',
        role: 'Staff'
      }
    }
    setUser(mockUsers[role])
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

