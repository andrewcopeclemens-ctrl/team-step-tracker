import { useState, useEffect, useCallback } from 'react';
import './LogSteps.css';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}/${y}`;
}

export default function LogSteps() {
  const [members,  setMembers]  = useState([]);
  const [history,  setHistory]  = useState([]);
  const [memberId, setMemberId] = useState('');
  const [date,     setDate]     = useState(getToday());
  const [steps,    setSteps]    = useState('');
  const [status,   setStatus]   = useState(null); // { type: 'success'|'error', msg }
  const [submitting, setSubmitting] = useState(false);

  const loadHistory = useCallback(() => {
    fetch('/api/steps')
      .then(r => r.json())
      .then(data => setHistory(data.slice(0, 15)));
  }, []);

  useEffect(() => {
    fetch('/api/members')
      .then(r => r.json())
      .then(data => {
        setMembers(data);
        if (data.length > 0) setMemberId(String(data[0].id));
      });
    loadHistory();
  }, [loadHistory]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!memberId || !date || !steps) {
      setStatus({ type: 'error', msg: 'Please fill in all fields.' });
      return;
    }
    const stepsNum = parseInt(steps, 10);
    if (isNaN(stepsNum) || stepsNum < 0) {
      setStatus({ type: 'error', msg: 'Steps must be a positive number.' });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: Number(memberId), date, steps: stepsNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save steps');

      setStatus({ type: 'success', msg: 'Steps logged successfully!' });
      setSteps('');
      loadHistory();
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="log-steps">
      <h1 className="page-title">Log Steps</h1>

      <div className="log-grid">
        {/* Form */}
        <div className="card log-form-card">
          <h2 className="card-title">Add Entry</h2>
          <form onSubmit={handleSubmit} className="log-form">
            <div className="form-group">
              <label className="form-label" htmlFor="member">Team Member</label>
              <select
                id="member"
                className="form-select"
                value={memberId}
                onChange={e => setMemberId(e.target.value)}
              >
                {members.length === 0 && (
                  <option value="">No members — add some in Settings</option>
                )}
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                className="form-input"
                value={date}
                max={getToday()}
                onChange={e => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="steps">Steps</label>
              <input
                id="steps"
                type="number"
                className="form-input"
                placeholder="e.g. 8500"
                min="0"
                max="100000"
                value={steps}
                onChange={e => setSteps(e.target.value)}
              />
            </div>

            {status && (
              <div className={`log-status log-status--${status.type}`}>
                {status.msg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary log-submit"
              disabled={submitting || members.length === 0}
            >
              {submitting ? 'Saving...' : 'Log Steps'}
            </button>
          </form>
        </div>

        {/* Recent history */}
        <div className="card">
          <h2 className="card-title">Recent Entries</h2>
          {history.length === 0 ? (
            <p className="empty-state">No entries yet.</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Date</th>
                  <th className="text-right">Steps</th>
                </tr>
              </thead>
              <tbody>
                {history.map(entry => (
                  <tr key={entry.id}>
                    <td>{entry.member_name}</td>
                    <td className="text-muted">{formatDate(entry.date)}</td>
                    <td className="text-right">
                      <span className={entry.steps >= 10000 ? 'steps-goal' : ''}>
                        {entry.steps.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
