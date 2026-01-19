import React, { useState, useEffect } from 'react';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'GET',
      });
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProject.name.trim()) {
      alert('プロジェクト名を入力してください');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        setNewProject({ name: '', description: '' });
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('このプロジェクトを削除しますか？')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'on-hold':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  return (
    <div className="project-manager">
      <h2>📊 プロジェクト管理</h2>

      <form onSubmit={handleAddProject} className="add-project-form">
        <h3>新しいプロジェクトを追加</h3>
        <div className="form-row">
          <input
            type="text"
            placeholder="プロジェクト名"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            className="input-field input-text"
            required
          />
          <input
            type="text"
            placeholder="説明"
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
            className="input-field input-text"
          />
          <button type="submit" className="btn-primary">
            追加
          </button>
        </div>
      </form>

      <div className="projects-section">
        <h3>プロジェクト一覧 ({projects.length}件)</h3>
        {loading ? (
          <p>読み込み中...</p>
        ) : projects.length === 0 ? (
          <p className="no-projects">プロジェクトがありません</p>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h4>{project.name}</h4>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  >
                    {project.status}
                  </span>
                </div>

                {project.description && (
                  <p className="project-description">{project.description}</p>
                )}

                <div className="project-actions">
                  <select
                    value={project.status}
                    onChange={(e) =>
                      handleUpdateStatus(project.id, e.target.value)
                    }
                    className="status-select"
                  >
                    <option value="active">進行中</option>
                    <option value="on-hold">保留中</option>
                    <option value="completed">完了</option>
                  </select>

                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="btn-remove"
                  >
                    削除
                  </button>
                </div>

                <p className="project-meta">
                  作成: {new Date(project.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
