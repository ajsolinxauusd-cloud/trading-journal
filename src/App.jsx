import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-black text-white">

        {/* Sidebar */}
        <div className="w-64 bg-gray-900 p-5">
          <h1 className="text-2xl font-bold mb-8">Vyron Journal</h1>

          <nav className="space-y-4">
            <Link to="/" className="block hover:text-gray-400">Dashboard</Link>
            <Link to="/journal" className="block hover:text-gray-400">Journal</Link>
            <Link to="/insights" className="block hover:text-gray-400">Insights</Link>
            <Link to="/settings" className="block hover:text-gray-400">Settings</Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}