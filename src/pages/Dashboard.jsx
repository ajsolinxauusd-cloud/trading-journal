import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

import { db } from "../firebase";

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

  const [depositAmount, setDepositAmount] = useState("");

  useEffect(() => {
    fetchTrades();
  }, []);

  // ✅ FETCH
  const fetchTrades = async () => {

    const snapshot = await getDocs(
      collection(db, "trades")
    );

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTrades(data);
  };

  // ✅ REAL TRADES ONLY
  const realTrades = trades.filter(
    (t) =>
      t.kind !== "withdrawal" &&
      t.kind !== "deposit"
  );

  // ✅ TOTAL PROFIT
  const totalProfit = realTrades.reduce(
    (sum, t) => sum + Number(t.profit || 0),
    0
  );

  // ✅ WINS / LOSSES
  const wins = realTrades.filter(
    (t) => Number(t.profit) > 0
  );

  const losses = realTrades.filter(
    (t) => Number(t.profit) < 0
  );

  // ✅ WIN RATE
  const winRate = realTrades.length
    ? (
        (wins.length / realTrades.length) *
        100
      ).toFixed(1)
    : "0.0";

  // ✅ AVG RR (ONLY WINNING REAL TRADES)
  const winningTrades = realTrades.filter(
    (t) =>
      Number(t.profit) > 0 &&
      t.kind !== "withdrawal" &&
      t.kind !== "deposit"
  );

  const avgRR = winningTrades.length
    ? (
        winningTrades.reduce(
          (sum, t) =>
            sum + Number(t.rr || 0),
          0
        ) / winningTrades.length
      ).toFixed(2)
    : "0.00";

  // ✅ CURRENT EQUITY
  const currentEquity = trades.reduce(
    (sum, t) => {

      // WITHDRAWAL
      if (t.kind === "withdrawal") {
        return sum - Number(t.amount || 0);
      }

      // DEPOSIT
      if (t.kind === "deposit") {
        return sum + Number(t.amount || 0);
      }

      // TRADE
      return sum + Number(t.profit || 0);

    },
    0
  );

  // ✅ PIE CHART
  const pieData = [
    {
      name: "Wins",
      value: wins.length,
    },
    {
      name: "Losses",
      value: losses.length,
    },
  ];

  const COLORS = ["#16a34a", "#dc2626"];

  // ✅ START OF CURRENT WEEK
  const startOfWeek = new Date();

  startOfWeek.setDate(
    startOfWeek.getDate() -
      startOfWeek.getDay()
  );

  // ✅ SORT ALL ENTRIES
  const sortedTrades = [...trades].sort(
    (a, b) =>
      new Date(a.date) -
      new Date(b.date)
  );

  // ✅ EQUITY BEFORE CURRENT WEEK
  let startingEquity = 0;

  sortedTrades.forEach((trade) => {

    const tradeDate = new Date(
      trade.date
    );

    if (tradeDate < startOfWeek) {

      // WITHDRAWAL
      if (trade.kind === "withdrawal") {
        startingEquity -= Number(
          trade.amount || 0
        );
      }

      // DEPOSIT
      else if (trade.kind === "deposit") {
        startingEquity += Number(
          trade.amount || 0
        );
      }

      // TRADE
      else {
        startingEquity += Number(
          trade.profit || 0
        );
      }

    }

  });

  // ✅ CURRENT WEEK TRADES
  const currentWeekTrades =
    sortedTrades.filter((trade) => {

      const tradeDate = new Date(
        trade.date
      );

      return tradeDate >= startOfWeek;
    });

  // ✅ WEEKLY EQUITY CURVE
  const weeklyPerformanceData =
    currentWeekTrades.reduce(
      (acc, trade, index) => {

        const previous =
          index === 0
            ? startingEquity
            : acc[index - 1].equity;

        let newEquity = previous;

        // WITHDRAWAL
        if (trade.kind === "withdrawal") {
          newEquity -= Number(
            trade.amount || 0
          );
        }

        // DEPOSIT
        else if (trade.kind === "deposit") {
          newEquity += Number(
            trade.amount || 0
          );
        }

        // REAL TRADE
        else {
          newEquity += Number(
            trade.profit || 0
          );
        }

        acc.push({
          date: trade.date,
          equity: Number(
            newEquity.toFixed(2)
          ),
        });

        return acc;

      },
      []
    );

  // ✅ WITHDRAW FUNDS
  const handleWithdraw = async () => {

    const amount = Number(
      withdrawAmount
    );

    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    // ✅ MIN EQUITY 2.5
    if (
      currentEquity - amount <
      2.5
    ) {
      alert(
        "Equity cannot go below $2.5"
      );
      return;
    }

    await addDoc(
      collection(db, "trades"),
      {
        kind: "withdrawal",
        amount,
        date:
          new Date().toLocaleDateString(
            "en-CA"
          ),
      }
    );

    setWithdrawAmount("");

    fetchTrades();
  };

  // ✅ DEPOSIT FUNDS
  const handleDeposit = async () => {

    const amount = Number(
      depositAmount
    );

    // ✅ MIN DEPOSIT 2.5
    if (!amount || amount < 2.5) {
      alert(
        "Minimum deposit is $2.5"
      );
      return;
    }

    await addDoc(
      collection(db, "trades"),
      {
        kind: "deposit",
        amount,
        date:
          new Date().toLocaleDateString(
            "en-CA"
          ),
      }
    );

    setDepositAmount("");

    fetchTrades();
  };

  return (
    <div className="text-white">

      <h1 className="text-5xl font-bold mb-8">
        Dashboard
      </h1>

      {/* ✅ TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        {/* TOTAL PROFIT */}
        <div className="bg-gray-900 p-6 rounded-2xl">

          <p className="text-gray-400">
            Total Profit
          </p>

          <h2
            className={`text-4xl font-bold mt-2 ${
              totalProfit >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            ${totalProfit.toFixed(2)}
          </h2>

        </div>

        {/* WIN RATE */}
        <div className="bg-gray-900 p-6 rounded-2xl">

          <p className="text-gray-400">
            Win Rate
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {winRate}%
          </h2>

        </div>

        {/* AVG RR */}
        <div className="bg-gray-900 p-6 rounded-2xl">

          <p className="text-gray-400">
            Avg R:R (Wins)
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {avgRR}
          </h2>

        </div>

        {/* EQUITY */}
        <div className="bg-gray-900 p-6 rounded-2xl">

          <p className="text-gray-400">
            Current Equity
          </p>

          <h2 className="text-4xl font-bold mt-2 text-blue-400">
            ${currentEquity.toFixed(2)}
          </h2>

        </div>

      </div>

      {/* ✅ WITHDRAW + DEPOSIT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* WITHDRAW */}
        <div className="bg-gray-900 p-6 rounded-2xl">

          <h2 className="text-2xl mb-4">
            Withdraw Funds
          </h2>

          <input
            type="number"
            placeholder="Amount"
            value={withdrawAmount}
            onChange={(e) =>
              setWithdrawAmount(
                e.target.value
              )
            }
            className="w-full p-3 rounded-lg bg-black border border-gray-700 mb-4"
          />

          <button
            onClick={handleWithdraw}
            className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg font-semibold"
          >
            Withdraw
          </button>

        </div>

        {/* DEPOSIT */}
        <div className="bg-gray-900 p-6 rounded-2xl">

          <h2 className="text-2xl mb-4">
            Deposit Funds
          </h2>

          <input
            type="number"
            placeholder="Amount"
            value={depositAmount}
            onChange={(e) =>
              setDepositAmount(
                e.target.value
              )
            }
            className="w-full p-3 rounded-lg bg-black border border-gray-700 mb-4"
          />

          <button
            onClick={handleDeposit}
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-semibold"
          >
            Deposit
          </button>

        </div>

      </div>

      {/* ✅ CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* PIE CHART */}
        <div className="bg-gray-900 p-6 rounded-2xl">

          <h2 className="text-3xl mb-6">
            Win Rate
          </h2>

          <div className="h-[300px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={90}
                  label
                >

                  {pieData.map(
                    (entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          COLORS[index]
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* WEEKLY EQUITY CURVE */}
        <div className="bg-gray-900 p-6 rounded-2xl">

          <h2 className="text-3xl mb-6">
            Weekly Equity Curve
          </h2>

          <div className="h-[300px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={
                  weeklyPerformanceData
                }
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                />

                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                />

                <YAxis
                  stroke="#9ca3af"
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="equity"
                  stroke="#3b82f6"
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