import React, { useState } from 'react';

interface Activity {
  startTime: string;
  endTime: string;
  task: string;
  projectId: string;
  notes: string;
}

interface GeneratedReport {
  summary: string;
  highlights: string[];
  projects: { [key: string]: string };
  issues: string[];
  nextActions: string[];
  generatedAt: string;
}

export default function DailyReportGenerator() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [activities, setActivities] = useState<Activity[]>([
    { startTime: '09:00', endTime: '09:30', task: 'タスク整理', projectId: '', notes: '' },
    { startTime: '09:30', endTime: '10:00', task: '契約書準備', projectId: 'contracts', notes: '土岐さん宛' },
  ]);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddActivity = () => {
    setActivities([
      ...activities,
      { startTime: '10:00', endTime: '10:30', task: '', projectId: '', notes: '' },
    ]);
  };

  const handleActivityChange = (index: number, field: keyof Activity, value: string) => {
    const updated = [...activities];
    updated[index][field] = value;
    setActivities(updated);
  };

  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleGenerateReport = async () => {
    if (activities.length === 0) {
      setError('活動ログを最低1件追加してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/copilot/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          activities,
          userId: 'user123',
        }),
      });

      if (!response.ok) throw new Error('Report generation failed');

      const data = await response.json();
      setGeneratedReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!generatedReport) return;

    const reportText = `
=== ${date}の日報 ===

【サマリー】
${generatedReport.summary}

【主なハイライト】
${generatedReport.highlights.map(h => `- ${h}`).join('\n')}

【プロジェクト別進捗】
${Object.entries(generatedReport.projects)
  .map(([project, progress]) => `${project}:\n${progress}`)
  .join('\n\n')}

【課題】
${generatedReport.issues.map(i => `- ${i}`).join('\n')}

【次のアクション】
${generatedReport.nextActions.map(a => `- ${a}`).join('\n')}

生成日時: ${new Date(generatedReport.generatedAt).toLocaleString('ja-JP')}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="daily-report-generator">
      <h2>📝 日報を生成</h2>

      <div className="form-section">
        <label>
          日付:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
        </label>
      </div>

      <div className="form-section">
        <h3>活動ログ</h3>
        <div className="activities-list">
          {activities.map((activity, index) => (
            <div key={index} className="activity-row">
              <input
                type="time"
                value={activity.startTime}
                onChange={(e) =>
                  handleActivityChange(index, 'startTime', e.target.value)
                }
                className="input-field input-time"
              />
              <span>-</span>
              <input
                type="time"
                value={activity.endTime}
                onChange={(e) =>
                  handleActivityChange(index, 'endTime', e.target.value)
                }
                className="input-field input-time"
              />
              <input
                type="text"
                placeholder="タスク"
                value={activity.task}
                onChange={(e) =>
                  handleActivityChange(index, 'task', e.target.value)
                }
                className="input-field input-task"
              />
              <input
                type="text"
                placeholder="プロジェクト"
                value={activity.projectId}
                onChange={(e) =>
                  handleActivityChange(index, 'projectId', e.target.value)
                }
                className="input-field input-project"
              />
              <input
                type="text"
                placeholder="備考"
                value={activity.notes}
                onChange={(e) =>
                  handleActivityChange(index, 'notes', e.target.value)
                }
                className="input-field input-notes"
              />
              <button
                onClick={() => handleRemoveActivity(index)}
                className="btn-remove"
              >
                削除
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleAddActivity} className="btn-secondary">
          + 活動を追加
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        onClick={handleGenerateReport}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? '生成中...' : '🤖 Copilotで日報生成'}
      </button>

      {generatedReport && (
        <div className="generated-report">
          <h3>✨ 生成された日報</h3>

          <section className="report-section">
            <h4>サマリー</h4>
            <p>{generatedReport.summary}</p>
          </section>

          <section className="report-section">
            <h4>主なハイライト</h4>
            <ul>
              {generatedReport.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </section>

          <section className="report-section">
            <h4>プロジェクト別進捗</h4>
            <div className="projects-report">
              {Object.entries(generatedReport.projects).map(([project, progress]) => (
                <div key={project} className="project-item">
                  <strong>{project}:</strong>
                  <p>{progress}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="report-section">
            <h4>課題</h4>
            <ul className="issues-list">
              {generatedReport.issues.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </section>

          <section className="report-section">
            <h4>次のアクション</h4>
            <ul className="actions-list">
              {generatedReport.nextActions.map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
          </section>

          <button onClick={handleExportReport} className="btn-secondary">
            💾 ダウンロード
          </button>
        </div>
      )}
    </div>
  );
}
