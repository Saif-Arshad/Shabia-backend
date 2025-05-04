const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const groupController = {
    createGroup: async (req, res) => {
        try {
            const { name, location1, location2, adminId } = req.body;
            if (!name || !location1 || !location2) {
                return res.status(400).json({ message: 'name, location1 and location2 are required.' });
            }
            const newGroup = await prisma.groups.create({
                data: { name, location1, location2, adminId },
            });
            res.status(201).json(newGroup);
        } catch (err) {
            console.error('Error in createGroup:', err);
            res.status(500).json({ message: 'Server error while creating group.' });
        }
    },

    getAllGroups: async (req, res) => {
        try {
            const groups = await prisma.groups.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    GroupParticipant: true,
                    admin: true
                }
            });
            res.json(groups);
        } catch (err) {
            console.error('Error in getAllGroups:', err);
            res.status(500).json({ message: 'Server error while fetching groups.' });
        }
    },
    toggleMembership: async (req, res) => {
        try {
            const groupId = parseInt(req.params.groupId, 10);
            const userId = parseInt(req.body.userId, 10);

            const group = await prisma.groups.findUnique({ where: { id: groupId } });
            if (!group) {
                return res.status(404).json({ message: 'Group not found.' });
            }

            const existing = await prisma.groupParticipant.findFirst({
                where: { groupId, userId }
            });

            if (existing) {
                await prisma.groupParticipant.delete({ where: { id: existing.id } });
                return res.json({ message: 'Left the group.' });
            } else {
                const participant = await prisma.groupParticipant.create({
                    data: { groupId, userId }
                });
                return res.status(201).json(participant);
            }
        } catch (err) {
            console.error('Error in toggleMembership:', err);
            res.status(500).json({ message: 'Server error while toggling membership.' });
        }
    },
    getGroupById: async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            const group = await prisma.groups.findUnique({
                where: { id },
                include: {
                    Messages: {
                        include: { user: true },
                    }, GroupParticipant: true, admin: true
                },
            });
            if (!group) {
                return res.status(404).json({ message: 'Group not found.' });
            }
            res.json(group);
        } catch (err) {
            console.error('Error in getGroupById:', err);
            res.status(500).json({ message: 'Server error while fetching group.' });
        }
    },

    updateGroup: async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            const { name, location1, location2 } = req.body;
            const existing = await prisma.groups.findUnique({ where: { id } });
            if (!existing) {
                return res.status(404).json({ message: 'Group not found.' });
            }

            const updated = await prisma.groups.update({
                where: { id },
                data: {
                    name: name ?? existing.name,
                    location1: location1 ?? existing.location1,
                    location2: location2 ?? existing.location2,
                },
            });

            res.json(updated);
        } catch (err) {
            console.error('Error in updateGroup:', err);
            res.status(500).json({ message: 'Server error while updating group.' });
        }
    },

    deleteGroup: async (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);

            const existing = await prisma.groups.findUnique({ where: { id } });
            if (!existing) {
                return res.status(404).json({ message: 'Group not found.' });
            }

            // 1) delete all messages in that group
            await prisma.messages.deleteMany({
                where: { groupId: id },
            });

            // 2) delete all group-participant links
            await prisma.groupParticipant.deleteMany({
                where: { groupId: id },
            });

            // 3) now you can delete the group itself
            await prisma.groups.delete({ where: { id } });

            return res.json({ message: 'Group deleted successfully.' });
        } catch (err) {
            console.error('Error in deleteGroup:', err);
            return res.status(500).json({ message: 'Server error while deleting group.' });
        }
    },

};

module.exports = groupController;
