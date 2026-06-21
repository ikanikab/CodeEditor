import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { requireAuth, JWT_SECRET } from "../middleware/auth.js"

const router = express.Router()
const TOKEN_EXPIRY = "7d"

function signToken(user) {
    return jwt.sign(
        { id: user._id.toString(), username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    )
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "username, email and password are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" })
        }

        const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] })
        if (existing) {
            return res.status(409).json({ success: false, message: "Username or email already in use" })
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const user = await User.create({ username, email: email.toLowerCase(), passwordHash })

        const token = signToken(user)
        return res.status(201).json({
            success: true,
            token,
            user: { id: user._id, username: user.username, email: user.email },
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error during registration" })
    }
})

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "email and password are required" })
        }

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const token = signToken(user)
        return res.json({
            success: true,
            token,
            user: { id: user._id, username: user.username, email: user.email },
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error during login" })
    }
})

// POST /api/auth/logout
// JWTs are stateless, so logout is handled client-side by discarding the token.
// This endpoint exists for symmetry / future blacklist support and to give the
// client a clear action to call.
router.post("/logout", requireAuth, async (req, res) => {
    return res.json({ success: true, message: "Logged out" })
})

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
    return res.json({ success: true, user: req.user })
})

export default router
