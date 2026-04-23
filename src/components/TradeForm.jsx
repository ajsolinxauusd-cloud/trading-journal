import { useState } from "react";

export default function TradeForm({ addTrade }) {
  const [trade, setTrade] = useState({
    asset: "",
    type: "Buy",
    entry: "",
    exit: "",
    note: "",
    emotion: "",
    lesson: "",
    tag: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    let profit;

    if (trade.type === "Buy") {
      profit = trade.exit - trade.entry;
    } else {
      profit = trade.entry - trade.exit;
    }

    addTrade({ ...trade, profit });

    setTrade({
      asset: "",
      type: "Buy",
      entry: "",
      exit: "",
      note: "",
      emotion: "",
      lesson: "",
      tag: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-xl mb-6">

      {/* Asset */}
      <input
        placeholder="Asset (BTC/USD)"
        className="block mb-2 p-2 text-black w-full"
        value={trade.asset}
        onChange={(e) => setTrade({ ...trade, asset: e.target.value })}
      />

      {/* ✅ BUY / SELL DROPDOWN */}
      <select
        className="block mb-2 p-2 text-black w-full"
        value={trade.type}
        onChange={(e) => setTrade({ ...trade, type: e.target.value })}
      >
        <option value="Buy">Buy</option>
        <option value="Sell">Sell</option>
      </select>

      {/* Entry */}
      <input
        type="number"
        placeholder="Entry Price"
        className="block mb-2 p-2 text-black w-full"
        value={trade.entry}
        onChange={(e) => setTrade({ ...trade, entry: +e.target.value })}
      />

      {/* Exit */}
      <input
        type="number"
        placeholder="Exit Price"
        className="block mb-2 p-2 text-black w-full"
        value={trade.exit}
        onChange={(e) => setTrade({ ...trade, exit: +e.target.value })}
      />

      {/* Note */}
      <textarea
        placeholder="What happened in the trade?"
        className="block mb-2 p-2 text-black w-full"
        value={trade.note}
        onChange={(e) => setTrade({ ...trade, note: e.target.value })}
      />

      {/* Emotion */}
      <input
        placeholder="Emotion"
        className="block mb-2 p-2 text-black w-full"
        value={trade.emotion}
        onChange={(e) => setTrade({ ...trade, emotion: e.target.value })}
      />

      {/* Lesson */}
      <textarea
        placeholder="Lesson learned"
        className="block mb-2 p-2 text-black w-full"
        value={trade.lesson}
        onChange={(e) => setTrade({ ...trade, lesson: e.target.value })}
      />

      {/* Tag */}
      <input
        placeholder="Tag"
        className="block mb-2 p-2 text-black w-full"
        value={trade.tag}
        onChange={(e) => setTrade({ ...trade, tag: e.target.value })}
      />

      <button className="bg-white text-black px-4 py-2 mt-2 w-full">
        Add Trade
      </button>

    </form>
  );
}