import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, UserRole } from '../../contexts/AuthContext'
import { GraduationCap } from 'lucide-react'
import { Input, Button, MockCredentials } from '../../components/common'
import { validateEmail } from '../../utils'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('STUDENT')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const newErrors: Record<string, string> = {}
    if (!validateEmail(email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    setLoading(true)
    
    try {
      await login(email, password, role)
      
      // Navigate based on role
      if (role === 'STUDENT') {
        navigate('/dashboard')
      } else if (role === 'ORGANIZER') {
        navigate('/dashboard')
      } else if (role === 'ADMIN' || role === 'STAFF') {
        navigate('/dashboard')
      }
    } catch (error: any) {
      setErrors({ form: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' })
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
          <p className="text-gray-600 mt-2">
            Đăng nhập vào hệ thống
          </p>
        </div>

        {/* Mock Credentials Display */}
        <MockCredentials />

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{errors.form}</div>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@fpt.edu.vn"
            required
            error={errors.email}
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            required
            error={errors.password}
          />

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="STUDENT">Sinh viên</option>
              <option value="ORGANIZER">Tổ chức sự kiện</option>
              <option value="STAFF">Nhân viên</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/auth/reset-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="text-sm">
              <Link
                to="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Đăng ký
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </div>
    </div>
  )
}


