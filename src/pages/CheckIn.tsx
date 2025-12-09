import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Html5Qrcode } from 'html5-qrcode'
import { Scan, CheckCircle, XCircle, Search } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function CheckIn() {
  const { user: _user } = useAuth()
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const [scanning, setScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [checkInResult, setCheckInResult] = useState<{
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
            // qrbox hơi lớn một chút cho dễ canh vào khung
            qrbox: { width: 280, height: 280 },
          },
          (decodedText) => {
            processCheckIn(decodedText)
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

  const processCheckIn = async (qrCode: string) => {
    setCheckInResult(null)

    if (!token) {
      setCheckInResult({
        success: false,
        message: 'Bạn cần đăng nhập STAFF/ADMIN để thực hiện check-in.',
      })
      return
    }

    const ticketId = extractTicketId(qrCode)
    if (!ticketId) {
      setCheckInResult({
        success: false,
        message: 'QR không hợp lệ hoặc không đọc được ticketId.',
      })
      return
    }

    try {
      const url = `/api/staff/checkin?ticketId=${encodeURIComponent(
        String(ticketId),
      )}`

      const res = await fetch(url, {
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
          `Check-in thất bại (HTTP ${res.status})`
        setCheckInResult({
          success: false,
          message: msg,
        })
        return
      }

      setCheckInResult({
        success: true,
        message: data.message || 'Check-in thành công',
        registration: {
          ticketId: data.ticketId,
          checkedInAt: data.checkinTime,
        },
      })
    } catch (error) {
      console.error(error)
      setCheckInResult({
        success: false,
        message: 'Lỗi kết nối API',
      })
    }
  }

  const handleManualCheckIn = () => {
    if (manualCode.trim()) {
      processCheckIn(manualCode.trim())
      setManualCode('')
    }
  }

  const resetResult = () => {
    setCheckInResult(null)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Check-in sự kiện
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quét mã QR</h2>

          {!scanning ? (
            <div className="space-y-4">
              <button
                onClick={() => {
                  resetResult()
                  setScanning(true)
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Scan className="w-5 h-5 mr-2" />
                Bắt đầu quét
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleManualCheckIn()
                    }
                  />
                  <button
                    onClick={handleManualCheckIn}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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
                  <div className="relative w-64 h-64 rounded-xl border-2 border-green-400/80">
                    {/* 4 góc nổi bật */}
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-xl" />
                  </div>
                </div>

                {/* Hướng dẫn nhỏ ở dưới */}
                <div className="absolute bottom-4 inset-x-4 bg-black/60 text-white text-sm text-center rounded-lg px-3 py-2">
                  Đưa mã QR vào trong khung xanh và giữ máy ổn định
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
          <h2 className="text-xl font-semibold mb-4">Kết quả check-in</h2>

          {!checkInResult ? (
            <div className="text-center py-12 text-gray-500">
              <Scan className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Chưa có kết quả check-in</p>
              <p className="text-sm mt-2">
                Quét mã QR hoặc nhập mã thủ công để bắt đầu
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {checkInResult.success ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <p className="text-xl font-semibold text-green-600 mb-2">
                    {checkInResult.message}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <p className="text-xl font-semibold text-red-600 mb-2">
                    {checkInResult.message}
                  </p>
                </div>
              )}

              {checkInResult.registration && (
                <div className="border-t pt-4 space-y-3">
                  {checkInResult.registration.ticketId && (
                    <div>
                      <p className="text-sm text-gray-600">Ticket ID:</p>
                      <p className="font-medium">
                        {checkInResult.registration.ticketId}
                      </p>
                    </div>
                  )}

                  {checkInResult.registration.checkedInAt && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Thời gian check-in:
                      </p>
                      <p className="font-medium">
                        {format(
                          new Date(checkInResult.registration.checkedInAt),
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
                className="w-full mt-4 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
              >
                Check-in tiếp theo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
