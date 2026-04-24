import { useState } from "react";

export default function TradeForm({ addTrade }) {
  const [trade, setTrade] = useState({
    kind: "trade",
    date: new Date().toISOString().split("T")[0],
    asset: "",
    type: "Buy",
    entry: "",
    exit: "",
    lot: "",
    stopLoss: "",
    amount: "",
    note: "",
    emotion: "",
    lesson: "",
    tag: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔻 WITHDRAWAL
    if (trade.kind === "withdrawal") {
      addTrade({
        ...trade,
        profit: -Math.abs(trade.amount),
        type: "Withdrawal",
      });

      setTrade({
        ...trade,
        amount: "",
      });

      return;
    }

    // 📈 NORMAL TRADE
    let profit = 0;

    if (trade.type === "Buy") {
      profit = (trade.exit - trade.entry) * trade.lot;
    } else {
      profit = (trade.entry - trade.exit) * trade.lot;
    }

    const risk = Math.abs(trade.entry - trade.stopLoss) * trade.lot;
    const reward = Math.abs(profit);
    const rr = risk ? (reward / risk).toFixed(2) : 0;

    addTrade({ ...trade, profit, risk, rr });

    // Reset
    setTrade({
      kind: "trade",
      date: new Date().toISOString().split("T")[0],
      asset: "",
      type: "Buy",
      entry: "",
      exit: "",
      lot: "",
      stopLoss: "",
      amount: "",
      note: "",
      emotion: "",
      lesson: "",
      tag: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-xl mb-6">

      {/* Type Selector */}
      <select
        className="block mb-2 p-2 text-black w-full"
        value={trade.kind}
        onChange={(e) =>
          setTrade({ ...trade, kind: e.target.value })
        }
      >
        <option value="trade">Trade</option>
        <option value="withdrawal">Withdrawal</option>
      </select>

      {/* Date */}
      <input
        type="date"
        className="block mb-2 p-2 text-black w-full"
        value={trade.date}
        onChange={(e) =>
          setTrade({ ...trade, date: e.target.value })
        }
      />

      {/* 🔻 Withdrawal Mode */}
      {trade.kind === "withdrawal" && (
        <input
          type="number"
          placeholder="Withdrawal Amount"
          className="block mb-2 p-2 text-black w-full"
          value={trade.amount}
          onChange={(e) =>
            setTrade({ ...trade, amount: Number(e.target.value) })
          }
        />
      )}

      {/* 📈 Trade Mode */}
      {trade.kind === "trade" && (
        <>
          <input
            placeholder="Asset"
            className="block mb-2 p-2 text-black w-full"
            value={trade.asset}
            onChange={(e) =>
              setTrade({ ...trade, asset: e.target.value })
            }
          />

          <select
            className="block mb-2 p-2 text-black w-full"
            value={trade.type}
            onChange={(e) =>
              setTrade({ ...trade, type: e.target.value })
            }
          >
            <option value="Buy">Buy</option>
            <option value="Sell">Sell</option>
          </select>

          <input
            type="number"
            placeholder="Entry"
            className="block mb-2 p-2 text-black w-full"
            value={trade.entry}
            onChange={(e) =>
              setTrade({ ...trade, entry: Number(e.target.value) })
            }
          />

          <input
            type="number"
            placeholder="Exit"
            className="block mb-2 p-2 text-black w-full"
            value={trade.exit}
            onChange={(e) =>
              setTrade({ ...trade, exit: Number(e.target.value) })
            }
          />

          <input
            type="number"
            placeholder="Lot Size"
            className="block mb-2 p-2 text-black w-full"
            value={trade.lot}
            onChange={(e) =>
              setTrade({ ...trade, lot: Number(e.target.value) })
            }
          />

          <input
            type="number"
            placeholder="Stop Loss"
            className="block mb-2 p-2 text-black w-full"
            value={trade.stopLoss}
            onChange={(e) =>
              setTrade({ ...trade, stopLoss: Number(e.target.value) })
            }
          />
        </>
      )}

      <button className="bg-white text-black px-4 py-2 mt-2 w-full">
        Add Entry
      </button>

    </form>
  );
}