require('dotenv').config();
const express = require('express');
const http = require('http'); // Added: required to create an HTTP server
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client"); // Added: initializing Prisma
const prisma = new PrismaClient(); // Initialize prisma

const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/ServiceROutes');
const newsRoutes = require('./routes/newsRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("sendMessage", async (data) => {
        try {
            const newMessage = await prisma.messages.create({
                data: {
                    createdBy: data.createdBy,
                    message: data.message,
                },
                include: {
                    user: true,
                },
            });

            io.emit("newMessage", newMessage);
        } catch (error) {
            console.error("Error saving message:", error);
            socket.emit("errorMessage", "Failed to save message");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

app.get('/', (req, res) => {
    res.send('Welcome to Shabia Backend!');
});

app.use('/user', userRoutes);
app.use('/service', serviceRoutes);
app.use('/news', newsRoutes);
app.use('/events', eventsRoutes);
app.use('/jobs', jobRoutes);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
