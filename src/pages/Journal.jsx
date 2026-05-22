import { useEffect, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Journal() {
  const [trades, setTrades] = useState([]);

  const initialForm = {
    asset: "",
    type: "Buy",
    entry: "",
    exit: "",
    stopLoss: "",
    takeProfit: "",
    lot: "",
    rr: "",
    profit: "",
    tag: "",
    lesson: "",
    screenshot: "",
    date: new Date().toISOString().split("T")[0],
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    const snapshot = await getDocs(collection(db, "trades"));

    const data = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((t) => t.kind !== "withdrawal" && t.kind !== "deposit");

    setTrades(data.reverse());
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const entry = Number(form.entry);
    const exit = Number(form.exit);
    const stopLoss = Number(form.stopLoss);
    const takeProfit = Number(form.takeProfit);
    const lot = Number(form.lot);

    let profit = 0;

    if (form.type === "Buy") {
      profit = (exit - entry) * lot;
    } else {
      profit = (entry - exit) * lot;
    }

    const risk = Math.abs(entry - stopLoss) * lot;
    const reward = Math.abs(takeProfit - entry) * lot;

    const rr = risk > 0 ? reward / risk : 0;

    await addDoc(collection(db, "trades"), {
      kind: "trade",

      asset: form.asset,
      type: form.type,

      entry,
      exit,
      stopLoss,
      takeProfit,
      lot,

      profit: Number(profit.toFixed(2)),
      rr: Number(rr.toFixed(2)),

      // 🔥 IMPORTANT FIX: ALWAYS SAVE THESE
      tag: form.tag || "",
      lesson: form.lesson || "",
      screenshot: form.screenshot || "",
      date: form.date,
    });

    setForm(initialForm);
    fetchTrades();
  };

  return (
    <div>
      <h1 className="text-5xl font-bold mb-8">Journal</h1>

      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-2xl mb-8">
        <div className="grid md:grid-cols-2 gap-4">

          <input name="asset" value={form.asset} onChange={handleChange} placeholder="Asset" className="p-3 bg-black border border-gray-700 rounded-lg" />

          <select name="type" value={form.type} onChange={handleChange} className="p-3 bg-black border border-gray-700 rounded-lg">
            <option>Buy</option>
            <option>Sell</option>
          </select>

          <input name="entry" type="number" value={form.entry} onChange={handleChange} placeholder="Entry" className="p-3 bg-black border border-gray-700 rounded-lg" />

          <input name="exit" type="number" value={form.exit} onChange={handleChange} placeholder="Exit" className="p-3 bg-black border border-gray-700 rounded-lg" />

          <input name="stopLoss" type="number" value={form.stopLoss} onChange={handleChange} placeholder="Stop Loss" className="p-3 bg-black border border-gray-700 rounded-lg" />

          <input name="takeProfit" type="number" value={form.takeProfit} onChange={handleChange} placeholder="Take Profit" className="p-3 bg-black border border-gray-700 rounded-lg" />

          <input name="lot" type="number" value={form.lot} onChange={handleChange} placeholder="Lot Size" className="p-3 bg-black border border-gray-700 rounded-lg" />

          <input name="tag" value={form.tag} onChange={handleChange} placeholder="Tag" className="p-3 bg-black border border-gray-700 rounded-lg" />

          <input name="screenshot" value={form.screenshot} onChange={handleChange} placeholder="Screenshot URL" className="p-3 bg-black border border-gray-700 rounded-lg" />

        </div>

        <textarea
          name="lesson"
          value={form.lesson}
          onChange={handleChange}
          placeholder="Lesson learned..."
          className="w-full mt-4 p-3 bg-black border border-gray-700 rounded-lg min-h-[120px]"
        />

        <button className="mt-4 w-full bg-green-600 p-3 rounded-lg">
          Save Trade
        </button>
      </form>
    </div>
  );
}