import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function Dashboard() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const fetchTrades = async () => {
      const snapshot = await getDocs(collection(db, "trades"));
      const data = snapshot.docs.map(doc => doc.data());
      setTrades(data);
    };

    fetchTrades();
  }, []);

  // 📊 CALCULATIONS
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.profit > 0).length;
  const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;
  const netProfit = trades.reduce((sum, t) => sum + t.profit, 0);

   // ✅  EXPORT FUNCTION
  const exportCSV = () => {
  if (trades.length === 0) return;

  const headers = Object.keys(trades[0]).join(",");

  const rows = trades.map(trade =>
    Object.values(trade).join(",")
  );

  const csvContent = [headers, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "trades.csv";
  a.click();
};
  // 📈 EQUITY CURVE
  let runningBalance = 0;
  const chartData = trades.map((t, i) => {
    runningBalance += t.profit;
    return {
      name: `Trade ${i + 1}`,
      balance: runningBalance,
    };
  });

  return (
    <div>
      <button
  onClick={exportCSV}
  className="mb-6 bg-white text-black px-4 py-2 rounded"
>
  Export Trades (CSV)
</button>
      <h1 className="text-3xl mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-800 p-6 rounded-xl">
          <p>Total Trades</p>
          <h3 className="text-2xl mt-2">{totalTrades}</h3>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <p>Win Rate</p>
          <h3 className="text-2xl mt-2">{winRate}%</h3>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <p>Net Profit</p>
          <h3 className="text-2xl mt-2">${netProfit}</h3>
        </div>
      </div>

      {/* Equity Chart */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="mb-4">Equity Curve</h2>

        <LineChart width={600} height={300} data={chartData}>
          <CartesianGrid stroke="#444" />
          <XAxis dataKey="name" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Line type="monotone" dataKey="balance" stroke="#4ade80" />
        </LineChart>
      </div>
      <div className="mt-10">
  <h2 className="text-2xl mb-4">Strategy Performance</h2>

  {Object.entries(
    trades.reduce((acc, trade) => {
      const tag = trade.tag || "untagged";

      if (!acc[tag]) {
        acc[tag] = {
          total: 0,
          wins: 0,
          profit: 0,
        };
      }

      acc[tag].total += 1;
      acc[tag].profit += trade.profit;

      if (trade.profit > 0) {
        acc[tag].wins += 1;
      }

      return acc;
    }, {})
  ).map(([tag, data]) => {
    const winRate = ((data.wins / data.total) * 100).toFixed(1);

    return (
      <div key={tag} className="bg-gray-800 p-4 mb-4 rounded-xl">
        <p className="text-lg font-semibold">{tag}</p>
        <p>Total Trades: {data.total}</p>
        <p>Win Rate: {winRate}%</p>
        <p>Net Profit: ${data.profit}</p>
      </div>
    );
  })}
</div>
    </div>
  );
}