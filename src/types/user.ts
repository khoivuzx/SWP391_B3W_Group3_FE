export type Role = 'ORGANIZER' | 'STAFF'
export type Status = 'ACTIVE' | 'INACTIVE'

export interface User {
  userId: number
  username: string
  fullName: string
  email: string
  phone: string
  role: Role
  status: Status
  createdAt?: string
}

export interface CreateUserRequest {
  username: string
  password: string
  fullName: string
  email: string
  phone: string
  role: Role
}

export interface UpdateUserRequest {
  userId: number
  fullName: string
  email: string
  phone: string
  role: Role
  status: Status
}
