import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {

  const [trades, setTrades] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    fetchTrades();
  }, []);

  // ✅ FETCH TRADES
  const fetchTrades = async () => {

    const snapshot = await getDocs(
      collection(db, "trades")
    );

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTrades(data);
  };

  // ✅ REAL TRADES ONLY
  const realTrades = trades.filter(
    t => t.kind !== "withdrawal"
  );

  // ✅ TOTAL PROFIT
  const totalProfit = realTrades.reduce(
    (sum, t) => sum + Number(t.profit || 0),
    0
  );

  // ✅ WIN / LOSS
  const wins = realTrades.filter(
    t => t.profit > 0
  ).length;

  const losses = realTrades.filter(
    t => t.profit < 0
  ).length;

  // ✅ WIN RATE
  const winRate = realTrades.length
    ? (
        (wins / realTrades.length) * 100
      ).toFixed(1)
    : 0;

  // ✅ RR (ONLY WINNING TRADES)
  const winningTrades = realTrades.filter(
    t => t.profit > 0
  );

  const avgRR = winningTrades.length
    ? (
        winningTrades.reduce(
          (sum, t) => sum + Number(t.rr || 0),
          0
        ) / winningTrades.length
      ).toFixed(2)
    : 0;

  // ✅ EQUITY CURVE
  // WITHDRAWALS INCLUDED
  const performanceData = trades
    .sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    )
    .reduce((acc, item, index) => {

      const previous =
        index === 0
          ? 0
          : acc[index - 1].equity;

      let change = 0;

      // ✅ NORMAL TRADE
      if (item.kind !== "withdrawal") {
        change = Number(item.profit || 0);
      }

      // ✅ WITHDRAWAL
      if (item.kind === "withdrawal") {
        change = -Number(item.amount || 0);
      }

      acc.push({
        date: item.date,
        equity: previous + change,
      });

      return acc;

    }, []);

  // ✅ ACCOUNT EQUITY
  const accountEquity = performanceData.length
    ? performanceData[
        performanceData.length - 1
      ].equity
    : 0;

  // ✅ WITHDRAW FUNCTION
  const handleWithdraw = async () => {

    if (!withdrawAmount) return;

    await addDoc(collection(db, "trades"), {

      kind: "withdrawal",

      amount: Number(withdrawAmount),

      // ✅ LOCAL DEVICE DATE
      date: new Date().toLocaleDateString("en-CA"),

    });

    setWithdrawAmount("");

    fetchTrades();
  };

  return (
    <div>

      {/* 🔥 TITLE */}
      <h1 className="text-3xl mb-6">
        Dashboard
      </h1>

      {/* ================= STATS ================= */}

      <div className="grid md:grid-cols-5 gap-4">

        {/* 💰 TOTAL PROFIT */}
        <div className="bg-gray-900 p-5 rounded-2xl">

          <p className="text-gray-400">
            Total Profit
          </p>

          <h2 className="text-2xl text-green-400 mt-2">
            ${totalProfit.toFixed(2)}
          </h2>

        </div>

        {/* 💹 ACCOUNT EQUITY */}
        <div className="bg-gray-900 p-5 rounded-2xl">

          <p className="text-gray-400">
            Account Equity
          </p>

          <h2 className="text-2xl mt-2">
            ${accountEquity.toFixed(2)}
          </h2>

        </div>

        {/* 📊 WIN RATE */}
        <div className="bg-gray-900 p-5 rounded-2xl">

          <p className="text-gray-400">
            Win Rate
          </p>

          <h2 className="text-2xl mt-2">
            {winRate}%
          </h2>

        </div>

        {/* 🎯 AVG RR */}
        <div className="bg-gray-900 p-5 rounded-2xl">

          <p className="text-gray-400">
            Avg R:R (Wins)
          </p>

          <h2 className="text-2xl mt-2">
            {avgRR}
          </h2>

        </div>

        {/* 💸 WITHDRAW */}
        <div className="bg-gray-900 p-5 rounded-2xl">

          <p className="text-gray-400 mb-2">
            Withdraw
          </p>

          <input
            type="number"
            placeholder="Amount"
            value={withdrawAmount}
            onChange={(e) =>
              setWithdrawAmount(e.target.value)
            }
            className="w-full p-2 rounded bg-black border border-gray-700"
          />

          <button
            onClick={handleWithdraw}
            className="mt-3 w-full bg-red-600 hover:bg-red-700 p-2 rounded"
          >
            Withdraw
          </button>

        </div>

      </div>

      {/* ================= CHARTS ================= */}

      <div className="grid md:grid-cols-2 gap-6 mt-8">

        {/* 📊 PIE CHART */}
        <div className="bg-gray-900 p-6 rounded-2xl">

          <h2 className="text-xl mb-4">
            Win vs Loss
          </h2>

          <div className="h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={[
                    {
                      name: "Wins",
                      value: wins,
                    },
                    {
                      name: "Losses",
                      value: losses,
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >

                  <Cell fill="#16a34a" />
                  <Cell fill="#dc2626" />

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* 📈 EQUITY CURVE */}
        <div className="bg-gray-900 p-6 rounded-2xl">

          <h2 className="text-xl mb-4">
            Equity Curve
          </h2>

          <div className="h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart data={performanceData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                />

                <XAxis
                  dataKey="date"
                  stroke="#999"
                />

                <YAxis stroke="#999" />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="equity"
                  stroke="#16a34a"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>
  );
}