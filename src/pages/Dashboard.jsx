import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Dashboard() {

  const [trades, setTrades] = useState([]);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    const snapshot = await getDocs(collection(db, "trades"));

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // SORT BY DATE
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    setTrades(data);
  };

  // =========================================
  // REAL TRADES ONLY
  // =========================================

  const realTrades = trades.filter(
    (t) => t.kind !== "deposit" && t.kind !== "withdrawal"
  );

  // =========================================
  // WIN RATE
  // =========================================

  const wins = realTrades.filter((t) => t.profit > 0).length;

  const losses = realTrades.filter((t) => t.profit < 0).length;

  const pieData = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses },
  ];

  const COLORS = ["#16a34a", "#dc2626"];

  // =========================================
  // CURRENT WEEK
  // =========================================

  const today = new Date();

  const firstDay = new Date(today);

  firstDay.setDate(today.getDate() - today.getDay());

  firstDay.setHours(0, 0, 0, 0);

  // =========================================
  // ALL TRANSACTIONS BEFORE THIS WEEK
  // =========================================

  const previousTransactions = trades.filter(
    (t) => new Date(t.date) < firstDay
  );

  // =========================================
  // STARTING BALANCE
  // =========================================

  let startingBalance = 0;

  previousTransactions.forEach((t) => {

    if (t.kind === "deposit") {
      startingBalance += Number(t.amount || 0);
    }

    else if (t.kind === "withdrawal") {
      startingBalance -= Number(t.amount || 0);
    }

    else {
      startingBalance += Number(t.profit || 0);
    }

  });

  // =========================================
  // CURRENT WEEK TRANSACTIONS
  // =========================================

  const weeklyTransactions = trades.filter(
    (t) => new Date(t.date) >= firstDay
  );

  // =========================================
  // EQUITY CURVE
  // =========================================

  let runningEquity = startingBalance;

  const equityData = weeklyTransactions.map((t) => {

    // DEPOSIT
    if (t.kind === "deposit") {
      runningEquity += Number(t.amount || 0);
    }

    // WITHDRAWAL
    else if (t.kind === "withdrawal") {
      runningEquity -= Number(t.amount || 0);
    }

    // TRADE
    else {
      runningEquity += Number(t.profit || 0);
    }

    return {
      date: t.date,
      equity: Number(runningEquity.toFixed(2)),
    };

  });

  // =========================================
  // CURRENT EQUITY
  // =========================================

  const currentEquity =
    equityData.length > 0
      ? equityData[equityData.length - 1].equity
      : startingBalance;

  // =========================================
  // WEEK PROFIT
  // =========================================

  const weekProfit = weeklyTransactions.reduce((sum, t) => {

    if (t.kind === "deposit") {
      return sum + Number(t.amount || 0);
    }

    if (t.kind === "withdrawal") {
      return sum - Number(t.amount || 0);
    }

    return sum + Number(t.profit || 0);

  }, 0);

  return (
    <div>

      <h1 className="text-4xl font-bold mb-6">
        Dashboard
      </h1>

      {/* ============================= */}
      {/* TOP STATS */}
      {/* ============================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <div className="bg-gray-900 p-6 rounded-2xl">
          <p className="text-gray-400">
            Starting Balance
          </p>

          <h2 className="text-3xl font-bold text-blue-400">
            ${startingBalance.toFixed(2)}
          </h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl">
          <p className="text-gray-400">
            Current Equity
          </p>

          <h2 className="text-3xl font-bold text-green-400">
            ${currentEquity.toFixed(2)}
          </h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl">
          <p className="text-gray-400">
            Weekly Change
          </p>

          <h2
            className={`text-3xl font-bold ${
              weekProfit >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            ${weekProfit.toFixed(2)}
          </h2>
        </div>

      </div>

      {/* ============================= */}
      {/* CHARTS */}
      {/* ============================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PIE CHART */}

        <div className="bg-gray-900 p-6 rounded-2xl">

          <h2 className="text-2xl mb-4">
            Win Rate
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                label
              >

                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}

              </Pie>

              <Legend />

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* EQUITY CURVE */}

        <div className="bg-gray-900 p-6 rounded-2xl">

          <h2 className="text-2xl mb-4">
            Weekly Equity Curve
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={equityData}>

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="equity"
                stroke="#22c55e"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}