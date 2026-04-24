import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default function Dashboard() {
  const [trades, setTrades] = useState([]);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    const snapshot = await getDocs(collection(db, "trades"));
    const data = snapshot.docs.map(doc => doc.data());
    setTrades(data);
  };

  // 🔥 FILTER REAL TRADES ONLY
  const onlyTrades = trades.filter(t => t.kind !== "withdrawal");

  // 📊 PERFORMANCE
  const totalTrades = onlyTrades.length;

  const totalProfit = onlyTrades.reduce((sum, t) => sum + t.profit, 0);

  const wins = onlyTrades.filter(t => t.profit > 0).length;

  const winRate = totalTrades
    ? ((wins / totalTrades) * 100).toFixed(1)
    : 0;

  const avgRR = totalTrades
    ? (
        onlyTrades.reduce((sum, t) => sum + Number(t.rr || 0), 0) /
        totalTrades
      ).toFixed(2)
    : 0;

  // 💰 EQUITY (includes withdrawals)
  const equity = trades.reduce((sum, t) => sum + t.profit, 0);

  // 🔻 HANDLE WITHDRAWAL
  const handleWithdraw = async () => {
    if (!amount) return;

    await addDoc(collection(db, "trades"), {
      kind: "withdrawal",
      amount: Number(amount),
      profit: -Math.abs(amount),
      date: new Date().toISOString().split("T")[0],
      type: "Withdrawal",
    });

    setAmount("");
    fetchTrades(); // refresh
  };

  return (
    <div>

      <h1 className="text-3xl mb-6">Dashboard</h1>

      {/* 📊 STATS */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        <div>
          <p className="text-gray-400">Total Trades</p>
          <p>{totalTrades}</p>
        </div>

        <div>
          <p className="text-gray-400">Win Rate</p>
          <p>{winRate}%</p>
        </div>

        <div>
          <p className="text-gray-400">Net Profit</p>
          <p className={totalProfit >= 0 ? "text-green-400" : "text-red-400"}>
            {totalProfit}
          </p>
        </div>

        <div>
          <p className="text-gray-400">Avg R:R</p>
          <p>{avgRR}</p>
        </div>

      </div>

      {/* 💰 EQUITY */}
      <div className="bg-gray-900 p-4 rounded-xl mb-6">
        <p className="text-gray-400">Account Equity</p>
        <p className={equity >= 0 ? "text-green-400" : "text-red-400"}>
          {equity}
        </p>
      </div>

      {/* 🔻 WITHDRAWAL PANEL */}
      <div className="bg-gray-900 p-4 rounded-xl">

        <h2 className="mb-4">Withdraw Funds</h2>

        <input
          type="number"
          placeholder="Enter amount"
          className="p-2 text-black w-full mb-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={handleWithdraw}
          className="bg-red-600 px-4 py-2 w-full"
        >
          Withdraw
        </button>

      </div>

    </div>
  );
}