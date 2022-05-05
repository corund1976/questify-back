const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require('dotenv').config();

const app = require('../app');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

try {
  const session = mongoose.connect(MONGODB_URI);
  session.then((data) => {
    data.connections[0].name &&
      app.listen(PORT, () => {
        const { port, name } = data.connections[0];
        console.log(`Database connection successfully. DB name is ${name} on port ${port}`);
        console.log('PORT', PORT);
      });
  });
} catch (error) {
  console.log('DB connection Error: ');
  process.exit(1);
}

module.exports = mongoose;
