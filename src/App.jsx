import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Insights from "./pages/Insights";
import CalendarView from "./pages/CalendarView";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white p-4">

        {/* Navigation */}
        <nav className="flex gap-4 mb-6">
          <Link to="/">Dashboard</Link>
          <Link to="/journal">Journal</Link>
          <Link to="/insights">Insights</Link>
          <Link to="/calendar">Calendar</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/calendar" element={<CalendarView />} />
        </Routes>

      </div>
    </Router>
  );
}