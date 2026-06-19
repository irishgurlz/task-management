import prisma from "../lib/prisma.js";

export const createProject = async (req, res) => {
    const { name, description } = req.body

    if (!name || !description) {
        return res.status(400).json({
            message: "Semua field harus diisi"
        })
    }
    else {
        try {
            let project = await prisma.project.create({
                data: {
                    name,
                    description,
                    created_by: req.user.id
                }
            })
            return res.status(201).json({
                message: "Project berhasil dibuat",
                project
            })
        } catch (error) {
            return res.status(500).json({
                error: error.message
            })
        }
    }
}

export const allProject = async (req, res) => {
    try {
        const dataProject = await prisma.project.findMany()

        return res.status(200).json({
            message: "Tampil Semua Project",
            projects: dataProject
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export const singleProject = async (req, res) => {
    const idParam = req.params.id
    try {
        const dataProject = await prisma.project.findUnique({
            where: {
                id: Number(idParam)
            }
        });

        if (!dataProject) {
            return res.status(404).json({
                message: "Project tidak ditemukan"
            })
        }
        return res.status(200).json({
            message: "Detail data project",
            project: dataProject
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export const updateProject = async (req, res) => {
    const idParam = req.params.id
    const { name, description } = req.body

    const data = {}

    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description

    try {
        const project = await prisma.project.findUnique({
            where: {
                id: Number(idParam)
            }
        })

        if (!project) {
            return res.status(404).json({
                message: "project tidak ditemukan"
            })
        }

        const updatedProject = await prisma.project.update({
            where: {
                id: Number(idParam)
            },
            data
        })

        return res.status(200).json({
            message: "Project berhasil diupdate",
            project: updatedProject
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

export const deleteProject = async (req, res) => {
    const idParam = req.params.id
    try {
        const project = await prisma.project.findUnique({
            where: {
                id:  Number(idParam)
            }
        })

        if (!project) {
            return res.status(404).json({
                message: "project tidak ditemukan"
            })
        }
        await prisma.project.delete({
            where: {
                id:  Number(idParam)
            }
        })

        return res.status(200).json({
            message: "Project berhasil dihapus"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

export const getProjectTasks = async (req, res) => {
    const projectId = Number(req.params.id)

    try {
        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            },
            include: {
                tasks: true
            }
        })

        if (!project) {
            return res.status(404).json({
                message: "Project tidak ditemukan"
            })
        }

        return res.status(200).json({
            tasks: project.tasks
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}