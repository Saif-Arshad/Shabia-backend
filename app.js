require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const groupsRouter = require('./routes/group.routes');

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
                    groupId: Number(data.groupId)
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
app.use('/posts', postRoutes);
app.use('/groups', groupsRouter);
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
