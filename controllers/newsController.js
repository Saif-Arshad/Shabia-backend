const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newsController = {
    createNews: async (req, res) => {
        try {
            const { title, category, description, image, createdBy } = req.body;

            const userExists = await prisma.user.findUnique({
                where: { id: Number(createdBy) }
            });

            if (!userExists) {
                return res.status(404).json({ message: 'User not found for news creation.' });
            }

            const newNews = await prisma.news.create({
                data: {
                    title,
                    category,
                    description,
                    image,
                    createdBy,
                },
                include: {
                    user: true
                }
            });

            res.status(201).json({ message: 'News created successfully', news: newNews });
        } catch (err) {
            console.error('Unexpected error in creating news:', err);
            res.status(500).json({ message: 'Server error on news creation.' });
        }
    },

    getNewsById: async (req, res) => {
        try {
            const { id } = req.params;
            const newsItem = await prisma.news.findUnique({
                where: { id: Number(id) }
            });

            if (!newsItem) {
                return res.status(404).json({ message: 'News item not found.' });
            }

            res.status(200).json({ news: newsItem });
        } catch (err) {
            console.error('Unexpected error in fetching news:', err);
            res.status(500).json({ message: 'Server error on fetching news.' });
        }
    },
    getNewsBycreator: async (req, res) => {
        try {
            const { id } = req.params;
            const newsItem = await prisma.news.findMany({
                where: { createdBy: Number(id) }
            });

            if (!newsItem) {
                return res.status(404).json({ message: 'News item not found.' });
            }

            res.status(200).json({ news: newsItem });
        } catch (err) {
            console.error('Unexpected error in fetching news:', err);
            res.status(500).json({ message: 'Server error on fetching news.' });
        }
    },

    getAllNews: async (req, res) => {
        try {
            const newsItems = await prisma.news.findMany({
                include: { user: true }
            });

            res.status(200).json({ news: newsItems });
        } catch (err) {
            console.error('Unexpected error in fetching all news:', err);
            res.status(500).json({ message: 'Server error on fetching news.' });
        }
    },

    updateNews: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, category, description, image } = req.body;

            const existingNews = await prisma.news.findUnique({
                where: { id: Number(id) }
            });

            if (!existingNews) {
                return res.status(404).json({ message: 'News item not found.' });
            }

            const updatedNews = await prisma.news.update({
                where: { id: Number(id) },
                data: { title, category, description, image },
            });

            res.status(200).json({ message: 'News updated successfully', news: updatedNews });
        } catch (err) {
            console.error('Unexpected error in updating news:', err);
            res.status(500).json({ message: 'Server error on updating news.' });
        }
    },

    deleteNews: async (req, res) => {
        try {
            const { id } = req.params;

            const existingNews = await prisma.news.findUnique({
                where: { id: Number(id) }
            });

            if (!existingNews) {
                return res.status(404).json({ message: 'News item not found.' });
            }

            await prisma.news.delete({
                where: { id: Number(id) }
            });

            res.status(200).json({ message: 'News item deleted successfully' });
        } catch (err) {
            console.error('Unexpected error in deleting news:', err);
            res.status(500).json({ message: 'Server error on deleting news.' });
        }
    },
};

module.exports = newsController;
