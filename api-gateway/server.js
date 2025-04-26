const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const JWT_SECRET = 'your_jwt_secret';

app.use(bodyParser.json());
app.use(cors());

const USER_SERVICE_URL = 'http://user-service:8000';
const BOARD_SERVICE_URL = 'http://board-service:8001';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    req.user_id = decoded.user_id;
    next();
  });
}

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = hashPassword(password);

  try {
    const response = await axios.post(`${USER_SERVICE_URL}/user/`, {
      username,
      password: hashedPassword
    });

    const { user_id } = response.data;

    const token = jwt.sign({ user_id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = hashPassword(password);

  try {
    const response = await axios.post(`${USER_SERVICE_URL}/login/`, {
      username,
      password: hashedPassword
    });

    const { user_id } = response.data;

    const token = jwt.sign({ user_id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token });
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Login failed' });
  }
});

app.get('/user/me', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/user/${req.user_id}/`);
    res.json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: 'Failed to fetch user info' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users`);
    res.json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: 'Failed to fetch user info' });
  }
});

app.get('/boards', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${BOARD_SERVICE_URL}/board/get/${req.user_id}`);
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.post('/board', authenticateToken, async (req, res) => {
  const { name } = req.body;
  console.log("create board")
  try {
    const response = await axios.post(`${BOARD_SERVICE_URL}/board/`, {
      "name": name,
      "owner_id": req.user_id,
      "members": [req.user_id]
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.post('/board/edit', authenticateToken, async (req, res) => {
  console.log("edit board")
  const { name, boardId} = req.body;

  try {
    const response = await axios.patch(`${BOARD_SERVICE_URL}/board/${boardId}`, {
      "name": name,
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.post('/board/delete', authenticateToken, async (req, res) => {
  const { boardId } = req.body;
  console.log("delete board")
  try {
    const response = await axios.delete(`${BOARD_SERVICE_URL}/board/${boardId}`);
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.post('/board/add-member', authenticateToken, async (req, res) => {
  console.log("add member")
  const { boardId, members } = req.body;

  try {
    const response = await axios.patch(`${BOARD_SERVICE_URL}/board/${boardId}`, {
      "members": members,
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.post('/column/add', authenticateToken, async (req, res) => {
  console.log("add column")
  const { board, name } = req.body;

  try {
    const response = await axios.post(`${BOARD_SERVICE_URL}/column/`, {
      "name": name,
      "board": board
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.post('/column/edit', authenticateToken, async (req, res) => {
  console.log("edit column")
  const { name, columnId} = req.body;

  try {
    const response = await axios.patch(`${BOARD_SERVICE_URL}/column/${columnId}`, {
      "name": name,
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.post('/column/delete', authenticateToken, async (req, res) => {
  const { columnId } = req.body;
  console.log("delete column")
  try {
    const response = await axios.delete(`${BOARD_SERVICE_URL}/column/delete/${columnId}`);
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.post('/task/add', authenticateToken, async (req, res) => {
  const { column, title } = req.body;
  console.log("create task")

  try {
    const response = await axios.post(`${BOARD_SERVICE_URL}/task/`, {
      "column": column,
      "title": title
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.post('/task/edit', authenticateToken, async (req, res) => {
  console.log("edit task")
  const { taskId, title, column } = req.body;

  try {
    const response = await axios.put(`${BOARD_SERVICE_URL}/task/${taskId}`, {
      "title": title,
      "column": column
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.post('/task/assign', authenticateToken, async (req, res) => {
  console.log("assign task")
  const { taskId, userId } = req.body;
  console.log(userId)
  

  try {
    const response = await axios.patch(`${BOARD_SERVICE_URL}/task/${taskId}`, {
      "assigned_to_id": userId
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.post('/task/move', authenticateToken, async (req, res) => {
  console.log("move task")
  const { taskId, newColumnId } = req.body;

  try {
    const response = await axios.post(`${BOARD_SERVICE_URL}/task/move`, {
      "task_id": taskId,
      "new_column": newColumnId
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.post('/task/delete', authenticateToken, async (req, res) => {
  const { taskId } = req.body;
  console.log("delete task")
  try {
    const response = await axios.get(`${BOARD_SERVICE_URL}/task/delete/${taskId}`);
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(err.response?.status || 500).json(err.response?.data);
  }
});

app.listen(3000, () => {
  console.log('API Gateway running on http://localhost:3000');
});
