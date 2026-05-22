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

  const [withdrawAmount, setWithdrawAmount] =
    useState("");

  const [depositAmount, setDepositAmount] =
    useState("");

  useEffect(() => {
    fetchTrades();
  }, []);

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

  // ✅ ONLY REAL TRADES
  const realTrades = trades.filter(
    (t) =>
      t.kind !== "withdrawal" &&
      t.kind !== "deposit"
  );

  // ✅ TOTAL PROFIT
  const totalProfit = realTrades.reduce(
    (sum, t) =>
      sum + Number(t.profit || 0),
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
        (wins.length /
          realTrades.length) *
        100
      ).toFixed(1)
    : "0.0";

  // ✅ AVG RR
  const winningTrades = realTrades.filter(
    (t) => Number(t.profit) > 0
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

      if (t.kind === "withdrawal") {
        return (
          sum - Number(t.amount || 0)
        );
      }

      if (t.kind === "deposit") {
        return (
          sum + Number(t.amount || 0)
        );
      }

      return (
        sum + Number(t.profit || 0)
      );

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

  // ✅ START OF WEEK
  const startOfWeek = new Date();

  startOfWeek.setDate(
    startOfWeek.getDate() -
      startOfWeek.getDay()
  );

  // ✅ SORT TRADES
  const sortedTrades = [...trades].sort(
    (a, b) =>
      new Date(a.date) -
      new Date(b.date)
  );

  // ✅ EQUITY BEFORE WEEK
  let startingEquity = 0;

  sortedTrades.forEach((trade) => {

    const tradeDate = new Date(
      trade.date
    );

    if (tradeDate < startOfWeek) {

      if (trade.kind === "withdrawal") {
        startingEquity -= Number(
          trade.amount || 0
        );
      }

      else if (
        trade.kind === "deposit"
      ) {
        startingEquity += Number(
          trade.amount || 0
        );
      }

      else {
        startingEquity += Number(
          trade.profit || 0
        );
      }

    }

  });

  // ✅ CURRENT WEEK
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

        if (trade.kind === "withdrawal") {

          newEquity -= Number(
            trade.amount || 0
          );

        }

        else if (
          trade.kind === "deposit"
        ) {

          newEquity += Number(
            trade.amount || 0
          );

        }

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

  // ✅ WITHDRAW
  const handleWithdraw = async () => {

    const amount = Number(
      withdrawAmount
    );

    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

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

  // ✅ DEPOSIT
  const handleDeposit = async () => {

    const amount = Number(
      depositAmount
    );

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

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

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

        <div className="bg-gray-900 p-6 rounded-2xl">

          <p className="text-gray-400">
            Win Rate
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {winRate}%
          </h2>

        </div>

        <div className="bg-gray-900 p-6 rounded-2xl">

          <p className="text-gray-400">
            Avg R:R (Wins)
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {avgRR}
          </h2>

        </div>

        <div className="bg-gray-900 p-6 rounded-2xl">

          <p className="text-gray-400">
            Current Equity
          </p>

          <h2 className="text-4xl font-bold mt-2 text-blue-400">
            ${currentEquity.toFixed(2)}
          </h2>

        </div>

      </div>
    </div>
  );
}