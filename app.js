require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/ServiceROutes');
const newsRoutes = require('./routes/newsRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Welcome to Shabia Backend!');
});

app.use('/user', userRoutes);
app.use('/service', serviceRoutes );
app.use('/news', newsRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
