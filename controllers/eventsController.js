const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const eventsController = {
    createEvent: async (req, res) => {
        try {
            const {
                title,
                category,
                description,
                image,
                createdBy,
                date,
                startTime,
                endTime,
                location,
            } = req.body;
            console.log(req.body)
            const userExists = await prisma.user.findUnique({
                where: { id: createdBy },
            });

            if (!userExists) {
                return res.status(404).json({ message: 'User not found for event creation.' });
            }

            const newEvent = await prisma.event.create({
                data: {
                    title,
                    category,
                    description,
                    image,
                    createdBy,
                    eventDate: date,
                    startTime,
                    endTime,
                    location,
                },
            });

            res.status(201).json({ message: 'Event created successfully', event: newEvent });
        } catch (err) {
            console.error('Unexpected error in creating event:', err);
            res.status(500).json({ message: 'Server error on event creation.' });
        }
    },
    joinEvent: async (req, res) => {
        try {
            const {
                eventId,
                userId,

            } = req.body;
            console.log(req.body)
            const userExists = await prisma.participant.findFirst({
                where: { eventId: eventId, userId: userId },
            });
            if (userExists) {
                return res.status(404).json({ message: 'You already join this event' });
            }

            const event = await prisma.event.findUnique({
                where: {
                    id: eventId
                }
            })

            if (!event) {
                return res.status(404).json({ message: 'Event not exist' });
            }
            if (event.createdBy == userId) {
                return res.status(404).json({ message: 'You cannot join your own event' });

            }
            const newEvent = await prisma.participant.create({
                data: {
                    eventId,
                    userId,
                },
            });

            res.status(201).json({ message: 'Event created successfully', event: newEvent });
        } catch (err) {
            console.error('Unexpected error in creating event:', err);
            res.status(500).json({ message: 'Server error on event creation.' });
        }
    },

    getEventById: async (req, res) => {
        try {
            const { id } = req.params;
            const event = await prisma.event.findUnique({
                where: { id: Number(id) },
                include: {
                    user: true,
                    participants: true, // Optional: includes the list of participants
                },
            });

            if (!event) {
                return res.status(404).json({ message: 'Event not found.' });
            }

            res.status(200).json({ event });
        } catch (err) {
            console.error('Unexpected error in fetching event:', err);
            res.status(500).json({ message: 'Server error on fetching event.' });
        }
    },

    getMyEvents: async (req, res) => {
        const { id } = req.params
        try {
            const events = await prisma.event.findMany({
                where: {
                    createdBy: Number(id)
                },
                include: {
                    user: true,
                    participants: true,
                },
            });

            res.status(200).json({ events });
        } catch (err) {
            console.error('Unexpected error in fetching events:', err);
            res.status(500).json({ message: 'Server error on fetching events.' });
        }
    },
    getAllEvents: async (req, res) => {
        try {
            const events = await prisma.event.findMany({
                include: {
                    user: true,
                    participants: true,
                },
            });

            res.status(200).json({ events });
        } catch (err) {
            console.error('Unexpected error in fetching events:', err);
            res.status(500).json({ message: 'Server error on fetching events.' });
        }
    },

    updateEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                title,
                category,
                description,
                image,
                eventDate,
                startTime,
                endTime,
                location,
            } = req.body;

            const existingEvent = await prisma.event.findUnique({
                where: { id: Number(id) },
            });

            if (!existingEvent) {
                return res.status(404).json({ message: 'Event not found.' });
            }

            const updatedEvent = await prisma.event.update({
                where: { id: Number(id) },
                data: {
                    title,
                    category,
                    description,
                    image,
                    eventDate,
                    startTime,
                    endTime,
                    location,
                },
            });

            res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
        } catch (err) {
            console.error('Unexpected error in updating event:', err);
            res.status(500).json({ message: 'Server error on updating event.' });
        }
    },

    deleteEvent: async (req, res) => {
        try {
            const { id } = req.params;

            const existingEvent = await prisma.event.findUnique({
                where: { id: Number(id) },
            });

            if (!existingEvent) {
                return res.status(404).json({ message: 'Event not found.' });
            }

            await prisma.event.delete({
                where: { id: Number(id) },
            });

            res.status(200).json({ message: 'Event deleted successfully' });
        } catch (err) {
            console.error('Unexpected error in deleting event:', err);
            res.status(500).json({ message: 'Server error on deleting event.' });
        }
    },
};

module.exports = eventsController;
