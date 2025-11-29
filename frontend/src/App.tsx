import React, { useState, useEffect } from 'react';
import './App.css';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Normal');
  const [selectedStatus, setSelectedStatus] = useState('Not started');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/tasks');
      const data = await response.json();
      console.log('API Response:', data);

      // Ensure data is an array
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error('Expected array but got:', typeof data);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          status: selectedStatus,
          priority: selectedPriority
        })
      });

      if (response.ok) {
        setNewTaskTitle('');
        setSelectedPriority('Normal');
        setSelectedStatus('Not started');
        loadTasks();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateTask = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTitle || task.title,
          status: task.status,
          priority: task.priority
        })
      });

      if (response.ok) {
        setEditingId(null);
        setEditingTitle('');
        loadTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          status: newStatus,
          priority: task.priority
        })
      });

      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#ff4444';
      case 'Medium':
        return '#ffbb33';
      case 'Low':
        return '#00bb33';
      default:
        return '#999999';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return '#00bb33';
      case 'In Progress':
        return '#0088ff';
      case 'Not started':
        return '#cccccc';
      default:
        return '#999999';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MySecretary</h1>
        <p>Notionベースのタスク管理アシスタント</p>
      </header>

      <main className="container">
        {/* Add Task Form */}
        <div className="task-form">
          <form onSubmit={handleAddTask}>
            <input
              type="text"
              placeholder="新しいタスクを入力..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="task-input"
            />

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="priority-select"
            >
              <option value="Low">低</option>
              <option value="Normal">中</option>
              <option value="High">高</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="status-select"
            >
              <option value="Not started">未開始</option>
              <option value="In Progress">実施中</option>
              <option value="Done">完了</option>
            </select>

            <button type="submit" className="add-btn">
              追加
            </button>
          </form>
        </div>

        {/* Task List */}
        <div className="tasks-section">
          <h2>タスク一覧</h2>
          {loading ? (
            <p className="loading">読み込み中...</p>
          ) : tasks.length === 0 ? (
            <p className="empty">タスクはまだありません。新しいタスクを追加してください。</p>
          ) : (
            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-header">
                    {editingId === task.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="edit-input"
                        onBlur={() => handleUpdateTask(task.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateTask(task.id);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <h3 onDoubleClick={() => {
                        setEditingId(task.id);
                        setEditingTitle(task.title);
                      }}>
                        {task.title}
                      </h3>
                    )}
                  </div>

                  <div className="task-meta">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="task-status"
                      style={{ borderLeft: `4px solid ${getStatusColor(task.status)}` }}
                    >
                      <option value="Not started">未開始</option>
                      <option value="In Progress">実施中</option>
                      <option value="Done">完了</option>
                    </select>

                    <span
                      className="task-priority"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="delete-btn"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="stats">
          <div className="stat">
            <span className="stat-label">総タスク数</span>
            <span className="stat-value">{tasks.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">完了</span>
            <span className="stat-value">{tasks.filter(t => t.status === 'Done').length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">実施中</span>
            <span className="stat-value">{tasks.filter(t => t.status === 'In Progress').length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">未開始</span>
            <span className="stat-value">{tasks.filter(t => t.status === 'Not started').length}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;