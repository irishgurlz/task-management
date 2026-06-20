import prisma from "../lib/prisma.js";
import { parsePrompt } from "../services/gemini.service.js";

export const aiCommand = async (req, res) => {

    const { prompt } = req.body;

    try {

        const aiResponse = await parsePrompt(prompt);
        console.log(aiResponse);
        let parsed;

        try {
            parsed = JSON.parse(aiResponse);
        }
        catch {
            await prisma.auditLog.create({
                data: {
                    user: {
                        connect: {
                            id: req.user.id
                        }
                    },
                    action: "AI_COMMAND",
                    requestPayload: prompt,
                    responsePayload: aiResponse,
                    status: "FAILED",
                    failedReason: "Invalid JSON from AI"
                }
            });
            return res.status(400).json({
                message: "AI mengembalikan format tidak valid"
            });
        }

        const actions = parsed.actions;

        if (!Array.isArray(actions)) {
            return res.status(400).json({
                message: "Format actions tidak valid"
            });
        }
        await prisma.$transaction(async (tx) => {
            for (const action of actions) {
                switch (action.type) {
                    case "CREATE_TASK": {
                        if (!action.data) {
                            throw new Error("Data task tidak ditemukan");
                        }
                        if (!action.data.project_id) {
                            throw new Error("Project ID wajib diisi");
                        }
                        if (!action.data.title) {
                            throw new Error("Judul task wajib diisi");
                        }
                        if (!action.data.assignee_id) {
                            throw new Error("Asignee wajib diisi");
                        }

                        if (action.data.project_id !== undefined) {
                            const project = await tx.project.findUnique({
                                where: {
                                    id: action.data.project_id
                                }
                            });

                            if (!project) {
                                throw new Error(
                                    `Project dengan ID ${action.data.project_id} tidak ditemukan`
                                );
                            }
                        }

                        if (action.data.assignee_id) {
                            const user = await tx.user.findUnique({
                                where: {
                                    id: action.data.assignee_id
                                }
                            });
                            if (!user) {
                                throw new Error(
                                    `User dengan ID ${action.data.assignee_id} tidak ditemukan`
                                );
                            }
                        }
                        console.log(action);
                        await tx.task.create({
                            data: {
                                project: {
                                    connect: {
                                        id: action.data.project_id
                                    }
                                },
                                title: action.data.title,
                                assignee: {
                                    connect: {
                                        id: action.data.assignee_id
                                    }
                                },
                                description:
                                    action.data.description ??
                                    `${action.data.title}`,
                                status: action.data.status,
                                priority: action.data.priority
                            }
                        });
                        break;
                    }

                    case "UPDATE_TASK": {
                        if (!action.data.task_id) {
                            throw new Error("Task ID wajib diisi");
                        }
                        const task = await tx.task.findUnique({
                            where: {
                                id: action.data.task_id
                            }
                        });
                        if (!task) {
                            throw new Error(
                                `Task dengan ID ${action.data.task_id} tidak ditemukan`
                            );
                        }
                        if (action.data.assignee_id) {
                            const user = await tx.user.findUnique({
                                where: {
                                    id: action.data.assignee_id
                                }
                            });
                            if (!user) {
                                throw new Error(
                                    `User dengan ID ${action.data.assignee_id} tidak ditemukan`
                                );
                            }
                        }
                        if (action.data.project_id !== undefined) {
                            const project = await tx.project.findUnique({
                                where: {
                                    id: action.data.project_id
                                }
                            });

                            if (!project) {
                                throw new Error(
                                    `Project dengan ID ${action.data.project_id} tidak ditemukan`
                                );
                            }
                        }

                        const data = {};

                        if (action.data.project_id !== undefined) {
                            data.project = {
                                connect: {
                                    id: action.data.project_id
                                }
                            };
                        }

                        if (action.data.assignee_id !== undefined) {
                            data.assignee = {
                                connect: {
                                    id: action.data.assignee_id
                                }
                            };
                        }

                        if (action.data.title !== undefined) {
                            data.title = action.data.title;
                        }

                        if (action.data.description !== undefined) {
                            data.description = action.data.description;
                        }

                        if (action.data.status !== undefined) {
                            data.status = action.data.status;
                        }

                        if (action.data.priority !== undefined) {
                            data.priority = action.data.priority;
                        }

                        await tx.task.update({
                            where: {
                                id: action.data.task_id
                            },
                            data
                        });
                        break;
                    }
                    case "DELETE_TASK": {
                        if (!action.data.task_id) {
                            throw new Error("Task ID wajib diisi");
                        }
                        const task = await tx.task.findUnique({
                            where: {
                                id: action.data.task_id
                            }
                        });
                        if (!task) {
                            throw new Error(
                                `Task dengan ID ${action.data.task_id} tidak ditemukan`
                            );
                        }
                        await tx.task.delete({
                            where: {
                                id: action.data.task_id
                            }
                        });
                        break;
                    }
                    default:
                        throw new Error(
                            `Aksi tidak diperbolehkan`
                        );
                }
            }
        });

        await prisma.auditLog.create({
            data: {
                action: "AI_COMMAND",
                requestPayload: prompt,
                responsePayload: JSON.stringify(parsed),
                status: "SUCCESS",
                user: {
                    connect: {
                        id: req.user.id
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Command berhasil dieksekusi",
            actions
        });

    }
    catch (err) {

        await prisma.auditLog.create({
            data: {
                user: {
                    connect: {
                        id: req.user.id
                    }
                },
                action: "AI_COMMAND",
                requestPayload: prompt,
                responsePayload: err.message,
                status: "FAILED",
                failedReason: err.message
            }
        });

        return res.status(500).json({
            message: err.message
        });
    }
};