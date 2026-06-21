import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import { api } from "../api.js"

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [joinId, setJoinId] = useState("")
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    setError("")
    setCreating(true)
    try {
      const { room } = await api.createRoom()
      navigate(`/room/${room.roomId}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = (e) => {
    e.preventDefault()
    if (!joinId.trim()) return
    navigate(`/room/${joinId.trim()}`)
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex flex-col gap-6 p-4 items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white text-center">
          Welcome, {user?.username}
        </h1>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Room"}
        </button>

        <form onSubmit={handleJoin} className="flex flex-col gap-2">
          <input
            type="text"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            placeholder="Enter Room ID to join"
            className="p-2 rounded-lg bg-gray-800 text-white"
          />
          <button className="p-2 rounded-lg bg-blue-900 hover:bg-blue-600 text-white font-bold">
            Join Room
          </button>
        </form>

        <button
          onClick={logout}
          className="text-gray-400 text-sm underline self-center"
        >
          Log out
        </button>
      </div>
    </main>
  )
}
