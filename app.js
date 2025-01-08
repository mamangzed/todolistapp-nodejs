const express = require('express');
const bodyParser = require('body-parser');
const { registerRoute, loginRoute, checkToken,refreshRoute } = require('./routes/auth');
const todoRoutes = require('./routes/todo');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use('/auth', registerRoute);
app.use('/auth', loginRoute);
app.use('/auth',refreshRoute);
app.use('/todo', checkToken, todoRoutes);

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
