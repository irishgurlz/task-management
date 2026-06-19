import express from 'express'
import { aiCommand} from '../controllers/aiCommand.controller.js'    
import authMiddleware from '../middleware/auth.js'
import roleMiddleware from '../middleware/role.js'

const aiRouter = express.Router()

aiRouter.post('/command', authMiddleware, aiCommand)


export default aiRouter
