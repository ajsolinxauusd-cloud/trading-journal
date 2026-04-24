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

  const formattedDate = selectedDate.toISOString().split("T")[0];

  const tradesForDay = trades.filter(t => t.date === formattedDate);

  // 📊 Daily Stats
  const totalProfit = tradesForDay.reduce((sum, t) => sum + t.profit, 0);
  const totalTrades = tradesForDay.length;
  const wins = tradesForDay.filter(t => t.profit > 0).length;
  const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;

  const avgRR = totalTrades
    ? (
        tradesForDay.reduce((sum, t) => sum + Number(t.rr || 0), 0) /
        totalTrades
      ).toFixed(2)
    : 0;

  // 🧠 Profit per day (for coloring)
  const getDayProfit = (date) => {
    const day = date.toISOString().split("T")[0];
    const tradesForDay = trades.filter(t => t.date === day);
    return tradesForDay.reduce((sum, t) => sum + t.profit, 0);
  };

  return (
    <div>
      <h1 className="text-3xl mb-6">Calendar</h1>

      {/* 📅 Calendar */}
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

      {/* 📊 DAILY PERFORMANCE PANEL */}
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
            <p className="text-gray-400">Avg R:R</p>
            <p>{avgRR}</p>
          </div>

        </div>

        {/* 📋 Trades */}
        {tradesForDay.length === 0 && (
          <p className="text-gray-400">No trades this day</p>
        )}

        {tradesForDay.map((trade, index) => (
          <div key={index} className="bg-gray-800 p-4 mb-3 rounded-xl">

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