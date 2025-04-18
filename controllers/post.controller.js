const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const postsController = {

    createPost: async (req, res) => {
        try {
            const {
                type, title, category, description, location1, location2,
                image, eventDate, startTime, endTime, jobType, contactEmail,
                contactPhone, company, salary, createdBy
            } = req.body;

            const userExists = await prisma.user.findUnique({ where: { id: createdBy } });

            if (!userExists) {
                return res.status(404).json({ message: 'User not found for post creation.' });
            }

            const newPost = await prisma.posts.create({
                data: {
                    type,
                    title,
                    category,
                    description,
                    location1,
                    location2,
                    image,
                    eventDate,
                    startTime,
                    endTime,
                    jobType,
                    contactEmail,
                    contactPhone,
                    company,
                    salary,
                    createdBy
                }
            });

            res.status(201).json({ message: 'Post created successfully', post: newPost });
        } catch (err) {
            console.error('Error creating post:', err);
            res.status(500).json({ message: 'Server error on post creation.' });
        }
    },

    getPostById: async (req, res) => {
        try {
            const { id } = req.params;
            const post = await prisma.posts.findUnique({
                where: { id: Number(id) },
                include: { user: true, participants: true }
            });
            console.log("🚀 ~ getPostById: ~ id:", id)

            if (!post) {
                return res.status(404).json({ message: 'Post not found.' });
            }

            res.status(200).json({ post });
        } catch (err) {
            console.error('Error fetching post:', err);
            res.status(500).json({ message: 'Server error on fetching post.' });
        }
    },
    getMyPost: async (req, res) => {
        try {
            const { id } = req.params;
            const whereClause = { createdBy: Number(id) };
            if (req.query.type) {
                whereClause.type = req.query.type;
            }
            const posts = await prisma.posts.findMany({
                where: whereClause,
                include: { user: true, participants: true }
            });
            res.status(200).json({ posts });
        } catch (err) {
            console.error('Error fetching posts:', err);
            res.status(500).json({ message: 'Server error on fetching posts.' });
        }
    },
    getAllPosts: async (req, res) => {
        try {
            const posts = await prisma.posts.findMany({
                include: { user: true, participants: true }
            });

            res.status(200).json({ posts });
        } catch (err) {
            console.error('Error fetching posts:', err);
            res.status(500).json({ message: 'Server error on fetching posts.' });
        }
    },

    updatePost: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const existingPost = await prisma.posts.findUnique({ where: { id: Number(id) } });

            if (!existingPost) {
                return res.status(404).json({ message: 'Post not found.' });
            }

            const updatedPost = await prisma.posts.update({
                where: { id: Number(id) },
                data: updateData
            });

            res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
        } catch (err) {
            console.error('Error updating post:', err);
            res.status(500).json({ message: 'Server error on updating post.' });
        }
    },


    deletePost: async (req, res) => {
        try {
            const { id } = req.params;

            const existingPost = await prisma.posts.findUnique({ where: { id: Number(id) } });

            if (!existingPost) {
                return res.status(404).json({ message: 'Post not found.' });
            }

            await prisma.posts.delete({ where: { id: Number(id) } });

            res.status(200).json({ message: 'Post deleted successfully' });
        } catch (err) {
            console.error('Error deleting post:', err);
            res.status(500).json({ message: 'Server error on deleting post.' });
        }
    },

    joinEvent: async (req, res) => {
        try {
            const { postId, userId } = req.body;
            console.log("🚀 ~ joinEvent: ~ postId:", postId)
            console.log("🚀 ~ joinEvent: ~ userId:", userId)

            const existingParticipation = await prisma.participant.findFirst({
                where: { postId, userId }
            });

            if (existingParticipation) {
                return res.status(400).json({ message: 'You have already joined this event.' });
            }

            const event = await prisma.posts.findUnique({
                where: { id: postId, type: 'EVENT' }
            });

            if (!event) {
                return res.status(404).json({ message: 'Event not found.' });
            }

            if (event.createdBy === userId) {
                return res.status(400).json({ message: 'Cannot join your own event.' });
            }

            const participation = await prisma.participant.create({
                data: { postId, userId }
            });

            res.status(201).json({ message: 'Joined event successfully', participation });
        } catch (err) {
            console.error('Error joining event:', err);
            res.status(500).json({ message: 'Server error on joining event.' });
        }
    }
};

module.exports = postsController;