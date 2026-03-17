import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Dashboard from './pages/Dashboard';
import LogSteps from './pages/LogSteps';
import Trends from './pages/Trends';
import Settings from './pages/Settings';
import './App.css';

export default function App() {
  return (
    <div className="layout">
      <Nav />
      <main className="main-content">
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/log"     element={<LogSteps />} />
          <Route path="/trends"  element={<Trends />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
