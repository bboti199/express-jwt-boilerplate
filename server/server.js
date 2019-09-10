const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

const connectDB = require('./db');
const refresh = require('./middleware/refresh');

connectDB();

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(refresh);

app.use('/api/auth', require('./routes/api/auth'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}...`);
});
