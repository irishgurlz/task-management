import express from 'express'
import { aiCommand} from '../controllers/aiCommand.controller.js'
import authMiddleware from '../middleware/auth.js'
import roleMiddleware from '../middleware/role.js'
import aiRateLimiter from '../middleware/aiRateLimiter.js'

const aiRouter = express.Router()

aiRouter.post('/command', authMiddleware, aiRateLimiter, aiCommand)


export default aiRouter