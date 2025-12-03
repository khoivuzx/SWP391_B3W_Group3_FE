import { useState } from 'react'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'

interface Credential {
  role: string
  email: string
  password: string
  description: string
}

const credentials: Credential[] = [
  {
    role: 'ADMIN',
    email: 'admin@fpt.edu.vn',
    password: 'admin123',
    description: 'Quản trị viên - Toàn quyền hệ thống'
  },
  {
    role: 'STAFF',
    email: 'staff@fpt.edu.vn',
    password: 'staff123',
    description: 'Nhân viên - Quản lý sự kiện'
  },
  {
    role: 'ORGANIZER',
    email: 'organizer@fpt.edu.vn',
    password: 'organizer123',
    description: 'Tổ chức viên - Tạo và quản lý sự kiện'
  },
  {
    role: 'STUDENT',
    email: 'student@fpt.edu.vn',
    password: 'student123',
    description: 'Sinh viên - Đăng ký tham gia sự kiện'
  }
]

export function MockCredentials() {
  const [showPasswords, setShowPasswords] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-blue-900">
          🔐 Tài khoản Demo (Mock)
        </h3>
        <button
          onClick={() => setShowPasswords(!showPasswords)}
          className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
        >
          {showPasswords ? (
            <>
              <EyeOff className="w-3 h-3" />
              Ẩn mật khẩu
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              Hiện mật khẩu
            </>
          )}
        </button>
      </div>

      <div className="space-y-2">
        {credentials.map((cred, index) => (
          <div
            key={index}
            className="bg-white rounded p-3 text-xs space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-700">{cred.role}</span>
              <span className="text-gray-500 text-[10px]">{cred.description}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-16">Email:</span>
              <code className="flex-1 bg-gray-50 px-2 py-1 rounded text-gray-800">
                {cred.email}
              </code>
              <button
                onClick={() => copyToClipboard(cred.email, index * 2)}
                className="text-blue-600 hover:text-blue-800"
                title="Copy email"
              >
                {copiedIndex === index * 2 ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 w-16">Password:</span>
              <code className="flex-1 bg-gray-50 px-2 py-1 rounded text-gray-800">
                {showPasswords ? cred.password : '••••••••'}
              </code>
              <button
                onClick={() => copyToClipboard(cred.password, index * 2 + 1)}
                className="text-blue-600 hover:text-blue-800"
                title="Copy password"
              >
                {copiedIndex === index * 2 + 1 ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-blue-700 mt-3 italic">
        💡 Chọn vai trò tương ứng trong dropdown khi đăng nhập
      </p>
    </div>
  )
}
