import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminModules from './components/admin/AdminModules'
import Profile from './components/Profile'
import { User } from './types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/" 
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            user ? (
              <Profile user={user} onUserUpdate={setUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            user && (user.tipo === 'admin' || user.tipo === 'revendedor') ? (
              <Routes>
                <Route path="dashboard" element={<AdminDashboard user={user} />} />
                <Route path="modulos" element={<AdminModules user={user} />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            user && (user.tipo === 'admin' || user.tipo === 'revendedor') ? (
              <Routes>
                <Route path="dashboard" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
                <Route path="modulos" element={<AdminModules user={user} onLogout={handleLogout} />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
