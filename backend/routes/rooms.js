import express from "express"
import { nanoid } from "nanoid"
import Room from "../models/Room.js"
import { requireAuth } from "../middleware/auth.js"

const router = express.Router()

// POST /api/rooms  -> create a new room, returns unique roomId
router.post("/", requireAuth, async (req, res) => {
    try {
        let roomId
        let attempts = 0

        // Generate a unique roomId, retrying on the rare collision
        do {
            roomId = nanoid(8)
            attempts++
        } while (await Room.exists({ roomId }) && attempts < 5)

        const room = await Room.create({ roomId, ownerId: req.user.id })

        return res.status(201).json({
            success: true,
            room: { roomId: room.roomId, ownerId: room.ownerId, createdAt: room.createdAt },
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Could not create room" })
    }
})

// GET /api/rooms/:roomId -> verify a room exists before joining
router.get("/:roomId", requireAuth, async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId })

        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" })
        }

        return res.json({
            success: true,
            room: { roomId: room.roomId, ownerId: room.ownerId, createdAt: room.createdAt },
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
})

export default router
