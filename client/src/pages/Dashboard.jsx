import { useState, useEffect } from 'react';
import './Dashboard.css';

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f97316'];

function getAvatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h) + name.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function formatNum(n) {
  return n.toLocaleString();
}

const WEEKLY_GOAL = 70000; // 10k/day × 7 days
const DAILY_GOAL  = 10000;

export default function Dashboard() {
  const [members, setMembers]     = useState([]);
  const [stepsData, setStepsData] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const today = getToday();
    const from  = getNDaysAgo(6);

    Promise.all([
      fetch('/api/members').then(r => r.json()),
      fetch(`/api/steps?from=${from}&to=${today}`).then(r => r.json()),
    ]).then(([m, s]) => {
      setMembers(m);
      setStepsData(s);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const today = getToday();

  // Aggregate weekly totals & today's steps per member
  const weeklyMap = {};
  const todayMap  = {};
  for (const s of stepsData) {
    weeklyMap[s.member_id] = (weeklyMap[s.member_id] || 0) + s.steps;
    if (s.date === today) todayMap[s.member_id] = s.steps;
  }

  const leaderboard = members
    .map(m => ({
      ...m,
      weeklyTotal: weeklyMap[m.id] || 0,
      todaySteps:  todayMap[m.id]  || 0,
    }))
    .sort((a, b) => b.weeklyTotal - a.weeklyTotal);

  const totalTeamSteps = leaderboard.reduce((s, m) => s + m.weeklyTotal, 0);
  const dailyAvgPerPerson =
    members.length > 0 ? Math.round(totalTeamSteps / 7 / members.length) : 0;
  const hittingGoalToday = leaderboard.filter(m => m.todaySteps >= DAILY_GOAL).length;

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      {/* Metric cards */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Team Steps This Week</div>
          <div className="metric-value">{formatNum(totalTeamSteps)}</div>
          <div className="metric-sub">last 7 days combined</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Daily Avg per Person</div>
          <div className="metric-value">{formatNum(dailyAvgPerPerson)}</div>
          <div className="metric-sub">steps / day</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">10k Goal — Today</div>
          <div className="metric-value">
            {hittingGoalToday}
            <span className="metric-denom"> / {members.length}</span>
          </div>
          <div className="metric-sub">members on track</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <h2 className="card-title">Weekly Leaderboard</h2>

        {leaderboard.length === 0 ? (
          <p className="empty-state">No members yet. Add some in Settings.</p>
        ) : (
          <div className="leaderboard">
            {leaderboard.map((member, index) => {
              const pct = Math.min((member.weeklyTotal / WEEKLY_GOAL) * 100, 100);
              const hitGoal = member.weeklyTotal >= WEEKLY_GOAL;
              return (
                <div key={member.id} className="lb-row">
                  <div className="lb-rank">{index + 1}</div>
                  <div
                    className="avatar"
                    style={{ background: getAvatarColor(member.name) }}
                  >
                    {getInitials(member.name)}
                  </div>
                  <div className="lb-info">
                    <div className="lb-name">{member.name}</div>
                    <div className="lb-progress-wrap">
                      <div className="lb-progress-bar">
                        <div
                          className="lb-progress-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="lb-pct">{Math.round(pct)}%</span>
                    </div>
                  </div>
                  <div className="lb-total">{formatNum(member.weeklyTotal)}</div>
                  {hitGoal && <span className="goal-badge">Goal!</span>}
                </div>
              );
            })}
          </div>
        )}

        <div className="leaderboard-legend">
          Progress bar = % of weekly goal ({formatNum(WEEKLY_GOAL)} steps)
        </div>
      </div>
    </div>
  );
}
