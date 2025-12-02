import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap } from 'lucide-react'
import { Input, Button } from '../components/common'
import { validateEmail, validateStudentId } from '../utils'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const newErrors: Record<string, string> = {}
    if (!validateEmail(email)) {
      newErrors.email = 'Email không hợp lệ (phải có @fpt.edu.vn)'
    }
    
    if (!isLogin) {
      if (!fullName.trim()) {
        newErrors.fullName = 'Vui lòng nhập họ tên'
      }
      if (!validateStudentId(studentId)) {
        newErrors.studentId = 'Mã sinh viên không hợp lệ (VD: SE123456)'
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    
    if (!isLogin) {
      // Mock registration
      alert('Đăng ký thành công! Vui lòng đăng nhập.')
      setIsLogin(true)
      setPassword('')
      setConfirmPassword('')
      return
    }
    
    // Login
    login(email, password, 'Student')
    navigate('/dashboard')
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
            {isLogin ? 'Đăng nhập vào hệ thống' : 'Tạo tài khoản mới'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <Input
                label="Họ và tên"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                error={errors.fullName}
              />

              <Input
                label="Mã sinh viên"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="SE123456"
                required
                error={errors.studentId}
                helperText="Định dạng: 2 chữ cái + 6 chữ số"
              />
            </>
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
          />

          {!isLogin && (
            <Input
              label="Xác nhận mật khẩu"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              required
              error={errors.confirmPassword}
            />
          )}

          <Button type="submit" className="w-full">
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setPassword('')
                setConfirmPassword('')
                setErrors({})
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}


