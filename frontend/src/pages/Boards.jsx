import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../App.css";

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

function Boards() {
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [newColumnNames, setNewColumnNames] = useState({});
  const [editColumnNames, setEditColumnNames] = useState({});
  const [newBoardName, setNewBoardName] = useState('');
  const [editBoardName, setEditBoardName] = useState({});
  const [newTaskTitles, setNewTaskTitles] = useState({});
  const [editTaskTitles, setEditTaskTitles] = useState({});
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [users, setUsers] = useState([]);

  // fetchBoard
  const fetchBoards = async () => {
    try {
      const res = await api.get('/boards');
      setBoards(res.data);
      // Set the first board as active if none is selected
      if (res.data.length > 0 && !activeBoard) {
        setActiveBoard(res.data[0].id);
      }
    } catch (err) {
      alert('Failed to fetch boards');
    }
  };

  // fetchMembers
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      const users = Object.fromEntries(res.data.map(user => [user.id, user.username]));
      setUsers(users);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchBoards();
    fetchUsers();
  }, []);

  // add Task
  const handleAddTask = async (columnId) => {
    const title = newTaskTitles[columnId];
    if (!title) return;

    try {
      await api.post('/task/add', { column: columnId, title });
      setNewTaskTitles((prev) => ({ ...prev, [columnId]: '' }));
      fetchBoards();
    } catch (err) {
      alert('Failed to add task');
    }
  };

  // edit task
  const handleEditTask = async (taskId, columnId) => {
    const title = editTaskTitles[taskId];
    if (!title) return;

    try {
      await api.post('/task/edit', { taskId, title, column: columnId });
      setEditTaskTitles((prev) => ({ ...prev, [taskId]: '' }));
      fetchBoards();
    } catch (err) {
      alert('Failed to edit task');
    }
  };

  // delete task
  const handleDeleteTask = async (taskId) => {
    try {
      await api.post('task/delete', { taskId });
      fetchBoards();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  //assign task
  const handleAssignTask = async (taskId, userId) => {
    try {
      await api.post('/task/assign', { taskId, userId });
      fetchBoards();
    } catch (err) {
      alert('Failed to assign task');
    }
  };

  //add column
  const handleAddColumn = async (boardId) => {
    const name = newColumnNames[boardId];
    if (!name) return;

    try {
      await api.post('/column/add', { board: boardId, name });
      setNewColumnNames((prev) => ({ ...prev, [boardId]: '' }));
      fetchBoards();
    } catch (err) {
      alert('Failed to add column');
    }
  };

  //delete cloumn
  const handleDeleteColumn = async (columnId) => {
    try {
      await api.post('/column/delete', { columnId });
      fetchBoards();
    } catch (err) {
      alert('Failed to delete column');
    }
  };

  //edit column
  const handleEditColumn = async (columnId) => {
    const name = editColumnNames[columnId];
    if (!name) return;

    try {
      await api.post('/column/edit', { name, columnId });
      setEditColumnNames((prev) => ({ ...prev, [columnId]: '' }));
      fetchBoards();
    } catch (err) {
      alert('Failed to rename column');
    }
  };

  //create board
  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;

    try {
      await api.post('/board', { name: newBoardName });
      setNewBoardName('');
      fetchBoards();
    } catch (err) {
      alert('Failed to create board');
    }
  };

  //edit board
  const handleEditBoard = async (boardId) => {
    const name = editBoardName[boardId];
    if (!name) return;

    try {
      await api.post('/board/edit', { boardId, name });
      setEditBoardName((prev) => ({ ...prev, [boardId]: '' }));
      fetchBoards();
    } catch (err) {
      alert('Failed to edit board');
    }
  };

  //delete board
  const handleDeleteBoard = async (boardId) => {
    try {
      await api.post('/board/delete', { boardId });
      fetchBoards();
      if (activeBoard === boardId && boards.length > 1) {
        const otherBoard = boards.find(b => b.id !== boardId);
        if (otherBoard) setActiveBoard(otherBoard.id);
        else setActiveBoard(null);
      }
    } catch (err) {
      alert('Failed to delete board');
    }
  };

  //add member
  const handleAddMember = async (boardId, username, members) => {
    const userId = Object.keys(users).find((id) => users[id] === username);

    if (!userId) {
      alert('User not found');
      return;
    }
    const updatedMembers = [...members, userId];

    try {
      // Add the user ID to the board's members
      await api.post('/board/add-member', { boardId, members: updatedMembers });

      // Optionally, re-fetch boards or update local state
      setUsernameToAdd('');
      fetchBoards();
    } catch (error) {
      alert('Failed to add member');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (columnId) => {
    if (!draggedTask) return;

    try {
      await api.post('/task/move', {
        taskId: draggedTask.id,
        newColumnId: columnId
      });
      setDraggedTask(null);
      fetchBoards();
    } catch (err) {
      alert('Failed to move task');
    }
  };

  // Get the current active board
  const currentBoard = boards.find(board => board.id === activeBoard);

  return (
    <div className='container'>
      <h1 className='header'>Kanban Board</h1>
  
      {/* Board selection tabs */}
      <div className='board-list'>
        {boards.map(board => (
          <div
            key={board.id}
            className={`px-3 py-2 rounded-t cursor-pointer ${activeBoard === board.id ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
            onClick={() => setActiveBoard(board.id)}
          >
            {board.name}
          </div>
        ))}
      </div>
  
      {/* Create new board */}
      <div className='add-board'>
        <input
          type="text"
          placeholder="New board name"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
        />
        <button
          onClick={handleCreateBoard}
        >
          +
        </button>
      </div>
  
      {currentBoard && (
        <>
          <div className='board-name'>
            <input
              type="text"
              value={editBoardName[currentBoard.id] || currentBoard.name}
              onChange={(e) =>
                setEditBoardName((prev) => ({
                  ...prev,
                  [currentBoard.id]: e.target.value,
                }))
              }
              onBlur={() => handleEditBoard(currentBoard.id)}
            />
            <button
              className='x-button'
              onClick={() => handleDeleteBoard(currentBoard.id)}
            >
              x
            </button>
          </div>
          
          <div className='add-member'>
            <input
              type="text"
              placeholder="Username"
              value={usernameToAdd}
              onChange={(e) => setUsernameToAdd(e.target.value)}
            />
            <button
              onClick={() => handleAddMember(currentBoard.id, usernameToAdd, currentBoard.members)}
            >
              + Member
            </button>
          </div>
  
          {/* Kanban columns layout */}
          <div className='board'>
            {currentBoard.columns.map((column) => (
              <div
                className='column'
                key={column.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                <div className='column-name'>
                  <input
                    value={editColumnNames[column.id] ?? column.name}
                    onChange={(e) =>
                      setEditColumnNames((prev) => ({
                        ...prev,
                        [column.id]: e.target.value,
                      }))
                    }
                    onBlur={() => handleEditColumn(column.id)}
                  />
                  <button
                    onClick={() => handleDeleteColumn(column.id)}
                  >
                    ×
                  </button>
                </div>
  
                <div className='task'>
                  {column.tasks
                    .sort((a, b) => a.order - b.order)
                    .map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                      >
                        <div>
                          <input
                            value={editTaskTitles[task.id] ?? task.title}
                            onChange={(e) =>
                              setEditTaskTitles((prev) => ({
                                ...prev,
                                [task.id]: e.target.value,
                              }))
                            }
                            onBlur={() => handleEditTask(task.id, column.id)}
                          />
                          <button 
                            className='x-button'
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            ×
                          </button>
                        </div>
  
                        <div>
                          <select
                            value={task.assigned_to_id || ''}
                            onChange={(e) => handleAssignTask(task.id, e.target.value)}
                          >
                            <option value="">Unassigned</option>
                            {currentBoard.members.map(userId => (
                              <option key={userId} value={userId}>
                                {users[userId] || 'Unknown User'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                </div>
  
                <div>
                  <input
                    className='add-task'
                    placeholder="New task title"
                    value={newTaskTitles[column.id] || ''}
                    onChange={(e) =>
                      setNewTaskTitles((prev) => ({ ...prev, [column.id]: e.target.value }))
                    }
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Add Column */}
          <div className='add-column'>
            <input
              placeholder="New column name"
              value={newColumnNames[currentBoard.id] || ''}
              onChange={(e) =>
                setNewColumnNames((prev) => ({
                  ...prev,
                  [currentBoard.id]: e.target.value,
                }))
              }
              onKeyPress={(e) => e.key === 'Enter' && handleAddColumn(currentBoard.id)}
            />
            <button
              onClick={() => handleAddColumn(currentBoard.id)}
            >
              + Column
            </button>
          </div>
        </>
      )}
  
      {!currentBoard && (
        <div>
          <p>No boards available. Create a new board to get started.</p>
        </div>
      )}
    </div>
  );
}

export default Boards;