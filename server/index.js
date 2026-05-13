require('dotenv').config({ path: '../.env' });
const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const session      = require('express-session');
const MongoStore   = require('connect-mongo');
const path         = require('path');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

const PORT   = process.env.PORT   || 5000;
const MONGO  = process.env.MONGODB_URI    || 'mongodb://localhost:27017/amic-visitors';
const SECRET = process.env.SESSION_SECRET || 'change-this-secret';

app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO }),
  cookie: { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 }, // 8 hours
}));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/visitors', require('./routes/visitors'));

// Serve React build in production
const clientBuild = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

async function seedAdmin() {
  const User = require('./models/User');
  const exists = await User.findOne({ username: 'admin' });
  if (!exists) {
    await User.create({ username: 'admin', password: 'Admin@1234' });
    console.log('Default admin created — username: admin / password: Admin@1234');
  }
}

mongoose.connect(MONGO)
  .then(async () => {
    console.log('MongoDB connected');
    await seedAdmin();
    app.listen(PORT, () => console.log(`Server → http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB error:', err));
