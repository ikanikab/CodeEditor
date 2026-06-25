# Prism - Collaborative Code Editor

A real-time collaborative code editor that allows multiple users to write and edit code together with live synchronization, authentication, and shareable rooms.

**Live Demo:** https://prism-code-editor.onrender.com

## Tech Stack

| Layer      | Tech                                  |
|------------|----------------------------------------|
| Frontend   | React, React Router, Tailwind CSS, Monaco Editor |
| Realtime   | Yjs, y-socket.io, Socket.IO            |
| Backend    | Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt |
| Deployment | Docker, Render     


## Features

- **JWT Authentication**
  - Register / Login / Logout
  - Passwords hashed with bcrypt
  - Protected routes (frontend + backend)

- **Room Management**
  - Create a room with one click (auto-generated unique room ID)
  - Join a room via its ID or a shared link
  - Room ownership management with MongoDB

- **Shareable Room Links**
  - "Copy Room Link" button — share `/room/<roomId>` with anyone, no query params needed

- **Live Collaboration**
  - Real-time code sync powered by Yjs CRDT + Socket.IO
  - Live list of users currently in the room
  - Shared language selector (synced across all participants)
  - Monaco Editor with syntax highlighting

- 🐳 **Dockerized**
  - Single Dockerfile builds frontend + backend into one image
  - `docker-compose.yml` included for local dev with MongoDB
                           |
