const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')

function generateOTP(length = 6) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}
async function sendOTPEmail(email, otp, subject = "Email Verification OTP") {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Shabia" <${process.env.MAIL_USER}>`,
        to: email,
        subject,
        html: `<p>Your OTP is: <strong>${otp}</strong></p>
           <p>Please use this OTP to verify your email address.</p>`,
    };

    await transporter.sendMail(mailOptions);
}

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
    getMessages: async (req, res) => {
        try {
            const messages = await prisma.messages.findMany({
                include: {
                    user: true
                },
            });


            res.json(messages);
        } catch (err) {
            console.error('Unexpected error in getProfile:', err);
            res.status(500).json({ message: 'Server error on get profile.' });
        }
    },

    signup: async (req, res) => {
        try {
            const { email, password, name, location, userType } = req.body;

            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return res.status(400).json({ message: 'User already exists.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);


            const otp = generateOTP(6);
            console.log("🚀 ~ signup: ~ otp:", otp)
            await sendOTPEmail(email, otp, "Email Verification OTP");

            const newUser = await prisma.user.create({
                data: {
                    email,
                    latestOtp: otp,
                    Role: userType,
                    password: hashedPassword,
                    name,
                    location

                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    Role: true,
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
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Please Verify your profile ' });
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
                user: { id, email: userEmail, name, createdAt, updatedAt, role: user.Role },
            });
        } catch (err) {
            console.error('Unexpected error in login:', err);
            res.status(500).json({ message: 'Server error on login.' });
        }
    },
    verifyOTP: async (req, res) => {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).json({ success: false, message: "Email and OTP are required." });
            }

            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }
            if (user.isVerified) {
                return res.status(400).json({ success: false, message: "User already verified." });
            }
            if (user.latestOtp !== otp) {
                return res.status(400).json({ success: false, message: "Incorrect OTP." });
            }

            const updatedUser = await prisma.user.update({
                where: { email },
                data: { isVerified: true, latestOtp: null },
            });

            const { password: _, ...userWithoutPassword } = updatedUser;

            return res.status(200).json({
                success: true,
                data: userWithoutPassword,
                message: "Email verified successfully.",
            });
        } catch (error) {
            console.error("Error verifying OTP:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    Role: true,
                    location: true,
                    isVerified: true,
                    createdAt: true,
                }
            });
            console.log("🚀 ~ getAllUsers: ~ users:", users)
            res.json(users);
        } catch (err) {
            console.error('Unexpected error in getAllUsers:', err);
            res.status(500).json({ message: 'Server error while fetching users.' });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = parseInt(id);

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Delete user
            await prisma.user.delete({
                where: { id: userId }
            });

            res.json({ message: 'User deleted successfully' });
        } catch (err) {
            console.error('Unexpected error in deleteUser:', err);
            res.status(500).json({ message: 'Server error while deleting user.' });
        }
    }

};

module.exports = userController;
