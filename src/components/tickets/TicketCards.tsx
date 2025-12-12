/**
 * Ticket Selection Card Components
 * Reusable UI components for ticket selection
 */
import React from 'react'

type Ticket = {
  categoryTicketId: number
  name: string
  price: number
  maxQuantity: number
  status: string
  description?: string
}

interface TicketCardProps {
  ticket: Ticket
  onSelect: (ticket: Ticket) => void
}

export function VIPTicketCard({ ticket, onSelect }: TicketCardProps) {
  return (
    <button
      onClick={() => onSelect(ticket)}
      className="w-full text-left p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-yellow-700">⭐ VIP</span>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            ticket.status === 'ACTIVE'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {ticket.status === 'ACTIVE' ? 'Có sẵn' : 'Hết vé'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{ticket.description || 'Vé VIP'}</p>
      <p className="text-2xl font-bold text-yellow-800">
        {ticket.price.toLocaleString('vi-VN')} VNĐ
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Còn lại: {ticket.maxQuantity} vé
      </p>
    </button>
  )
}

export function StandardTicketCard({ ticket, onSelect }: TicketCardProps) {
  return (
    <button
      onClick={() => onSelect(ticket)}
      className="w-full text-left p-4 bg-white border-2 border-gray-300 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-gray-700">🎫 Standard</span>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            ticket.status === 'ACTIVE'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {ticket.status === 'ACTIVE' ? 'Có sẵn' : 'Hết vé'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        {ticket.description || 'Vé thường'}
      </p>
      <p className="text-2xl font-bold text-gray-800">
        {ticket.price.toLocaleString('vi-VN')} VNĐ
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Còn lại: {ticket.maxQuantity} vé
      </p>
    </button>
  )
}
