export type UserRole = 'USER' | 'PROVIDER' | 'ADMIN'

export interface User {
  id:        number
  name:      string
  email:     string
  role:      UserRole
  createdAt?: string
}
