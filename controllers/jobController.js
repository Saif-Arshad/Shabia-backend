const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const jobController = {
    // Create a new job posting
    createJob: async (req, res) => {
        try {
            const { title, company, location, description, createdBy, category, type, salary } = req.body;

            // Verify that the user exists
            const userExists = await prisma.user.findUnique({
                where: { id: Number(createdBy) }
            });

            if (!userExists) {
                return res.status(404).json({ message: 'User not found for job creation.' });
            }

            const newJob = await prisma.job.create({
                data: {
                    title,
                    company,
                    location,
                    description,
                    createdBy,
                    category,
                    type,
                    salary,
                },
                include: {
                    user: true
                }
            });

            res.status(201).json({ message: 'Job created successfully', job: newJob });
        } catch (err) {
            console.error('Unexpected error in creating job:', err);
            res.status(500).json({ message: 'Server error on job creation.' });
        }
    },

    // Get a specific job by its ID
    getJobById: async (req, res) => {
        try {
            const { id } = req.params;
            const jobItem = await prisma.job.findUnique({
                where: { id: Number(id) },
                include: { user: true }
            });

            if (!jobItem) {
                return res.status(404).json({ message: 'Job item not found.' });
            }

            res.status(200).json({ job: jobItem });
        } catch (err) {
            console.error('Unexpected error in fetching job:', err);
            res.status(500).json({ message: 'Server error on fetching job.' });
        }
    },

    // Get jobs created by a specific user (creator)
    getJobsByCreator: async (req, res) => {
        try {
            const { id } = req.params;
            const jobItems = await prisma.job.findMany({
                where: { createdBy: Number(id) },
                include: { user: true }
            });

            if (!jobItems || jobItems.length === 0) {
                return res.status(404).json({ message: 'No jobs found for this user.' });
            }

            res.status(200).json({ jobs: jobItems });
        } catch (err) {
            console.error('Unexpected error in fetching jobs:', err);
            res.status(500).json({ message: 'Server error on fetching jobs.' });
        }
    },

    // Get all job postings
    getAllJobs: async (req, res) => {
        try {
            const jobItems = await prisma.job.findMany({
                include: { user: true }
            });

            res.status(200).json({ jobs: jobItems });
        } catch (err) {
            console.error('Unexpected error in fetching all jobs:', err);
            res.status(500).json({ message: 'Server error on fetching jobs.' });
        }
    },

    // Update a job posting by its ID
    updateJob: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, company, location, description, category, type, salary } = req.body;

            // Check if the job exists
            const existingJob = await prisma.job.findUnique({
                where: { id: Number(id) }
            });

            if (!existingJob) {
                return res.status(404).json({ message: 'Job item not found.' });
            }

            const updatedJob = await prisma.job.update({
                where: { id: Number(id) },
                data: { title, company, location, description, category, type, salary },
            });

            res.status(200).json({ message: 'Job updated successfully', job: updatedJob });
        } catch (err) {
            console.error('Unexpected error in updating job:', err);
            res.status(500).json({ message: 'Server error on updating job.' });
        }
    },

    // Delete a job posting by its ID
    deleteJob: async (req, res) => {
        try {
            const { id } = req.params;

            // Check if the job exists
            const existingJob = await prisma.job.findUnique({
                where: { id: Number(id) }
            });

            if (!existingJob) {
                return res.status(404).json({ message: 'Job item not found.' });
            }

            await prisma.job.delete({
                where: { id: Number(id) }
            });

            res.status(200).json({ message: 'Job item deleted successfully' });
        } catch (err) {
            console.error('Unexpected error in deleting job:', err);
            res.status(500).json({ message: 'Server error on deleting job.' });
        }
    },
};

module.exports = jobController;
