const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((user) => user.username === username);

  if (!userExists) return response.status(400).json({ error: 'User not exists!' });

  request.user = userExists;
  request.username = userExists.username;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const id = uuidv4();

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: 'User already exists' });
  }

  const user = {
    id,
    name, 
    username, 
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user, username } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user, username } = request;

  const { title, deadline } = request.body;

  const id = uuidv4();

  const todo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, username } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: 'Todo not exists!' });

  todo.title = title ? title : todo.title;
  todo.deadline = deadline ? new Date(deadline) : todo.deadline;

  const responseTodo = {
    deadline: todo.deadline,
    done: todo.done,
    title: todo.title
  }

  return response.status(200).json(responseTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user, username } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: 'Todo not exists!' });

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, username } = request;
  const { id } = request.params;

  const todo = user.todos.findIndex((todo) => todo.id === id);

  if (todo < 0) return response.status(404).json({ error: 'Todo not exists!' });

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;