import express from 'express'
import rateLimit from "express-rate-limit";
import { register, login} from '../controllers/auth.controller.js'    
import authMiddleware from '../middleware/auth.js'

const userRouter = express.Router()

userRouter.post('/register', register)
userRouter.post('/login', login)

export default userRouter
