import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await login(e.target.email.value, e.target.password.value)
      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Log In</h1>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="p-2 rounded-lg bg-gray-800 text-white"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="p-2 rounded-lg bg-gray-800 text-white"
        />
        <button
          disabled={submitting}
          className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Log In"}
        </button>

        <p className="text-gray-400 text-sm text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-amber-400">
            Register
          </Link>
        </p>
      </form>
    </main>
  )
}
