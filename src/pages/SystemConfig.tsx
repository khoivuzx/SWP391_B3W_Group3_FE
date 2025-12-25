import { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

/**
 * Kiểu dữ liệu cấu hình hệ thống
 * - minMinutesAfterStart: số phút tối thiểu sau khi sự kiện bắt đầu mới được check-out
 * - checkinAllowedBeforeStartMinutes: số phút trước khi sự kiện bắt đầu được check-in
 */
type SystemConfigData = {
  minMinutesAfterStart: number
  checkinAllowedBeforeStartMinutes: number
}

export default function SystemConfig() {
  // Hàm hiển thị toast (success / error)
  const { showToast } = useToast()

  /**
   * State lưu cấu hình hệ thống
   * Mặc định khởi tạo là 60 phút cho cả check-in và check-out
   * Đây chưa phải là dữ liệu cuối, set mặc định để tránh state undefined ban đầu
   * → sẽ gọi API lấy dữ liệu thật từ backend trong useEffect bên dưới
   */
  const [config, setConfig] = useState<SystemConfigData>({
    minMinutesAfterStart: 60,
    checkinAllowedBeforeStartMinutes: 60
  })

  // Trạng thái loading khi đang gọi API lấy config
  const [loading, setLoading] = useState(true)

  // Trạng thái saving khi đang lưu config
  const [saving, setSaving] = useState(false)

  // Lưu message lỗi nếu có
  const [error, setError] = useState<string | null>(null)

  /**
   * Lấy token từ localStorage
   * typeof window !== 'undefined' để tránh lỗi khi render phía server (SSR)
   */
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  /**
   * useEffect: chạy khi component mount hoặc khi token thay đổi
   * → gọi API để lấy cấu hình hệ thống hiện tại từ backend
   */
  useEffect(() => {
    const fetchConfig = async () => {
      // Nếu không có token thì không gọi API
      if (!token) return

      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/admin/config/system', {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': '1'
          },
          credentials: 'include'
        })

        // Parse JSON
        const data = await res.json()

        // Nếu response lỗi thì throw để catch xử lý
        if (!res.ok) {
          throw new Error(data?.error || data?.message || `HTTP ${res.status}`)
        }

        // Nếu backend trả dữ liệu thành công
        if (data.success && data.data) {
          setConfig({
            minMinutesAfterStart: data.data.minMinutesAfterStart ?? 60,
            checkinAllowedBeforeStartMinutes:
              data.data.checkinAllowedBeforeStartMinutes ?? 60
          })
        }
      } catch (err: any) {
        console.error('Fetch config error:', err)
        setError(err?.message || 'Không tải được cấu hình hệ thống')
      } finally {
        // Kết thúc loading
        setLoading(false)
      }
    }

    fetchConfig()
  }, [token])

  /**
   * handleChange
   * Xử lý khi người dùng thay đổi giá trị trong ô input
   * - Chỉ cho phép số từ 0 đến 600
   * - Nếu hợp lệ → cập nhật state config
   * - Nếu không hợp lệ → không update state
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = parseInt(value, 10)

    // Chỉ xử lý đúng 2 field cấu hình
    if (
      name === 'minMinutesAfterStart' ||
      name === 'checkinAllowedBeforeStartMinutes'
    ) {
      // Validate: số từ 0 đến 600
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 600) {
        setConfig(prev => ({ ...prev, [name]: numValue }))
      }
      // Trường hợp user xoá hết input
      else if (value === '') {
        setConfig(prev => ({ ...prev, [name]: 0 }))
      }
    }
  }

  /**
   * handleSave
   * Gọi API POST để lưu cấu hình hệ thống lên backend
   */
  const handleSave = async () => {
    if (!token) return

    // Validate lần cuối trước khi gửi lên backend
    if (config.minMinutesAfterStart < 0 || config.minMinutesAfterStart > 600) {
      showToast('error', 'Thời gian check-out phải từ 0 đến 600')
      return
    }
    if (
      config.checkinAllowedBeforeStartMinutes < 0 ||
      config.checkinAllowedBeforeStartMinutes > 600
    ) {
      showToast('error', 'Thời gian check-in phải từ 0 đến 600')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/config/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': '1'
        },
        credentials: 'include',
        body: JSON.stringify(config)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `HTTP ${res.status}`)
      }

      if (data.success) {
        showToast('success', data.message || 'Cập nhật cấu hình thành công!')

        // Nếu backend trả config mới thì sync lại state
        if (data.data) {
          setConfig({
            minMinutesAfterStart:
              data.data.minMinutesAfterStart ?? config.minMinutesAfterStart,
            checkinAllowedBeforeStartMinutes:
              data.data.checkinAllowedBeforeStartMinutes ??
              config.checkinAllowedBeforeStartMinutes
          })
        }
      }
    } catch (err: any) {
      console.error('Save config error:', err)
      const errorMsg = err?.message || 'Không thể lưu cấu hình'
      setError(errorMsg)
      showToast('error', errorMsg)
    } finally {
      setSaving(false)
    }
  }

  /**
   * handleReload
   * Gọi lại API để lấy cấu hình mới nhất từ backend
   */
  const handleReload = async () => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/config/system', {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': '1'
        },
        credentials: 'include'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `HTTP ${res.status}`)
      }

      if (data.success && data.data) {
        setConfig({
          minMinutesAfterStart: data.data.minMinutesAfterStart ?? 60,
          checkinAllowedBeforeStartMinutes:
            data.data.checkinAllowedBeforeStartMinutes ?? 60
        })
        showToast('success', 'Đã tải lại cấu hình')
      }
    } catch (err: any) {
      console.error('Reload config error:', err)
      setError(err?.message || 'Không tải được cấu hình hệ thống')
      showToast('error', 'Không tải được cấu hình')
    } finally {
      setLoading(false)
    }
  }

  /**
   * UI loading khi đang fetch config
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="text-gray-500">Đang tải cấu hình...</p>
        </div>
      </div>
    )
  }

  /**
   * UI chính của trang cấu hình hệ thống
   */
  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-orange-600" />
            Cấu hình hệ thống
          </h1>

          {/* Nút reload config */}
          <button
            onClick={handleReload}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
            title="Tải lại cấu hình"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* checkinAllowedBeforeStartMinutes - Check-in */}
          <div className="border border-green-200 bg-green-50/30 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <label className="block text-lg font-semibold text-gray-900">
                Thời gian cho phép Check-in trước sự kiện (phút)
              </label>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Số phút trước khi sự kiện bắt đầu mà người dùng có thể check-in.
              Giá trị từ 0 đến 600 phút (10 giờ).
            </p>

            <div className="flex items-center gap-4">
              <input
                type="number"
                name="checkinAllowedBeforeStartMinutes"
                value={config.checkinAllowedBeforeStartMinutes}
                onChange={handleChange}
                min="0"
                max="600"
                className="w-32 px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-lg font-medium"
              />
              <span className="text-gray-600">phút trước khi bắt đầu</span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-400">Gợi ý:</span>
              {[15, 30, 60, 120].map(val => (
                <button
                  key={val}
                  type="button"
                  // Nút gợi ý: click để set nhanh giá trị
                  onClick={() =>
                    setConfig(prev => ({
                      ...prev,
                      checkinAllowedBeforeStartMinutes: val
                    }))
                  }
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    config.checkinAllowedBeforeStartMinutes === val
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                  }`}
                >
                  {val} phút
                </button>
              ))}
            </div>
          </div>

          {/* minMinutesAfterStart - Check-out */}
          <div className="border border-purple-200 bg-purple-50/30 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <label className="block text-lg font-semibold text-gray-900">
                Thời gian tối thiểu sau khi sự kiện bắt đầu để Check-out (phút)
              </label>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Số phút tối thiểu sau khi sự kiện bắt đầu mà người dùng mới có thể
              check-out. Giá trị từ 0 đến 600 phút (10 giờ).
            </p>

            <div className="flex items-center gap-4">
              <input
                type="number"
                name="minMinutesAfterStart"
                value={config.minMinutesAfterStart}
                onChange={handleChange}
                min="0"
                max="600"
                className="w-32 px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center text-lg font-medium"
              />
              <span className="text-gray-600">phút sau khi bắt đầu</span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-400">Gợi ý:</span>
              {[15, 30, 60, 120].map(val => (
                <button
                  key={val}
                  type="button"
                  // Nút gợi ý: click để set nhanh giá trị
                  onClick={() =>
                    setConfig(prev => ({ ...prev, minMinutesAfterStart: val }))
                  }
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    config.minMinutesAfterStart === val
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                  }`}
                >
                  {val} phút
                </button>
              ))}
            </div>
          </div>

          {/* Info box: giải thích ý nghĩa cấu hình */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Hướng dẫn</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></span>
                <span>
                  <strong>Check-in</strong>: Người dùng có thể check-in trước
                  thời gian bắt đầu sự kiện theo số phút đã cấu hình
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></span>
                <span>
                  <strong>Check-out</strong>: Người dùng chỉ có thể check-out
                  sau khi sự kiện đã bắt đầu được số phút đã cấu hình
                </span>
              </li>
              <li className="mt-2 pt-2 border-t border-blue-200">
                <strong>Ví dụ:</strong> Sự kiện bắt đầu lúc 14:00
                <ul className="ml-4 mt-1">
                  <li>• Check-in = 60 phút → Có thể check-in từ 13:00</li>
                  <li>• Check-out = 30 phút → Có thể check-out từ 14:30</li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Save button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
