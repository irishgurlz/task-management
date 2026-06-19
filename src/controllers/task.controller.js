import prisma from "../lib/prisma.js";

export const createTask = async (req, res) => {
    const { project_id, title, description, assignee_id } = req.body

    if (!project_id || !title || !description || !assignee_id) {
        return res.status(400).json({
            message: "Semua field harus diisi"
        })
    }
    else {
        try {
            let task = await prisma.task.create({
                data: {
                    project_id,
                    title,
                    description,
                    assignee_id
                }
            })
            return res.status(201).json({
                message: "Task berhasil dibuat",
                task
            })
        } catch (error) {
            return res.status(500).json({
                error: error.message
            })
        }
    }
}

export const allTask = async (req, res) => {
    try {
        const dataTask = await prisma.task.findMany()

        return res.status(200).json({
            message: "Tampil Semua Task",
            tasks: dataTask
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export const singleTask = async (req, res) => {
    const idParam = req.params.id
    try {
        const dataTask = await prisma.task.findUnique({
            where: {
                id: Number(idParam)
            }
        });

        if (!dataTask) {
            return res.status(404).json({
                message: "Task tidak ditemukan"
            })
        }
        return res.status(200).json({
            message: "Detail data task",
            task: dataTask
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export const updateTask = async (req, res) => {
    const idParam = req.params.id
    const { project_id, title, description, assignee_id } = req.body

    const data = {}

    if (project_id !== undefined) data.project_id = project_id
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (assignee_id !== undefined) data.assignee_id = assignee_id

    try {
        const task = await prisma.task.findUnique({
            where: {
                id: Number(idParam)
            }
        })

        if (!task) {
            return res.status(404).json({
                message: "task tidak ditemukan"
            })
        }

        const updatedTask = await prisma.task.update({
            where: {
                id: Number(idParam)
            },
            data
        })

        return res.status(200).json({
            message: "Task berhasil diupdate",
            task: updatedTask
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

export const deleteTask = async (req, res) => {
    const idParam = req.params.id
    try {
        const task = await prisma.task.findUnique({
            where: {
                id:  Number(idParam)
            }
        })

        if (!task) {
            return res.status(404).json({
                message: "task tidak ditemukan"
            })
        }
        await prisma.task.delete({
            where: {
                id:  Number(idParam)
            }
        })

        return res.status(200).json({
            message: "Task berhasil dihapus"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}