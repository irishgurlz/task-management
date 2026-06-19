import express from 'express'
import { createProject, allProject, singleProject, updateProject, deleteProject, getProjectTasks} from '../controllers/project.controller.js'    
import authMiddleware from '../middleware/auth.js'
import roleMiddleware from '../middleware/role.js'

const projectRouter = express.Router()

projectRouter.post('/', authMiddleware, roleMiddleware('admin'), createProject)
projectRouter.get('/',  authMiddleware, roleMiddleware('admin', 'user'), allProject)
projectRouter.get('/:id', authMiddleware, roleMiddleware('admin'), singleProject)
projectRouter.put('/:id', authMiddleware, roleMiddleware('admin'), updateProject)
projectRouter.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteProject)
projectRouter.get('/:id/tasks', authMiddleware, roleMiddleware('admin', 'user'), getProjectTasks)

export default projectRouter
