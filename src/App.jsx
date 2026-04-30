import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import CalendarView from "./pages/CalendarView";
import DaysLesson from "./pages/DaysLesson";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white p-4">

        {/* Navigation */}
        <nav className="flex gap-4 mb-6">
          <Link to="/">Dashboard</Link>
          <Link to="/journal">Journal</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/insights">Day’s Lesson</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/insights" element={<DaysLesson />} />
        </Routes>

      </div>
    </Router>
  );
}