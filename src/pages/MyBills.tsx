import { useEffect, useState } from 'react'
import { FileText, CreditCard } from 'lucide-react'

type Bill = {
  id: string
  createdAt: string
  totalAmount: number
  status: 'PENDING' | 'PAID' | 'CANCELED'
}

export default function MyBills() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        const res = await fetch('/api/payment/my-bills', {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': '1'
          },
          credentials: 'include'
        })

        const data = await res.json()
        console.log('JSON BE trả về:', data)

        const mapped: Bill[] = data.map((b: any) => ({
          id: b.billId?.toString(),
          createdAt: b.createdAt,
          totalAmount: Number(b.totalAmount),
          // 🔥 FIX: lấy từ paymentStatus, không phải status
          status: b.paymentStatus
        }))

        setBills(mapped)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBills()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hóa đơn của tôi</h1>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          Đang tải hóa đơn...
        </div>
      )}

      {!loading && error && <div className="text-red-600">{error}</div>}

      {!loading && !error && bills.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  Mã hóa đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map(bill => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    #{bill.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(bill.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    {bill.totalAmount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${
                          bill.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : bill.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                    >
                      <CreditCard className="w-3 h-3 mr-1" />
                      {bill.status === 'PAID'
                        ? 'Đã thanh toán'
                        : bill.status === 'PENDING'
                        ? 'Chờ thanh toán'
                        : 'Đã hủy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
