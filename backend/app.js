const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// load config
dotenv.config();

// DB
const connectDB = require('./config/db');
connectDB();

// init Express
const app = express();
app.use(express.json());
app.use(cors());

// routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/analyzer', require('./routes/analyzerRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

// test routers
app.get('/', (req, res) => {
  res.send('API is running...');
});

function printRoutes(app) {
  function print(path, layer) {
    if (layer.route) {
      layer.route.stack.forEach(print.bind(null, path.concat(layer.route.path)));
    } else if (layer.name === 'router' && layer.handle.stack) {
      layer.handle.stack.forEach(print.bind(null, path.concat(layer.regexp.source.replace("^\\", "").replace("\\/?(?=\\/|$)", ""))));
    } else if (layer.method) {
      console.log('%s %s', layer.method.toUpperCase(), path.concat(layer.regexp.source.replace("^\\", "").replace("\\/?(?=\\/|$)", "")).filter(Boolean).join('/'));
    }
  }

  app._router.stack.forEach(print.bind(null, []));
}


printRoutes(app);

// error handling
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

module.exports = app;