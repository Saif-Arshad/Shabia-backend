const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const servicesController = {

    createService: async (req, res) => {
        try {
            const {
                title,
                category,
                description,
                location,
                contactEmail,
                contactPhone,
                image,
                createdBy,
            } = req.body;

            const userExists = await prisma.user.findUnique({
                where: { id: createdBy }
            });

            if (!userExists) {
                return res.status(404).json({ message: 'User not found for service creation.' });
            }

            const newService = await prisma.services.create({
                data: {
                    title,
                    category,
                    description,
                    location,
                    contactEmail,
                    contactPhone,
                    image,
                    createdBy,
                },
            });

            res.status(201).json({ message: 'Service created successfully', service: newService });
        } catch (err) {
            console.error('Unexpected error in creating service:', err);
            res.status(500).json({ message: 'Server error on service creation.' });
        }
    },

    getServiceById: async (req, res) => {
        try {
            const { id } = req.params;
            const service = await prisma.services.findMany({
                where: {
                    createdBy: Number(id)
                },

            });

            if (!service) {
                return res.status(404).json({ message: 'Service not found.' });
            }

            res.status(200).json({ service });
        } catch (err) {
            console.error('Unexpected error in fetching service:', err);
            res.status(500).json({ message: 'Server error on fetching service.' });
        }
    },

    getAllServices: async (req, res) => {
        try {
            const services = await prisma.services.findMany({
                include: {
                    user: true
                }
            });

            res.status(200).json({ services });
        } catch (err) {
            console.error('Unexpected error in fetching services:', err);
            res.status(500).json({ message: 'Server error on fetching services.' });
        }
    },

    updateService: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                title,
                category,
                description,
                location,
                contactEmail,
                contactPhone,
                image,
            } = req.body;

            const existingService = await prisma.services.findUnique({
                where: { id: Number(id) },
            });

            if (!existingService) {
                return res.status(404).json({ message: 'Service not found.' });
            }

            const updatedService = await prisma.services.update({
                where: { id: Number(id) },
                data: {
                    title,
                    category,
                    description,
                    location,
                    contactEmail,
                    contactPhone,
                    image,
                },
            });

            res.status(200).json({ message: 'Service updated successfully', service: updatedService });
        } catch (err) {
            console.error('Unexpected error in updating service:', err);
            res.status(500).json({ message: 'Server error on updating service.' });
        }
    },

    deleteService: async (req, res) => {
        try {
            const { id } = req.params;

            const existingService = await prisma.services.findUnique({
                where: { id: Number(id) },
            });

            if (!existingService) {
                return res.status(404).json({ message: 'Service not found.' });
            }

            await prisma.services.delete({
                where: { id: Number(id) },
            });

            res.status(200).json({ message: 'Service deleted successfully' });
        } catch (err) {
            console.error('Unexpected error in deleting service:', err);
            res.status(500).json({ message: 'Server error on deleting service.' });
        }
    },
};

module.exports = servicesController;
