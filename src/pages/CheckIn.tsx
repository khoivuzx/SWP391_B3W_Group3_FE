import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Html5Qrcode } from 'html5-qrcode'
import { Scan, CheckCircle, XCircle, Search, LogIn, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

type TabType = 'checkin' | 'checkout'

export default function CheckIn() {
  const { user: _user } = useAuth()
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  const [activeTab, setActiveTab] = useState<TabType>('checkin')
  const [scanning, setScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    registration?: any
  } | null>(null)

  useEffect(() => {
    if (scanning && !scannerRef.current) {
      const html5QrCode = new Html5Qrcode('reader')
      scannerRef.current = html5QrCode

      html5QrCode
        .start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 280 },
          },
          (decodedText) => {
            processAction(decodedText)
            stopScanning()
          },
          () => {
            // ignore frame errors
          },
        )
        .catch((err) => {
          console.error('Unable to start scanning', err)
        })
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
        scannerRef.current.clear()
        scannerRef.current = null
      }
    }
  }, [scanning])

  // Stop scanning when tab changes
  useEffect(() => {
    stopScanning()
    setResult(null)
    setManualCode('')
  }, [activeTab])

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setScanning(false)
  }

  const extractTicketId = (code: string): number | null => {
    const trimmed = code.trim()

    const numeric = Number(trimmed)
    if (!Number.isNaN(numeric) && Number.isInteger(numeric) && numeric > 0) {
      return numeric
    }

    const match = trimmed.match(/ticketId=(\d+)/i)
    if (match) {
      return Number(match[1])
    }

    return null
  }

  const processAction = async (qrCode: string) => {
    setResult(null)

    if (!token) {
      setResult({
        success: false,
        message: `Bạn cần đăng nhập STAFF/ADMIN để thực hiện ${activeTab === 'checkin' ? 'check-in' : 'check-out'}.`,
      })
      return
    }

    const ticketId = extractTicketId(qrCode)
    if (!ticketId) {
      setResult({
        success: false,
        message: 'QR không hợp lệ hoặc không đọc được ticketId.',
      })
      return
    }

    try {
      const apiEndpoint = activeTab === 'checkin' 
        ? `/api/staff/checkin?ticketId=${encodeURIComponent(String(ticketId))}`
        : `/api/staff/checkout?ticketCode=${encodeURIComponent(String(ticketId))}`

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json().catch(() => ({} as any))

      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          `${activeTab === 'checkin' ? 'Check-in' : 'Check-out'} thất bại (HTTP ${res.status})`
        setResult({
          success: false,
          message: msg,
        })
        return
      }

      // Handle checkout response (may have results array)
      if (activeTab === 'checkout' && data.results && data.results.length > 0) {
        const firstResult = data.results[0]
        setResult({
          success: data.success || firstResult.success,
          message: data.message || firstResult.message || 'Check-out thành công',
          registration: {
            ticketId: firstResult.ticketId,
            checkedOutAt: firstResult.checkoutTime,
            eventName: firstResult.eventName,
          },
        })
      } else {
        setResult({
          success: true,
          message: data.message || `${activeTab === 'checkin' ? 'Check-in' : 'Check-out'} thành công`,
          registration: {
            ticketId: data.ticketId,
            checkedInAt: data.checkinTime,
            checkedOutAt: data.checkoutTime,
          },
        })
      }
    } catch (error) {
      console.error(error)
      setResult({
        success: false,
        message: 'Lỗi kết nối API',
      })
    }
  }

  const handleManualAction = () => {
    if (manualCode.trim()) {
      processAction(manualCode.trim())
      setManualCode('')
    }
  }

  const resetResult = () => {
    setResult(null)
  }

  const isCheckIn = activeTab === 'checkin'
  const actionLabel = isCheckIn ? 'Check-in' : 'Check-out'

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Check-in / Check-out sự kiện
      </h1>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6 max-w-md">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'checkin'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <LogIn className="w-5 h-5" />
          Check-in
        </button>
        <button
          onClick={() => setActiveTab('checkout')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'checkout'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <LogOut className="w-5 h-5" />
          Check-out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quét mã QR - {actionLabel}</h2>

          {!scanning ? (
            <div className="space-y-4">
              <button
                onClick={() => {
                  resetResult()
                  setScanning(true)
                }}
                className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center text-white ${
                  isCheckIn 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                <Scan className="w-5 h-5 mr-2" />
                Bắt đầu quét {actionLabel}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập mã QR / ID vé thủ công
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Nhập ticketId hoặc nội dung QR"
                    className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                      isCheckIn ? 'focus:ring-blue-500' : 'focus:ring-purple-500'
                    }`}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleManualAction()
                    }
                  />
                  <button
                    onClick={handleManualAction}
                    className="px-4 py-2 text-white rounded-lg bg-gray-600 hover:bg-gray-700"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Khung camera + overlay canh ô quét */}
              <div className="relative bg-black rounded-xl overflow-hidden">
                {/* Video + canvas của html5-qrcode */}
                <div
                  id="reader"
                  className="w-full h-full"
                  style={{ minHeight: 320 }}
                />

                {/* Overlay khung vuông để canh QR */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className={`relative w-64 h-64 rounded-xl border-2 ${
                    isCheckIn ? 'border-green-400/80' : 'border-purple-400/80'
                  }`}>
                    {/* 4 góc nổi bật */}
                    <div className={`absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 rounded-tl-xl ${
                      isCheckIn ? 'border-green-400' : 'border-purple-400'
                    }`} />
                    <div className={`absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 rounded-tr-xl ${
                      isCheckIn ? 'border-green-400' : 'border-purple-400'
                    }`} />
                    <div className={`absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 rounded-bl-xl ${
                      isCheckIn ? 'border-green-400' : 'border-purple-400'
                    }`} />
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 rounded-br-xl ${
                      isCheckIn ? 'border-green-400' : 'border-purple-400'
                    }`} />
                  </div>
                </div>

                {/* Hướng dẫn nhỏ ở dưới */}
                <div className="absolute bottom-4 inset-x-4 bg-black/60 text-white text-sm text-center rounded-lg px-3 py-2">
                  Đưa mã QR vào trong khung và giữ máy ổn định để {actionLabel.toLowerCase()}
                </div>
              </div>

              <button
                onClick={() => {
                  stopScanning()
                  resetResult()
                }}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Dừng quét
              </button>
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Kết quả {actionLabel}</h2>

          {!result ? (
            <div className="text-center py-12 text-gray-500">
              <Scan className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Chưa có kết quả {actionLabel.toLowerCase()}</p>
              <p className="text-sm mt-2">
                Quét mã QR hoặc nhập mã thủ công để bắt đầu
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {result.success ? (
                <div className="text-center py-6">
                  <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${
                    isCheckIn ? 'text-green-500' : 'text-purple-500'
                  }`} />
                  <p className={`text-xl font-semibold mb-2 ${
                    isCheckIn ? 'text-green-600' : 'text-purple-600'
                  }`}>
                    {result.message}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <p className="text-xl font-semibold text-red-600 mb-2">
                    {result.message}
                  </p>
                </div>
              )}

              {result.registration && (
                <div className="border-t pt-4 space-y-3">
                  {result.registration.ticketId && (
                    <div>
                      <p className="text-sm text-gray-600">Ticket ID:</p>
                      <p className="font-medium">
                        {result.registration.ticketId}
                      </p>
                    </div>
                  )}

                  {result.registration.eventName && (
                    <div>
                      <p className="text-sm text-gray-600">Sự kiện:</p>
                      <p className="font-medium">
                        {result.registration.eventName}
                      </p>
                    </div>
                  )}

                  {result.registration.checkedInAt && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Thời gian check-in:
                      </p>
                      <p className="font-medium">
                        {format(
                          new Date(result.registration.checkedInAt),
                          'dd/MM/yyyy HH:mm:ss',
                          { locale: vi },
                        )}
                      </p>
                    </div>
                  )}

                  {result.registration.checkedOutAt && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Thời gian check-out:
                      </p>
                      <p className="font-medium">
                        {format(
                          new Date(result.registration.checkedOutAt),
                          'dd/MM/yyyy HH:mm:ss',
                          { locale: vi },
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={resetResult}
                className="w-full mt-4 text-white py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
              >
                {actionLabel} tiếp theo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className={`mt-6 p-4 rounded-lg border ${
        isCheckIn 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-purple-50 border-purple-200'
      }`}>
        <h3 className={`font-semibold mb-2 ${
          isCheckIn ? 'text-blue-800' : 'text-purple-800'
        }`}>
          Hướng dẫn {actionLabel}
        </h3>
        <ul className={`text-sm space-y-1 ${
          isCheckIn ? 'text-blue-700' : 'text-purple-700'
        }`}>
          {isCheckIn ? (
            <>
              <li>• Quét mã QR trên vé của người tham dự để check-in</li>
              <li>• Hoặc nhập ID vé thủ công nếu không quét được</li>
              <li>• Mỗi vé chỉ có thể check-in một lần</li>
            </>
          ) : (
            <>
              <li>• Quét mã QR trên vé để check-out khi người tham dự rời sự kiện</li>
              <li>• Hoặc nhập ID vé thủ công nếu không quét được</li>
              <li>• Chỉ có thể check-out sau khi đã check-in</li>
              <li>• Check-out chỉ khả dụng sau thời gian quy định (cấu hình hệ thống)</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
