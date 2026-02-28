export interface LoginRequest {
  email:    string
  password: string
}

export interface RegisterRequest {
  name:     string
  email:    string
  password: string
  role:     'USER' | 'PROVIDER'
}

export interface AuthResponse {
  token: string
  user:  {
    id:    number
    name:  string
    email: string
    role:  string
  }
}
