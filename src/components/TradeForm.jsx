import { useState } from "react";

export default function TradeForm({ addTrade }) {
  const [trade, setTrade] = useState({
    asset: "",
    entry: "",
    exit: "",
    type: "Buy",
    note: "",
    emotion: "",
    lesson: "",
    tag: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const profit = trade.exit - trade.entry;

    addTrade({ ...trade, profit });

    setTrade({
      asset: "",
      entry: "",
      exit: "",
      type: "Buy",
      note: "",
      emotion: "",
      lesson: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-xl mb-6">

      <input
        placeholder="Asset (BTC/USD)"
        className="block mb-2 p-2 text-black w-full"
        value={trade.asset}
        onChange={(e) => setTrade({ ...trade, asset: e.target.value })}
      />

      <input
        type="number"
        placeholder="Entry Price"
        className="block mb-2 p-2 text-black w-full"
        value={trade.entry}
        onChange={(e) => setTrade({ ...trade, entry: +e.target.value })}
      />

      <input
        type="number"
        placeholder="Exit Price"
        className="block mb-2 p-2 text-black w-full"
        value={trade.exit}
        onChange={(e) => setTrade({ ...trade, exit: +e.target.value })}
      />

      <textarea
        placeholder="What happened in this trade?"
        className="block mb-2 p-2 text-black w-full"
        value={trade.note}
        onChange={(e) => setTrade({ ...trade, note: e.target.value })}
      />

      <input
        placeholder="Emotion (e.g. confident, anxious)"
        className="block mb-2 p-2 text-black w-full"
        value={trade.emotion}
        onChange={(e) => setTrade({ ...trade, emotion: e.target.value })}
      />

      <textarea
        placeholder="Lesson learned"
        className="block mb-2 p-2 p-2 text-black w-full"
        value={trade.lesson}
        onChange={(e) => setTrade({ ...trade, lesson: e.target.value })}
      />
<input
  placeholder="Tag (e.g. scalp, breakout)"
  className="block mb-2 p-2 text-black w-full"
  value={trade.tag || ""}
  onChange={(e) => setTrade({ ...trade, tag: e.target.value })}
/>
      <button className="bg-white text-black px-4 py-2 mt-2 w-full">
        Add Trade
      </button>
    </form>
  );
}