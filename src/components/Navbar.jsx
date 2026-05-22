import { Link } from "react-router-dom";

export default function Navbar() {

  return (

    <nav className="bg-black p-4 flex gap-6 border-b border-gray-800">

      <Link
        to="/"
        className="text-white hover:text-green-400"
      >
        Dashboard
      </Link>

      <Link
        to="/journal"
        className="text-white hover:text-green-400"
      >
        Journal
      </Link>

      <Link
        to="/backtest"
        className="text-white hover:text-green-400"
      >
        Backtest Journal
      </Link>

      <Link
        to="/calendar"
        className="text-white hover:text-green-400"
      >
        Calendar
      </Link>

      <Link
        to="/lessons"
        className="text-white hover:text-green-400"
      >
        Day’s Lesson
      </Link>

    </nav>

  );

}