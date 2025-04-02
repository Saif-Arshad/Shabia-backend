// controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
    getProfile: async (req, res) => {
        try {
            const userId = req.user.user_id;
            const query = 'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?';
            const [rows] = await db.query(query, [userId]);

            if (rows.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }
            res.json(rows[0]);
        } catch (err) {
            console.error('Unexpected error in getProfile:', err);
            res.status(500).json({ message: 'Server error on get profile.' });
        }
    },

    signup: async (req, res) => {
        try {
            const { email, password, name } = req.body;

            const checkQuery = 'SELECT id FROM users WHERE email = ?';
            const [existingUsers] = await db.query(checkQuery, [email]);

            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'User already exists.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertQuery = `
        INSERT INTO users (email, password, name, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
      `;
            const [insertResult] = await db.query(insertQuery, [email, hashedPassword, name]);

            const userId = insertResult.insertId;
            const selectQuery = 'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?';
            const [rows] = await db.query(selectQuery, [userId]);

            if (rows.length === 0) {
                return res.status(404).json({ message: 'User not found after creation.' });
            }

            res.status(201).json({ message: 'User created successfully', user: rows[0] });
        } catch (err) {
            console.error('Unexpected error in signup:', err);
            res.status(500).json({ message: 'Server error on signup.' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const selectQuery = 'SELECT * FROM users WHERE email = ?';
            const [users] = await db.query(selectQuery, [email]);

            if (users.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            const { id, email: userEmail, name, created_at, updated_at } = user;
            res.json({
                token,
                user: { id, email: userEmail, name, created_at, updated_at }
            });
        } catch (err) {
            console.error('Unexpected error in login:', err);
            res.status(500).json({ message: 'Server error on login.' });
        }
    }
};

module.exports = userController;
