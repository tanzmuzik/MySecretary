const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID
    });

    const tasks = response.results.map(page => ({
      id: page.id,
      title: page.properties.Title?.title[0]?.plain_text || '',
      status: page.properties.Status?.status?.name || 'Not started',
      priority: page.properties.Priority?.select?.name || 'Normal',
      dueDate: page.properties['Due Date']?.date?.start || null
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks', message: error.message });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, status = 'Not started', priority = 'Normal', dueDate } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const response = await notion.pages.create({
      parent: {
        database_id: DATABASE_ID
      },
      properties: {
        Title: {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        Status: {
          status: {
            name: status
          }
        },
        Priority: {
          select: {
            name: priority
          }
        },
        'Due Date': {
          date: {
            start: dueDate || null
          }
        }
      }
    });

    res.status(201).json({
      id: response.id,
      title
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task', message: error.message });
  }
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, priority, dueDate } = req.body;

    await notion.pages.update({
      page_id: id,
      properties: {
        Title: {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        Status: {
          status: {
            name: status
          }
        },
        Priority: {
          select: {
            name: priority
          }
        },
        'Due Date': {
          date: {
            start: dueDate || null
          }
        }
      }
    });

    res.json({ id, title });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task', message: error.message });
  }
});

// Delete a task (archive in Notion)
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await notion.pages.update({
      page_id: id,
      archived: true
    });

    res.json({ id, archived: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task', message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`MySecretary API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
