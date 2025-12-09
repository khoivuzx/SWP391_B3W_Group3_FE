import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap } from 'lucide-react'
import axios from 'axios'
import ReCAPTCHA from 'react-google-recaptcha'

// Use proxy to avoid CORS issues in development
const API_URL = '/api'

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.headers.common['Accept'] = 'application/json'

interface FormData {
  email: string
  password: string
}

// reCAPTCHA site key - HƯỚNG DẪN:
// 1. Truy cập: https://www.google.com/recaptcha/admin/create
// 2. Chọn reCAPTCHA v2 (checkbox)
// 3. Thêm domain: localhost và domain production
// 4. Copy Site Key và dán vào đây
const RECAPTCHA_SITE_KEY = '6LcRNiUsAAAAAOTRRAnoQAHXQNfIFx5v49ZAbnsK' // Test key - THAY BẰNG SITE KEY THẬT
const USE_REAL_RECAPTCHA = true // Đổi thành false để dùng TEST_BYPASS khi debug nhanh

export default function Login() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA | null>(null)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleLogin = async () => {
    // ensure we have a token when using real recaptcha
    if (USE_REAL_RECAPTCHA && !recaptchaToken) {
      throw new Error('Vui lòng xác thực reCAPTCHA trước khi đăng nhập.')
    }

    const tokenToSend = USE_REAL_RECAPTCHA ? recaptchaToken : 'TEST_BYPASS'
    console.log('Sending login request. recaptchaToken (first 40 chars):', tokenToSend ? tokenToSend.slice(0, 40) : null)

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: formData.email,
        password: formData.password,
        recaptchaToken: tokenToSend
      })

      console.log('Login Response:', response.data)

      if (response.data && response.data.status === 'success') {
        const { user, token } = response.data

        console.log('User:', user)
        console.log('Token (first 40 chars):', token ? token.slice(0, 40) : null)

        // Save token and user to localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        // Update user in AuthContext with data from API
        setUser(user)

        // Reset captcha on success (optional)
        try {
          recaptchaRef.current?.reset()
        } catch (_) {}

        // Navigate to dashboard
        navigate('/dashboard')
        return
} else if (response.data && response.data.status === 'fail') {
        const msg = response.data.message || 'Đăng nhập thất bại'
        throw new Error(msg)
      } else {
        throw new Error('Đăng nhập thất bại')
      }
    } catch (err: any) {
      console.error('Login error (axios):', err)
      if (err.response) {
        console.error('Server response data:', err.response.data)
        // surface server message when available
        const srvMsg = err.response.data?.message || err.response.data?.error || null
        if (srvMsg) throw new Error(srvMsg)
        throw new Error(`Lỗi ${err.response.status}: ${err.response.statusText}`)
      } else if (err.request) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend và CORS.')
      } else {
        throw err
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('recaptchaToken at submit:', recaptchaToken)

    // If using real reCAPTCHA, require token
    if (USE_REAL_RECAPTCHA && !recaptchaToken) {
      setError('Vui lòng xác nhận bạn không phải là robot!')
      return
    }

    setLoading(true)
    setError('')

    try {
      await handleLogin()
    } catch (err: any) {
      console.error('Login Error (submit):', err)
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại!'

      if (err.message && err.message.includes('Backend đã chạy')) {
        errorMessage = err.message
      } else if (err.message) {
        // err.message often contains server message from above
        errorMessage = err.message
      }

      setError(errorMessage)
      // reset captcha if token turned invalid or server rejected it
      try {
        recaptchaRef.current?.reset()
        setRecaptchaToken(null)
      } catch (_) {}
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FPT Events</h1>
          <p className="text-gray-600 mt-2">Đăng nhập vào hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
value={formData.email}
              onChange={handleInputChange}
              placeholder="email@fpt.edu.vn"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={(token) => {
                console.log('reCAPTCHA onChange token (first 40 chars):', token ? token.slice(0, 40) : null)
                setRecaptchaToken(token)
                setError('')
              }}
              onExpired={() => {
                console.log('reCAPTCHA expired')
                setRecaptchaToken(null)
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || (USE_REAL_RECAPTCHA && !recaptchaToken)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Đăng ký ngay
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link to="/reset-password" className="text-blue-600 hover:text-blue-700 font-medium">
                Quên mật khẩu?
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
