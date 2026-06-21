import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "../context/AuthContext.jsx"
import ProtectedRoute from "../context/ProtectedRoute.jsx"
import Login from "../pages/Login.jsx"
import Register from "../pages/Register.jsx"
import Home from "../pages/Home.jsx"
import RoomEditor from "../pages/RoomEditor.jsx"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute>
                <RoomEditor />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
