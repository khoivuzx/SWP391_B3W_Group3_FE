import React, { createContext, useContext, useState, useEffect } from 'react'
import { findUserByCredentials } from '../data/mockData'

export type UserRole = 'STUDENT' | 'ORGANIZER' | 'STAFF' | 'ADMIN'

export interface User {
  id: number
  fullName: string
  email: string
  phone?: string
  role: UserRole
  status: string
  password?: string
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      // Remove password before storing
      const { password, ...userWithoutPassword } = user
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const foundUser = findUserByCredentials(email, password)
    
    if (!foundUser) {
      throw new Error('Email hoặc mật khẩu không đúng!')
    }

    if (foundUser.role !== role) {
      throw new Error(`Tài khoản này không phải là ${role}!`)
    }

    if (foundUser.status !== 'ACTIVE') {
      throw new Error('Tài khoản đã bị khóa!')
    }

    // Remove password before setting user
    const { password: _, ...userWithoutPassword } = foundUser
    setUser(userWithoutPassword)
  }

  const logout = () => {
    setUser(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isAuthenticated }}>
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

