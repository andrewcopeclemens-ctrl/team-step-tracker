import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './Trends.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#f97316', '#06b6d4',
];

function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function shortDate(dateStr) {
  const [, m, d] = dateStr.split('-');
  return `${m}/${d}`;
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 12 } } },
    tooltip: {
      callbacks: {
        label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} steps`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v,
        font: { size: 11 },
      },
      grid: { color: '#e2e8f0' },
    },
    x: {
      ticks: { font: { size: 11 } },
      grid: { display: false },
    },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => ` ${ctx.parsed.x.toLocaleString()} steps`,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        callback: v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v,
        font: { size: 11 },
      },
      grid: { color: '#e2e8f0' },
    },
    y: {
      ticks: { font: { size: 12 } },
      grid: { display: false },
    },
  },
};

export default function Trends() {
  const [members,   setMembers]   = useState([]);
  const [stepsData, setStepsData] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const days = getLastNDays(7);
    const from = days[0];
    const to   = days[6];

    Promise.all([
      fetch('/api/members').then(r => r.json()),
      fetch(`/api/steps?from=${from}&to=${to}`).then(r => r.json()),
    ]).then(([m, s]) => {
      setMembers(m);
      setStepsData(s);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">Loading charts...</div>;

  if (members.length === 0) {
    return (
      <div className="trends">
        <h1 className="page-title">Trends</h1>
        <p className="empty-state">No members yet. Add some in Settings.</p>
      </div>
    );
  }

  const days = getLastNDays(7);
  const labels = days.map(shortDate);

  // Build a lookup: { member_id: { date: steps } }
  const lookup = {};
  for (const s of stepsData) {
    if (!lookup[s.member_id]) lookup[s.member_id] = {};
    lookup[s.member_id][s.date] = s.steps;
  }

  // Line chart datasets: one line per member
  const lineDatasets = members.map((m, i) => ({
    label: m.name,
    data: days.map(d => lookup[m.id]?.[d] ?? 0),
    borderColor: COLORS[i % COLORS.length],
    backgroundColor: COLORS[i % COLORS.length] + '22',
    tension: 0.35,
    pointRadius: 4,
    pointHoverRadius: 6,
    borderWidth: 2,
  }));

  // Bar chart: weekly total per member, sorted descending
  const weeklyTotals = members
    .map(m => ({
      name: m.name,
      total: days.reduce((sum, d) => sum + (lookup[m.id]?.[d] ?? 0), 0),
      color: COLORS[members.indexOf(m) % COLORS.length],
    }))
    .sort((a, b) => b.total - a.total);

  const barData = {
    labels: weeklyTotals.map(m => m.name),
    datasets: [
      {
        label: 'Weekly Steps',
        data: weeklyTotals.map(m => m.total),
        backgroundColor: weeklyTotals.map(m => m.color + 'cc'),
        borderColor: weeklyTotals.map(m => m.color),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="trends">
      <h1 className="page-title">Trends</h1>

      <div className="card trends-card">
        <h2 className="card-title">Daily Steps — Last 7 Days</h2>
        <div className="chart-wrap chart-wrap--line">
          <Line
            data={{ labels, datasets: lineDatasets }}
            options={lineOptions}
          />
        </div>
      </div>

      <div className="card trends-card">
        <h2 className="card-title">Weekly Total per Member</h2>
        <div
          className="chart-wrap chart-wrap--bar"
          style={{ height: `${Math.max(200, weeklyTotals.length * 52)}px` }}
        >
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}
