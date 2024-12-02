import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import userRoutes from "./routes/userRoutes.js";

const app = express()

dotenv.config()

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.use('/api/users', userRoutes)

export default app