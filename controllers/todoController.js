const todoService = require("../service/todoService");

function getAllTodos(req, res) {
  const { id: owner } = req.user;

  todoService.getAll({ owner }).then((result) => {
    return res.status(200).json(result);
  });
}

function getActiveTodos(req, res) {
  const { id: owner } = req.user;

  todoService.getActive({ owner, isActive: "true" }).then((result) => {
    return res.status(200).json(result);
  });
}

function getCompletedTodos(req, res) {
  const { id: owner } = req.user;

  todoService.getCompleted({ owner, isActive: "false" }).then((result) => {
    return res.status(200).json(result);
  });
}

async function addTodo(req, res) {
  const newTodo = {
    title: req.body.title,
    category: req.body.category,
    type: req.body.type,
    time: req.body.time,
    //       isActive: req.body.isActive ? "true" : "false",
    level: req.body.level,
  };

  const result = await todoService.add({ ...newTodo, owner: req.user.id });

  return res.status(201).json({ result });
}

async function updateTodo(req, res) {
  const { id: owner } = req.user;
  const id = req.params.todoId;
  const todo = {
    title: req.body.title,
    category: req.body.category,
    type: req.body.type,
    time: req.body.time,
    isActive: req.body.isActive ? true : false,
    level: req.body.level,
  };

  const result = await todoService.update(id, owner, { ...todo, owner });

  return result
    ? res.status(201).json({ result })
    : res.status(404).json({ message: `Todo with id:${id} not found` });
}

async function setStatusTodo(req, res) {
  const { id: owner } = req.user;
  const id = req.params.todoId;
  const isActive = { isActive: req.body.isActive };

  if (typeof isActive.isActive !== "boolean") {
    return res.status(400).json({ message: "Missing field isActive" });
  }

  const result = await todoService.updateStatus(id, owner, isActive);

  return result ? res.status(201).json({ result }) : res.status(404).json({ message: `Todo with id:${id} not found` });
}

async function removeTodo(req, res) {
  const { id: owner } = req.user;
  const id = req.params.todoId;
  const removedTodoById = await todoService.remove(id, owner);

  return removedTodoById
    ? res.status(200).json({ message: `Todo with id:${id} removed successfully` })
    : res.status(404).json({ message: `Todo with id:${id} not found` });
}

module.exports = { getAllTodos, getActiveTodos, getCompletedTodos, addTodo, updateTodo, setStatusTodo, removeTodo };
