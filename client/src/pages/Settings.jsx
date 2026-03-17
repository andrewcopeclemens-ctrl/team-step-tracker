import { useState, useEffect } from 'react';
import './Settings.css';

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f97316'];

function getAvatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h) + name.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Settings() {
  const [members,    setMembers]    = useState([]);
  const [newName,    setNewName]    = useState('');
  const [adding,     setAdding]     = useState(false);
  const [addError,   setAddError]   = useState('');
  const [confirmId,  setConfirmId]  = useState(null); // id of member pending removal
  const [removing,   setRemoving]   = useState(null); // id currently being removed

  useEffect(() => {
    loadMembers();
  }, []);

  function loadMembers() {
    fetch('/api/members')
      .then(r => r.json())
      .then(setMembers);
  }

  async function handleAdd(e) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) { setAddError('Name cannot be empty.'); return; }

    setAdding(true);
    setAddError('');

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add member');
      setNewName('');
      loadMembers();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id) {
    setRemoving(id);
    try {
      await fetch(`/api/members/${id}`, { method: 'DELETE' });
      setConfirmId(null);
      loadMembers();
    } catch {
      // ignore
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="settings">
      <h1 className="page-title">Settings</h1>

      {/* Add member */}
      <div className="card settings-add-card">
        <h2 className="card-title">Add Team Member</h2>
        <form onSubmit={handleAdd} className="add-form">
          <div className="form-group">
            <label className="form-label" htmlFor="new-name">Full Name</label>
            <input
              id="new-name"
              type="text"
              className="form-input"
              placeholder="e.g. Riley Park"
              value={newName}
              onChange={e => { setNewName(e.target.value); setAddError(''); }}
              maxLength={60}
            />
          </div>
          {addError && <p className="add-error">{addError}</p>}
          <button type="submit" className="btn btn-primary" disabled={adding}>
            {adding ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      </div>

      {/* Member list */}
      <div className="card">
        <h2 className="card-title">Team Members ({members.length})</h2>
        {members.length === 0 ? (
          <p className="empty-state">No members yet.</p>
        ) : (
          <ul className="member-list">
            {members.map(m => (
              <li key={m.id} className="member-row">
                <div
                  className="avatar"
                  style={{ background: getAvatarColor(m.name) }}
                >
                  {getInitials(m.name)}
                </div>
                <span className="member-name">{m.name}</span>

                {confirmId === m.id ? (
                  <div className="confirm-row">
                    <span className="confirm-text">Remove?</span>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemove(m.id)}
                      disabled={removing === m.id}
                    >
                      {removing === m.id ? 'Removing...' : 'Yes, Remove'}
                    </button>
                    <button
                      className="btn btn-cancel"
                      onClick={() => setConfirmId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-danger btn-remove"
                    onClick={() => setConfirmId(m.id)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
