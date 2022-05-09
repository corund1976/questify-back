const express = require('express');
const router = express.Router();

const { todoValidation } = require('../middlewares/validation');
const userAuthorization = require('../middlewares/userAuthorization');
const todosController = require('../controllers/todoController');

router.get('/', function (req, res, next) { res.send('Please use /active or  /completed or /all to get appropriate set of cards') });

router.get('/all', userAuthorization, todosController.getAllTodos);
router.get('/active', userAuthorization, todosController.getActiveTodos);
router.get('/completed', userAuthorization, todosController.getCompletedTodos);

router.post('/add', userAuthorization, todoValidation, todosController.addTodo);
router.put('/update/:todoId', userAuthorization, todoValidation, todosController.updateTodo);
router.patch('/status/:todoId', userAuthorization, todosController.setStatusTodo);
router.delete('/remove/:todoId', userAuthorization, todosController.removeTodo);

module.exports = router;
