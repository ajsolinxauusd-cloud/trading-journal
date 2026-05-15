import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function CalendarView() {

  const [trades, setTrades] = useState([]);

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  // ✅ MONTH SELECTOR
  const [selectedMonth, setSelectedMonth] =
    useState(new Date().getMonth());

  useEffect(() => {
    fetchTrades();
  }, []);

  // ✅ FETCH TRADES
  const fetchTrades = async () => {

    const snapshot = await getDocs(
      collection(db, "trades")
    );

    const data = snapshot.docs.map(doc =>
      doc.data()
    );

    setTrades(data);
  };

  // ✅ LOCAL DEVICE DATE FIX
  const formatDate = (date) => {
    return date.toLocaleDateString("en-CA");
  };

  const selected = formatDate(selectedDate);

  // 🔥 ONLY REAL TRADES FOR SELECTED DAY
  const tradesForDay = trades.filter(
    t =>
      t.date === selected &&
      t.kind !== "withdrawal" &&
      t.kind !== "deposit"
  );

  // 📊 DAY STATS
  const totalProfit = tradesForDay.reduce(
    (sum, t) =>
      sum + Number(t.profit || 0),
    0
  );

  const totalTrades = tradesForDay.length;

  const wins = tradesForDay.filter(
    t => t.profit > 0
  ).length;

  const winRate = totalTrades
    ? (
        (wins / totalTrades) *
        100
      ).toFixed(1)
    : 0;

  // ✅ RR (WINS ONLY)
  const winningTrades = tradesForDay.filter(
    t => t.profit > 0
  );

  const avgRR = winningTrades.length
    ? (
        winningTrades.reduce(
          (sum, t) =>
            sum + Number(t.rr || 0),
          0
        ) / winningTrades.length
      ).toFixed(2)
    : 0;

  // ✅ MONTH PROFIT
  const monthProfit = trades
    .filter(t => {

      // IGNORE DEPOSITS & WITHDRAWALS
      if (
        t.kind === "withdrawal" ||
        t.kind === "deposit"
      ) {
        return false;
      }

      const tradeDate = new Date(t.date);

      return (
        tradeDate.getMonth() ===
        selectedMonth
      );

    })
    .reduce(
      (sum, t) =>
        sum + Number(t.profit || 0),
      0
    );

  // 🎨 CALENDAR COLORS
  const tileClassName = ({
    date,
    view,
  }) => {

    if (view !== "month")
      return "";

    const d = formatDate(date);

    const dayTrades = trades.filter(
      t =>
        t.date === d &&
        t.kind !== "withdrawal" &&
        t.kind !== "deposit"
    );

    if (!dayTrades.length)
      return "";

    const profit = dayTrades.reduce(
      (sum, t) =>
        sum + Number(t.profit || 0),
      0
    );

    if (profit > 0)
      return "profit-day";

    if (profit < 0)
      return "loss-day";

    return "";
  };

  return (
    <div>

      {/* 🔥 TITLE */}
      <h1 className="text-3xl mb-6">
        Calendar
      </h1>

      {/* ================= MONTH SELECTOR ================= */}

      <div className="mb-6 bg-gray-900 p-4 rounded-xl">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* 📅 MONTH DROPDOWN */}
          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(
                Number(e.target.value)
              )
            }
            className="bg-black border border-gray-700 p-3 rounded-lg"
          >

            <option value={0}>
              January
            </option>

            <option value={1}>
              February
            </option>

            <option value={2}>
              March
            </option>

            <option value={3}>
              April
            </option>

            <option value={4}>
              May
            </option>

            <option value={5}>
              June
            </option>

            <option value={6}>
              July
            </option>

            <option value={7}>
              August
            </option>

            <option value={8}>
              September
            </option>

            <option value={9}>
              October
            </option>

            <option value={10}>
              November
            </option>

            <option value={11}>
              December
            </option>

          </select>

          {/* 💰 MONTH PROFIT */}
          <div>

            <p className="text-gray-400">
              Month Profit
            </p>

            <h2
              className={`text-2xl font-bold ${
                monthProfit >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              ${monthProfit.toFixed(2)}
            </h2>

          </div>

        </div>

      </div>

      {/* ================= CALENDAR ================= */}

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={tileClassName}
      />

      {/* ================= DAY DETAILS ================= */}

      <div className="bg-gray-900 p-6 mt-6 rounded-xl">

        <h2 className="text-xl mb-4">
          {selected}
        </h2>

        {/* 📊 STATS */}
        <div className="grid grid-cols-2 gap-4 mb-4">

          {/* PROFIT */}
          <div>

            <p className="text-gray-400">
              Total Profit
            </p>

            <p
              className={
                totalProfit >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              ${totalProfit.toFixed(2)}
            </p>

          </div>

          {/* TRADES */}
          <div>

            <p className="text-gray-400">
              Trades
            </p>

            <p>{totalTrades}</p>

          </div>

          {/* WIN RATE */}
          <div>

            <p className="text-gray-400">
              Win Rate
            </p>

            <p>{winRate}%</p>

          </div>

          {/* RR */}
          <div>

            <p className="text-gray-400">
              Avg R:R (Wins)
            </p>

            <p>{avgRR}</p>

          </div>

        </div>

        {/* ================= TRADES ================= */}

        {tradesForDay.length === 0 && (

          <p className="text-gray-500">
            No trades for this day.
          </p>

        )}

        {tradesForDay.map(
          (trade, index) => (

            <div
              key={index}
              className="bg-gray-800 p-4 mb-3 rounded-xl"
            >

              {/* ASSET */}
              <p className="font-semibold">
                {trade.asset}
              </p>

              {/* BUY / SELL */}
              <p
                className={
                  trade.type === "Buy"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {trade.type}
              </p>

              {/* ENTRY EXIT */}
              <p>
                Entry: {trade.entry}
                {" | "}
                Exit: {trade.exit}
              </p>

              {/* PROFIT */}
              <p
                className={
                  trade.profit >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                Profit: $
                {Number(
                  trade.profit || 0
                ).toFixed(2)}
              </p>

              {/* RR */}
              <p>
                RR: {trade.rr || 0}
              </p>

              {/* NOTES */}
              {trade.lesson && (

                <div className="mt-2">

                  <p className="text-gray-400">
                    Lesson
                  </p>

                  <p>{trade.lesson}</p>

                </div>

              )}

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

          )
        )}

      </div>

    </div>
  );
}