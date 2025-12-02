import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login, Register, ResetPassword } from './pages/auth'
import Dashboard from './pages/Dashboard'
import { Events, EventDetail, EventCreate, EventEdit } from './pages/events'
import { MyTickets, TicketDetail } from './pages/tickets'
import { CheckIn, SeatManagement, Reports } from './pages/admin'
import { GuestLanding } from './pages/guest'
import Layout from './components/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/guest" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/guest" element={<GuestLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="events/create" element={<EventCreate />} />
        <Route path="events/:id/edit" element={<EventEdit />} />
        <Route path="my-tickets" element={<MyTickets />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="check-in" element={<CheckIn />} />
        <Route path="seats/:eventId" element={<SeatManagement />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="/" element={<GuestLanding />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App

