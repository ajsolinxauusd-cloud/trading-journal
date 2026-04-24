import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function CalendarView() {
  const [trades, setTrades] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchTrades = async () => {
      const snapshot = await getDocs(collection(db, "trades"));
      const data = snapshot.docs.map(doc => doc.data());
      setTrades(data);
    };

    fetchTrades();
  }, []);

  // Convert selected date to YYYY-MM-DD
  const formattedDate = selectedDate.toISOString().split("T")[0];

  // Filter trades for selected day
  const tradesForDay = trades.filter(t => t.date === formattedDate);

  return (
    <div>
      <h1 className="text-3xl mb-6">Calendar</h1>

      {/* Calendar */}
      <div className="mb-6">
        <Calendar onChange={setSelectedDate} value={selectedDate} />
      </div>

      {/* Trades */}
      <div>
        <h2 className="text-xl mb-4">{formattedDate}</h2>

        {tradesForDay.length === 0 && (
          <p className="text-gray-400">No trades this day</p>
        )}

        {tradesForDay.map((trade, index) => (
          <div key={index} className="bg-gray-800 p-4 mb-4 rounded-xl">

            <p className="text-lg font-semibold">{trade.asset}</p>

            <p className={trade.type === "Buy" ? "text-green-400" : "text-red-400"}>
              {trade.type}
            </p>

            <p>Entry: {trade.entry} | Exit: {trade.exit}</p>
            <p>Lot: {trade.lot}</p>

            <p className={trade.profit >= 0 ? "text-green-400" : "text-red-400"}>
              Profit: {trade.profit}
            </p>

          </div>
        ))}
      </div>
    </div>
  );
}