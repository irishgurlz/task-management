import express from 'express'
import { createTask, allTask, singleTask, updateTask, deleteTask} from '../controllers/task.controller.js'    
import authMiddleware from '../middleware/auth.js'
import roleMiddleware from '../middleware/role.js'

const taskRouter = express.Router()

taskRouter.post('/', authMiddleware, roleMiddleware('admin', 'user'), createTask)
taskRouter.get('/',  authMiddleware, roleMiddleware('admin', 'user'), allTask)
taskRouter.get('/:id', authMiddleware, roleMiddleware('admin', 'user'), singleTask)
taskRouter.put('/:id', authMiddleware, roleMiddleware('admin', 'user'), updateTask)
taskRouter.delete('/:id', authMiddleware, roleMiddleware('admin', 'user'), deleteTask)

export default taskRouter
