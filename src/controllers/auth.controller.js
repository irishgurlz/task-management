import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const register = async (req, res) => {
    const { name, email, password, role } = req.body

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email sudah terdaftar"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        });

        res.status(201).json({
            message: "Register berhasil",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role

            },
        })
    } catch (error) {
        res.status(400).json({
            message: "Error validation",
            error: error.message
        })
        console.log(error);
    }
}