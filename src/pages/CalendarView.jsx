import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function CalendarView() {
  const [trades, setTrades] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    const snapshot = await getDocs(collection(db, "trades"));
    const data = snapshot.docs.map(doc => doc.data());
    setTrades(data);
  };

  // ✅ FIX: USE LOCAL DEVICE DATE (NO UTC)
  const formatDate = (date) => {
    return date.toLocaleDateString("en-CA"); // YYYY-MM-DD (LOCAL TIME)
  };

  const selected = formatDate(selectedDate);

  // 🔥 ONLY REAL TRADES FOR THE DAY
  const tradesForDay = trades.filter(
    t => t.date === selected && t.kind !== "withdrawal"
  );

  // 📊 STATS
  const totalProfit = tradesForDay.reduce((sum, t) => sum + t.profit, 0);
  const totalTrades = tradesForDay.length;

  const wins = tradesForDay.filter(t => t.profit > 0).length;

  const winRate = totalTrades
    ? ((wins / totalTrades) * 100).toFixed(1)
    : 0;

  // ✅ RR (WINS ONLY)
  const winningTrades = tradesForDay.filter(t => t.profit > 0);

  const avgRR = winningTrades.length
    ? (
        winningTrades.reduce(
          (sum, t) => sum + Number(t.rr || 0),
          0
        ) / winningTrades.length
      ).toFixed(2)
    : 0;

  // 🎨 COLOR DAYS (FIXED)
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";

    const d = formatDate(date);

    const dayTrades = trades.filter(
      t => t.date === d && t.kind !== "withdrawal"
    );

    if (!dayTrades.length) return "";

    const profit = dayTrades.reduce((sum, t) => sum + t.profit, 0);

    if (profit > 0) return "profit-day";
    if (profit < 0) return "loss-day";

    return "";
  };

  return (
    <div>

      <h1 className="text-3xl mb-6">Calendar</h1>

      {/* 📅 CALENDAR */}
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={tileClassName}
      />

      {/* 📊 DAY DETAILS */}
      <div className="bg-gray-900 p-6 mt-6 rounded-xl">

        <h2 className="text-xl mb-4">{selected}</h2>

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

        {/* 📋 TRADES */}
        {tradesForDay.map((trade, index) => (
          <div key={index} className="bg-gray-800 p-4 mb-3 rounded-xl">

            <p className="font-semibold">{trade.asset}</p>

            <p className={trade.type === "Buy" ? "text-green-400" : "text-red-400"}>
              {trade.type}
            </p>

            <p>
              Entry: {trade.entry} | Exit: {trade.exit}
            </p>

            <p className={trade.profit >= 0 ? "text-green-400" : "text-red-400"}>
              Profit: {trade.profit}
            </p>

            {/* 📸 CHART LINK */}
            {trade.screenshot && (
              <div className="mt-3">

                <a
                  href={trade.screenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline"
                >
                  View Chart
                </a>

                <img
                  src={trade.screenshot}
                  alt="chart"
                  className="mt-2 rounded-lg max-h-48"
                />

              </div>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}