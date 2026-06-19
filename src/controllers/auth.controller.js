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

export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            message: "Semua field harus diisi"
        })
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            res.status(404).json({
                message: "User tidak ditemukan"
            })
        }

        const matched = await bcrypt.compare(
            password,
            user.password
        );

        if (!matched) {
            return res.status(400).json({
                message: "Email dan Password tidak cocok"
            })
        }

        const token = jwt.sign(
            { id: user.id,
              role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}