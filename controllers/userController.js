const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
    getProfile: async (req, res) => {
        try {
            const userId = req.user.user_id;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            res.json(user);
        } catch (err) {
            console.error('Unexpected error in getProfile:', err);
            res.status(500).json({ message: 'Server error on get profile.' });
        }
    },

    signup: async (req, res) => {
        try {
            const { email, password, name } = req.body;

            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return res.status(400).json({ message: 'User already exists.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            res.status(201).json({ message: 'User created successfully', user: newUser });
        } catch (err) {
            console.error('Unexpected error in signup:', err);
            res.status(500).json({ message: 'Server error on signup.' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await prisma.user.findUnique({
                where: { email },
            });
            console.log("🚀 ~ login: ~ password:", password)
            console.log("🚀 ~ login: ~ email:", email)

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            console.log("🚀 ~ login: ~ isMatch:", isMatch)
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            const { id, email: userEmail, name, createdAt, updatedAt } = user;
            res.json({
                token,
                user: { id, email: userEmail, name, createdAt, updatedAt },
            });
        } catch (err) {
            console.error('Unexpected error in login:', err);
            res.status(500).json({ message: 'Server error on login.' });
        }
    },
};

module.exports = userController;
