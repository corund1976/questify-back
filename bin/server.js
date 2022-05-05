const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require('dotenv').config();
const app = require('../app');

const PORT = process.env.PORT || 3000;
const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_HOST, MONGODB_DATABASE } = process.env;
const DB_HOST_REMOTE = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}?retryWrites=true&w=majority` || 'mongodb+srv://corund:corund123456@cluster0.zeqag.mongodb.net/db-questify?retryWrites=true&w=majority';

try {
  const session = mongoose.connect(DB_HOST_REMOTE);
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
