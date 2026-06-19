import express from 'express'
import rateLimit from "express-rate-limit";
import { register} from '../controllers/auth.controller.js'    
import authMiddleware from '../middleware/auth.js'

const userRouter = express.Router()

userRouter.post('/register', register)
export default userRouter
