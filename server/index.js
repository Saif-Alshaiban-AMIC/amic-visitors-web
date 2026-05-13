require('dotenv').config({ path: '../.env' });
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/visitors', require('./routes/visitors'));

// Serve React build in production
const clientBuild = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

const PORT  = process.env.PORT  || 5000;
const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/amic-visitors';

mongoose.connect(MONGO)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server → http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB error:', err));
