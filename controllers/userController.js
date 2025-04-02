
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
    // Get the profile for the authenticated user
    getProfile: async (req, res) => {
        try {
            const userId = req.user.user_id;
            const query = 'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?';

            db.query(query, [userId], (error, results) => {
                if (error) {
                    console.error('SQL error in getProfile:', error);
                    return res.status(500).json({ message: 'Server error on get profile.' });
                }
                if (results.length === 0) {
                    return res.status(404).json({ message: 'User not found.' });
                }
                res.json(results[0]);
            });
        } catch (err) {
            console.error('Unexpected error in getProfile:', err);
            res.status(500).json({ message: 'Server error on get profile.' });
        }
    },

    // Signup a new user
    signup: async (req, res) => {
        try {
            const { email, password, name } = req.body;
            const checkQuery = 'SELECT id FROM users WHERE email = ?';
            db.query(checkQuery, [email], async (err, results) => {
                if (err) {
                    console.error('SQL error in signup (check user):', err);
                    return res.status(500).json({ message: 'Server error on signup.' });
                }
                if (results.length > 0) {
                    return res.status(400).json({ message: 'User already exists.' });
                }
                const hashedPassword = await bcrypt.hash(password, 10);
                const insertQuery = `
          INSERT INTO users (email, password, name, created_at, updated_at)
          VALUES (?, ?, ?, NOW(), NOW())
        `;
                db.query(insertQuery, [email, hashedPassword, name], (err, results) => {
                    if (err) {
                        console.error('SQL error in signup (insert user):', err);
                        return res.status(500).json({ message: 'Server error on signup.' });
                    }
                    const userId = results.insertId;
                    const selectQuery = 'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?';
                    db.query(selectQuery, [userId], (err, results) => {
                        if (err) {
                            console.error('SQL error in signup (select user):', err);
                            return res.status(500).json({ message: 'Server error on signup.' });
                        }
                        const newUser = results[0];
                        res.status(201).json({ message: 'User created successfully', user: newUser });
                    });
                });
            });
        } catch (err) {
            console.error('Unexpected error in signup:', err);
            res.status(500).json({ message: 'Server error on signup.' });
        }
    },

    // Login an existing user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const selectQuery = 'SELECT * FROM users WHERE email = ?';

            db.query(selectQuery, [email], async (err, results) => {
                if (err) {
                    console.error('SQL error in login:', err);
                    return res.status(500).json({ message: 'Server error on login.' });
                }
                if (results.length === 0) {
                    return res.status(401).json({ message: 'Invalid credentials.' });
                }
                const user = results[0];
                // Compare the provided password with the stored hashed password
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid credentials.' });
                }
                // Generate a JWT token with a 1-hour expiration time
                const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                // Return the token and user details (excluding the password)
                const { id, email, name, created_at, updated_at } = user;
                res.json({
                    token,
                    user: { id, email, name, created_at, updated_at }
                });
            });
        } catch (err) {
            console.error('Unexpected error in login:', err);
            res.status(500).json({ message: 'Server error on login.' });
        }
    }
};

module.exports = userController;
