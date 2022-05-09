const express = require('express');
require('dotenv').config();
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const authErrorHandler = require('./middlewares/authErrorHandler');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const todosRouter = require('./routes/todos');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.enable('trust proxy');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: [
    process.env.API_URL,
    process.env.CLIENT_URL,
  ],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'Origin',
    'X-Requested-With',
    'Authorization',
    'Set-Cookie',
    'update',
    'hrmt',
  ],
}));

app.use('/', indexRouter);
app.use('/api/users', authRouter);
app.use(authErrorHandler);

app.use('/api/todos', todosRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
