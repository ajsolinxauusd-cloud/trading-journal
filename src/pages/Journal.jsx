import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function Journal() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialForm = {
    asset: "",
    type: "Buy",
    entry: "",
    exit: "",
    stopLoss: "",
    takeProfit: "",
    lot: "",
    tag: "",
    lesson: "",
    screenshot: "",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "trades"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((t) => t.kind !== "withdrawal" && t.kind !== "deposit");

      setTrades(data);
    } catch (error) {
      console.error("Error fetching trades:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString("en-CA");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("You must be logged in");
      return;
    }

    // Validate required fields
    if (!form.asset || !form.entry || !form.exit || !form.lot) {
      alert("Please fill in all required fields (Asset, Entry, Exit, Lot Size)");
      return;
    }

    const entry = Number(form.entry);
    const exit = Number(form.exit);
    const stopLoss = form.stopLoss ? Number(form.stopLoss) : null;
    const takeProfit = form.takeProfit ? Number(form.takeProfit) : null;
    const lot = Number(form.lot);

    let profit = 0;

    if (form.type === "Buy") {
      profit = (exit - entry) * lot;
    } else {
      profit = (entry - exit) * lot;
    }

    let rr = 0;
    if (stopLoss && takeProfit) {
      const risk = Math.abs(entry - stopLoss) * lot;
      const reward = Math.abs(takeProfit - entry) * lot;
      rr = risk > 0 ? reward / risk : 0;
    }

    try {
      await addDoc(collection(db, "trades"), {
        kind: "trade",
        userId: auth.currentUser.uid,
        asset: form.asset,
        type: form.type,
        entry: entry,
        exit: exit,
        stopLoss: stopLoss,
        takeProfit: takeProfit,
        lot: lot,
        profit: Number(profit.toFixed(2)),
        rr: Number(rr.toFixed(2)),
        tag: form.tag || "",
        lesson: form.lesson || "",
        screenshot: form.screenshot || "",
        date: getTodayDate(),
        createdAt: new Date().toISOString(),
      });

      // Reset form
      setForm(initialForm);
      
      // Refresh trades list
      await fetchTrades();
      
      alert("Trade saved successfully!");
    } catch (error) {
      console.error("Error saving trade:", error);
      alert("Error saving trade: " + error.message);
    }
  };

  if (loading) {
    return <div className="text-white">Loading trades...</div>;
  }

  return (
    <div>
      <h1 className="text-5xl font-bold mb-8">Journal</h1>

      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-2xl mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="asset"
            value={form.asset}
            onChange={handleChange}
            placeholder="Asset *"
            className="p-3 bg-black border border-gray-700 rounded-lg text-white"
            required
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="p-3 bg-black border border-gray-700 rounded-lg text-white"
          >
            <option>Buy</option>
            <option>Sell</option>
          </select>

          <input
            name="entry"
            type="number"
            step="any"
            value={form.entry}
            onChange={handleChange}
            placeholder="Entry *"
            className="p-3 bg-black border border-gray-700 rounded-lg text-white"
            required
          />

          <input
            name="exit"
            type="number"
            step="any"
            value={form.exit}
            onChange={handleChange}
            placeholder="Exit *"
            className="p-3 bg-black border border-gray-700 rounded-lg text-white"
            required
          />

          <input
            name="stopLoss"
            type="number"
            step="any"
            value={form.stopLoss}
            onChange={handleChange}
            placeholder="Stop Loss (optional)"
            className="p-3 bg-black border border-gray-700 rounded-lg text-white"
          />

          <input
            name="takeProfit"
            type="number"
            step="any"
            value={form.takeProfit}
            onChange={handleChange}
            placeholder="Take Profit (optional)"
            className="p-3 bg-black border border-gray-700 rounded-lg text-white"
          />

          <input
            name="lot"
            type="number"
            step="any"
            value={form.lot}
            onChange={handleChange}
            placeholder="Lot Size *"
            className="p-3 bg-black border border-gray-700 rounded-lg text-white"
            required
          />

          <input
            name="tag"
            value={form.tag}
            onChange={handleChange}
            placeholder="Tag (e.g., BTC, EURUSD)"
            className="p-3 bg-black border border-gray-700 rounded-lg text-white"
          />

          <input
            name="screenshot"
            value={form.screenshot}
            onChange={handleChange}
            placeholder="Screenshot URL"
            className="p-3 bg-black border border-gray-700 rounded-lg text-white"
          />
        </div>

        <textarea
          name="lesson"
          value={form.lesson}
          onChange={handleChange}
          placeholder="Lesson learned..."
          className="w-full mt-4 p-3 bg-black border border-gray-700 rounded-lg text-white min-h-[120px]"
        />

        <button type="submit" className="mt-4 w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-semibold">
          Save Trade
        </button>
      </form>

      {/* Display Trades */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Recent Trades</h2>
        {trades.length === 0 ? (
          <p className="text-gray-400">No trades yet. Add your first trade above!</p>
        ) : (
          trades.map((trade) => (
            <div key={trade.id} className="bg-gray-900 p-5 rounded-xl">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold">{trade.asset}</h3>
                  <p className="text-gray-400 text-sm">{trade.date}</p>
                </div>
                <span className={`font-bold ${trade.type === "Buy" ? "text-green-400" : "text-red-400"}`}>
                  {trade.type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <p>Entry: {trade.entry}</p>
                <p>Exit: {trade.exit}</p>
                <p>Lot: {trade.lot}</p>
                <p className={trade.profit >= 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                  Profit: ${trade.profit}
                </p>
              </div>
              {trade.lesson && <p className="text-gray-300 mt-2">📝 {trade.lesson}</p>}
              {trade.screenshot && (
                <a href={trade.screenshot} target="_blank" rel="noreferrer" className="text-blue-400 underline mt-2 inline-block">
                  View Screenshot
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}