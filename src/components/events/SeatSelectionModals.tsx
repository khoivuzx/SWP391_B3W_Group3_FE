/**
 * Seat Selection Modal Components
 * UI components for seat selection workflow
 */
import React from 'react'

interface ModeSelectionModalProps {
  onFastChoose: () => void
  onManualChoose: () => void
}

export function ModeSelectionModal({ onFastChoose, onManualChoose }: ModeSelectionModalProps) {
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Chọn cách chọn ghế</h3>
      
      <div className="space-y-3">
        <button
          onClick={onFastChoose}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
           Chọn nhanh
        </button>
        <p className="text-xs text-gray-600 text-center">
          Hệ thống tự động chọn ghế ngồi cạnh nhau, gần sân khấu
        </p>
        
        <button
          onClick={onManualChoose}
          className="w-full py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-all"
        >
           Tự chọn ghế
        </button>
        <p className="text-xs text-gray-600 text-center">
          Chọn ghế theo ý bạn trên sơ đồ chỗ ngồi
        </p>
      </div>
    </div>
  )
}

interface QuantityModalProps {
  selectionMode: 'fast' | 'manual'
  numberOfSeats: number
  onNumberChange: (value: number) => void
  onConfirm: () => void
  onBack: () => void
}

export function QuantityModal({ 
  selectionMode, 
  numberOfSeats, 
  onNumberChange, 
  onConfirm, 
  onBack 
}: QuantityModalProps) {
  return (
    <div className="mb-6 p-4 bg-green-50 rounded-xl border-2 border-green-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {selectionMode === 'fast' ? 'Chọn số lượng ghế' : 'Chọn số lượng ghế'}
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bạn muốn đặt bao nhiêu ghế?
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={numberOfSeats}
          onChange={(e) => onNumberChange(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Tối đa 10 ghế mỗi lần đặt</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={onConfirm}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          {selectionMode === 'fast' ? 'Chọn ghế tự động' : 'Bắt đầu chọn ghế'}
        </button>
        
        <button
          onClick={onBack}
          className="w-full py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          ← Quay lại chọn cách khác
        </button>
      </div>
    </div>
  )
}

interface ReservationTimerProps {
  remainingTime: number
}

export function ReservationTimer({ remainingTime }: ReservationTimerProps) {
  if (remainingTime <= 0) return null

  return (
    <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-yellow-800">
           Ghế đã được giữ
        </p>
        <p className="text-lg font-bold text-yellow-900">
          {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
        </p>
      </div>
      <p className="text-xs text-yellow-700 mt-1">
        Hoàn tất đăng ký trước khi hết thời gian
      </p>
    </div>
  )
}

interface ScatteredWarningProps {
  onDismiss: () => void
}

export function ScatteredWarning({ onDismiss }: ScatteredWarningProps) {
  return (
    <div className="mb-4 p-3 bg-orange-50 rounded-lg border-2 border-orange-300">
      <p className="text-sm font-semibold text-orange-800 mb-1">
         Ghế không kề nhau
      </p>
      <p className="text-xs text-orange-700">
        Ghế bạn chọn không liền kề. Bạn vẫn có thể tiếp tục hoặc chọn lại để có ghế ngồi cạnh nhau.
      </p>
      <button
        onClick={onDismiss}
        className="mt-2 text-xs text-orange-600 hover:text-orange-800 font-medium"
      >
        Đã hiểu
      </button>
    </div>
  )
}

interface SelectedSeatsListProps {
  selectedSeats: Array<{ seatId: number; rowNo: string; colNo: string; seatType?: string }>
  numberOfSeats: number
  onRemoveSeat: (seat: any) => void
}

export function SelectedSeatsList({ selectedSeats, numberOfSeats, onRemoveSeat }: SelectedSeatsListProps) {
  if (selectedSeats.length === 0) return null

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-blue-600 font-medium">
          Chỗ ngồi đã chọn ({selectedSeats.length}/{numberOfSeats})
        </p>
        {selectedSeats.length < numberOfSeats && (
          <p className="text-xs text-blue-500">
            Còn thiếu {numberOfSeats - selectedSeats.length} ghế
          </p>
        )}
      </div>
      <div className="space-y-1">
        {selectedSeats.map((seat, index) => (
          <div key={seat.seatId} className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">
              {index + 1}. Hàng {seat.rowNo} - Ghế {seat.colNo}
              {seat.seatType === 'VIP' && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">VIP</span>
              )}
            </p>
            <button
              onClick={() => onRemoveSeat(seat)}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
