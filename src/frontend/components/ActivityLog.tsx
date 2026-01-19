import React, { useState, useEffect } from 'react';

interface Activity {
  id: number;
  startTime: string;
  endTime: string;
  task: string;
  projectId: string;
  notes: string;
  createdAt: string;
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [newActivity, setNewActivity] = useState({
    startTime: '10:00',
    endTime: '10:30',
    task: '',
    projectId: '',
    notes: '',
  });

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/activities?date=${filterDate}`,
        { method: 'GET' }
      );
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [filterDate]);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivity),
      });

      if (response.ok) {
        setNewActivity({
          startTime: '10:00',
          endTime: '10:30',
          task: '',
          projectId: '',
          notes: '',
        });
        fetchActivities();
      }
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

  const handleDeleteActivity = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/activities/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchActivities();
      }
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  return (
    <div className="activity-log">
      <h2>📋 活動ログ</h2>

      <div className="filter-section">
        <label>
          日付フィルター:
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input-field"
          />
        </label>
      </div>

      <form onSubmit={handleAddActivity} className="add-activity-form">
        <h3>新しい活動を追加</h3>
        <div className="form-row">
          <input
            type="time"
            value={newActivity.startTime}
            onChange={(e) =>
              setNewActivity({ ...newActivity, startTime: e.target.value })
            }
            className="input-field input-time"
            required
          />
          <span>-</span>
          <input
            type="time"
            value={newActivity.endTime}
            onChange={(e) =>
              setNewActivity({ ...newActivity, endTime: e.target.value })
            }
            className="input-field input-time"
            required
          />
          <input
            type="text"
            placeholder="タスク"
            value={newActivity.task}
            onChange={(e) =>
              setNewActivity({ ...newActivity, task: e.target.value })
            }
            className="input-field input-task"
            required
          />
          <input
            type="text"
            placeholder="プロジェクト"
            value={newActivity.projectId}
            onChange={(e) =>
              setNewActivity({ ...newActivity, projectId: e.target.value })
            }
            className="input-field input-project"
          />
          <input
            type="text"
            placeholder="備考"
            value={newActivity.notes}
            onChange={(e) =>
              setNewActivity({ ...newActivity, notes: e.target.value })
            }
            className="input-field input-notes"
          />
          <button type="submit" className="btn-primary">
            追加
          </button>
        </div>
      </form>

      <div className="activities-section">
        <h3>本日の活動 ({activities.length}件)</h3>
        {loading ? (
          <p>読み込み中...</p>
        ) : activities.length === 0 ? (
          <p className="no-activities">活動ログがありません</p>
        ) : (
          <div className="activities-table">
            <table>
              <thead>
                <tr>
                  <th>時間</th>
                  <th>タスク</th>
                  <th>プロジェクト</th>
                  <th>備考</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td>
                      {activity.startTime}-{activity.endTime}
                    </td>
                    <td>{activity.task}</td>
                    <td>{activity.projectId || '-'}</td>
                    <td>{activity.notes || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="btn-remove-small"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
