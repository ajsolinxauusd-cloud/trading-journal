import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

// ✅ Local date fix
const getLocalDate = (date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

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

  const formattedDate = getLocalDate(selectedDate);

  // 🔥 Only real trades
  const tradesForDay = trades.filter(
    t => t.date === formattedDate && t.kind !== "withdrawal"
  );

  const totalProfit = tradesForDay.reduce((sum, t) => sum + t.profit, 0);
  const totalTrades = tradesForDay.length;

  const wins = tradesForDay.filter(t => t.profit > 0).length;
  const winRate = totalTrades
    ? ((wins / totalTrades) * 100).toFixed(1)
    : 0;

  // ✅ FIX: ONLY WINNING TRADES FOR RR
  const winningTrades = tradesForDay.filter(t => t.profit > 0);

  const avgRR = winningTrades.length
    ? (
        winningTrades.reduce((sum, t) => sum + Number(t.rr || 0), 0) /
        winningTrades.length
      ).toFixed(2)
    : 0;

  // Calendar coloring
  const getDayProfit = (date) => {
    const day = getLocalDate(date);

    const tradesOnly = trades.filter(
      t => t.date === day && t.kind !== "withdrawal"
    );

    return tradesOnly.reduce((sum, t) => sum + t.profit, 0);
  };

  return (
    <div>
      <h1 className="text-3xl mb-6">Calendar</h1>

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={({ date, view }) => {
          if (view === "month") {
            const profit = getDayProfit(date);

            if (profit > 0) return "profit-day";
            if (profit < 0) return "loss-day";
          }
        }}
      />

      <div className="mt-6 bg-gray-900 p-4 rounded-xl">

        <h2 className="text-xl mb-4">{formattedDate}</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">

          <div>
            <p className="text-gray-400">Total Profit</p>
            <p className={totalProfit >= 0 ? "text-green-400" : "text-red-400"}>
              {totalProfit}
            </p>
          </div>

          <div>
            <p className="text-gray-400">Trades</p>
            <p>{totalTrades}</p>
          </div>

          <div>
            <p className="text-gray-400">Win Rate</p>
            <p>{winRate}%</p>
          </div>

          <div>
            <p className="text-gray-400">Avg R:R (Wins)</p>
            <p>{avgRR}</p>
          </div>

        </div>

        {tradesForDay.length === 0 && (
          <p className="text-gray-400">No trades this day</p>
        )}

        {tradesForDay.map((trade, index) => (
          <div key={index} className="bg-gray-800 p-4 mb-2 rounded-xl">

            <p className="font-semibold">{trade.asset}</p>

            <p className={trade.type === "Buy" ? "text-green-400" : "text-red-400"}>
              {trade.type}
            </p>

            <p>Entry: {trade.entry} | Exit: {trade.exit}</p>

            <p className={trade.profit >= 0 ? "text-green-400" : "text-red-400"}>
              Profit: {trade.profit}
            </p>

          </div>
        ))}

      </div>
    </div>
  );
}