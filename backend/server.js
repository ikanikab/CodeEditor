import "dotenv/config"
import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import { createServer } from "http"
import { Server } from "socket.io"
import { YSocketIO } from "y-socket.io/dist/server"
import path from "path"
import { fileURLToPath } from "url"

import { connectDB } from "./db.js"
import authRoutes from "./routes/auth.js"
import roomRoutes from "./routes/rooms.js"
import { requireAuth, JWT_SECRET } from "./middleware/auth.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

const PUBLIC_DIR = path.join(__dirname, "public")
app.use(express.static(PUBLIC_DIR))

// --- API routes ---
app.get("/health", (req, res) => {
    res.status(200).json({ message: "ok", success: true })
})

app.use("/api/auth", authRoutes)
app.use("/api/rooms", requireAuth, roomRoutes)

// --- SPA fallback so /room/:roomId, /login etc. resolve to the frontend ---
app.get(/^\/(?!api|health).*/, (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"))
})

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
})

// Gate every socket connection (including the y-socket.io rooms) behind a
// valid JWT. The frontend sends the token via `socket.handshake.auth.token`.
io.use((socket, next) => {
    const token = socket.handshake.auth?.token

    if (!token) {
        return next(new Error("Authentication required"))
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET)
        socket.data.user = payload
        next()
    } catch (err) {
        next(new Error("Invalid or expired token"))
    }
})

const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()

const PORT = process.env.PORT || 3000

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
})
