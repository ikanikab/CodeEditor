import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"
import { useAuth } from "../context/AuthContext.jsx"
import { api } from "../api.js"

export default function RoomEditor() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const editorRef = useRef(null)
  const [users, setUsers] = useState([])
  const [language, setLanguage] = useState("javascript")
  const [status, setStatus] = useState("checking") // checking | ok | not-found | error

  //Creating Shared Document
  const ydoc = useMemo(() => new Y.Doc(), [])
  //Creating Shared Text- All code gets stored here
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])
  const ySettings = useMemo(() => ydoc.getMap("settings"), [ydoc])

  // Verify the room actually exists before connecting
  useEffect(() => {
    let cancelled = false
    setStatus("checking")

    api.getRoom(roomId)
      .then(() => { if (!cancelled) setStatus("ok") })
      .catch(() => { if (!cancelled) setStatus("not-found") })

    return () => { cancelled = true }
  }, [roomId])

  useEffect(() => {
    if (!ySettings.get("language")) {
      ySettings.set("language", "javascript")
    }
  }, [ySettings])

  const handleMount = (editor) => {
    editorRef.current = editor
    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
    )
  }

  useEffect(() => {
    if (status !== "ok" || !user) return

    const token = api.getToken()
    const provider = new SocketIOProvider("/", roomId, ydoc, {
      autoConnect: true,
      auth: { token },
    })

    provider.awareness.setLocalStateField("user", { username: user.username })

    const syncUsers = () => {
      const states = Array.from(provider.awareness.getStates().values())
      setUsers(states.filter((s) => s.user && s.user.username).map((s) => s.user))
    }

    syncUsers()
    provider.awareness.on("change", syncUsers)

    function handleBeforeUnload() {
      provider.awareness.setLocalStateField("user", null)
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      provider.disconnect()
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [status, user, roomId, ydoc])

  useEffect(() => {
    const updateLanguage = () => {
      const sharedLanguage = ySettings.get("language")
      if (sharedLanguage) setLanguage(sharedLanguage)
    }

    updateLanguage()
    ySettings.observe(updateLanguage)
    return () => ySettings.unobserve(updateLanguage)
  }, [ySettings])

  if (status === "checking") {
    return (
      <main className="h-screen w-full bg-gray-950 flex items-center justify-center text-white">
        Checking room...
      </main>
    )
  }

  if (status === "not-found") {
    return (
      <main className="h-screen w-full bg-gray-950 flex flex-col gap-4 items-center justify-center text-white">
        <p>Room "{roomId}" doesn't exist.</p>
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
        >
          Back home
        </button>
      </main>
    )
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/5 bg-slate-900 rounded-lg flex flex-col">
        <h2 className="text-2xl font-bold p-3 border-b border-gray-300 text-yellow-500">
          Users ({users.length})
        </h2>
        <ul className="p-4">
          {users.map((u, index) => (
            <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">
              {u.username}
            </li>
          ))}
        </ul>

        <div className="p-4 border-t border-gray-700 mt-auto">
          <p className="text-gray-300 text-xl mb-3 font-bold">
            Room: <span className="font-semibold">{roomId}</span>
          </p>

          <button
            onClick={() => {
              const url = `${window.location.origin}/room/${roomId}`
              navigator.clipboard.writeText(url)
              alert("Room link copied!")
            }}
            className="w-full bg-blue-900 hover:bg-blue-600 text-white py-2 rounded mb-2"
          >
            Copy Room Link
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded"
          >
            Leave Room
          </button>
        </div>
      </aside>

      <section className="w-4/5 bg-neutral-800 rounded-lg flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-blue-200">Code Editor</h2>

          <div className="flex items-center gap-2">
            <span className="text-white font-medium">Language:</span>
            <select
              value={language}
              onChange={(e) => ySettings.set("language", e.target.value)}
              className="bg-slate-800 text-white px-3 py-1 rounded"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="c">C</option>
            </select>
          </div>
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            defaultValue="// write code"
            theme="vs-dark"
            onMount={handleMount}
          />
        </div>
      </section>
    </main>
  )
}
