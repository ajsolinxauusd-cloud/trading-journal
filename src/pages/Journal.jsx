import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function Journal() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);

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

  // ✅ Extract levels from TradingView chart link
  const extractFromChartLink = (url) => {
    if (!url) return null;

    try {
      // Method 1: Parse URL parameters (if chart link contains levels)
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      const extracted = {
        entry: params.get('entry') || params.get('price'),
        takeProfit: params.get('tp') || params.get('takeProfit'),
        stopLoss: params.get('sl') || params.get('stopLoss'),
      };

      // Method 2: Parse from TradingView chart URL pattern
      // Example: https://www.tradingview.com/chart/?symbol=BTCUSD&entry=50000&tp=55000&sl=49000
      if (!extracted.entry && url.includes('symbol=')) {
        // Try to extract from common patterns
        const entryMatch = url.match(/[?&]entry=([^&]+)/);
        const tpMatch = url.match(/[?&]tp=([^&]+)/);
        const slMatch = url.match(/[?&]sl=([^&]+)/);
        
        if (entryMatch) extracted.entry = entryMatch[1];
        if (tpMatch) extracted.takeProfit = tpMatch[1];
        if (slMatch) extracted.stopLoss = slMatch[1];
      }

      // Method 3: Parse from chart image URL (if using screenshot URL)
      // Example: Extract from filename or path
      if (!extracted.entry && (url.includes('.png') || url.includes('.jpg'))) {
        // Try to extract numbers from filename
        const numbers = url.match(/(\d+\.?\d*)/g);
        if (numbers && numbers.length >= 3) {
          extracted.entry = numbers[0];
          extracted.takeProfit = numbers[1];
          extracted.stopLoss = numbers[2];
        }
      }

      return extracted;
    } catch (error) {
      console.error("Error parsing URL:", error);
      return null;
    }
  };

  // ✅ Auto-fill from chart link
  const handleAutoExtract = () => {
    if (!form.screenshot) {
      alert("Please paste a chart link first");
      return;
    }

    setExtracting(true);
    
    try {
      const extracted = extractFromChartLink(form.screenshot);
      
      if (extracted) {
        let updates = {};
        
        if (extracted.entry && !form.entry) {
          updates.entry = extracted.entry;
        }
        if (extracted.takeProfit && !form.takeProfit) {
          updates.takeProfit = extracted.takeProfit;
        }
        if (extracted.stopLoss && !form.stopLoss) {
          updates.stopLoss = extracted.stopLoss;
        }
        
        if (Object.keys(updates).length > 0) {
          setForm({ ...form, ...updates });
          alert(`Auto-filled: ${Object.keys(updates).join(', ')}`);
        } else {
          alert("No trading levels found in the link. Please enter manually.");
        }
      } else {
        alert("Could not extract levels from this link. Please enter manually.");
      }
    } catch (error) {
      console.error("Extraction error:", error);
      alert("Error extracting levels. Please enter manually.");
    } finally {
      setExtracting(false);
    }
  };

  // ✅ Manual entry helper for quick RR calculation
  const calculateSuggestedTP = () => {
    if (form.entry && form.stopLoss) {
      const entry = Number(form.entry);
      const stopLoss = Number(form.stopLoss);
      const risk = Math.abs(entry - stopLoss);
      
      // Suggest TP at 2x risk (1:2 RR)
      let suggestedTP;
      if (form.type === "Buy") {
        suggestedTP = entry + (risk * 2);
      } else {
        suggestedTP = entry - (risk * 2);
      }
      
      if (window.confirm(`Suggested Take Profit (1:2 RR): ${suggestedTP.toFixed(2)}\nAuto-fill?`)) {
        setForm({ ...form, takeProfit: suggestedTP.toFixed(2) });
      }
    } else {
      alert("Please enter Entry and Stop Loss first");
    }
  };

  const calculateSuggestedSL = () => {
    if (form.entry && form.takeProfit) {
      const entry = Number(form.entry);
      const takeProfit = Number(form.takeProfit);
      const reward = Math.abs(takeProfit - entry);
      
      // Suggest SL at 0.5x reward (1:2 RR)
      let suggestedSL;
      if (form.type === "Buy") {
        suggestedSL = entry - (reward / 2);
      } else {
        suggestedSL = entry + (reward / 2);
      }
      
      if (window.confirm(`Suggested Stop Loss (1:2 RR): ${suggestedSL.toFixed(2)}\nAuto-fill?`)) {
        setForm({ ...form, stopLoss: suggestedSL.toFixed(2) });
      }
    } else {
      alert("Please enter Entry and Take Profit first");
    }
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

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Date not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-white">Loading trades...</div>;
  }

  return (
    <div>
      <h1 className="text-5xl font-bold mb-8">Journal</h1>

      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-2xl mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Asset *</label>
            <input
              name="asset"
              value={form.asset}
              onChange={handleChange}
              placeholder="Asset *"
              className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
            >
              <option>Buy</option>
              <option>Sell</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Entry *</label>
            <input
              name="entry"
              type="number"
              step="any"
              value={form.entry}
              onChange={handleChange}
              placeholder="Entry *"
              className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Exit *</label>
            <input
              name="exit"
              type="number"
              step="any"
              value={form.exit}
              onChange={handleChange}
              placeholder="Exit *"
              className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Stop Loss</label>
            <div className="flex gap-2">
              <input
                name="stopLoss"
                type="number"
                step="any"
                value={form.stopLoss}
                onChange={handleChange}
                placeholder="Stop Loss"
                className="flex-1 p-3 bg-black border border-gray-700 rounded-lg text-white"
              />
              <button
                type="button"
                onClick={calculateSuggestedSL}
                className="px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                title="Calculate from Entry & Take Profit"
              >
                Auto SL
              </button>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Take Profit</label>
            <div className="flex gap-2">
              <input
                name="takeProfit"
                type="number"
                step="any"
                value={form.takeProfit}
                onChange={handleChange}
                placeholder="Take Profit"
                className="flex-1 p-3 bg-black border border-gray-700 rounded-lg text-white"
              />
              <button
                type="button"
                onClick={calculateSuggestedTP}
                className="px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                title="Calculate from Entry & Stop Loss"
              >
                Auto TP
              </button>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Lot Size *</label>
            <input
              name="lot"
              type="number"
              step="any"
              value={form.lot}
              onChange={handleChange}
              placeholder="Lot Size *"
              className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Tag</label>
            <input
              name="tag"
              value={form.tag}
              onChange={handleChange}
              placeholder="Tag (e.g., BTC, EURUSD)"
              className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-gray-400 text-sm mb-1 block">Chart/Screenshot Link</label>
            <div className="flex gap-2">
              <input
                name="screenshot"
                value={form.screenshot}
                onChange={handleChange}
                placeholder="TradingView link or screenshot URL"
                className="flex-1 p-3 bg-black border border-gray-700 rounded-lg text-white"
              />
              <button
                type="button"
                onClick={handleAutoExtract}
                disabled={extracting}
                className="px-6 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold disabled:opacity-50"
              >
                {extracting ? "Extracting..." : "Auto-Fill"}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              💡 Paste TradingView link with parameters: ?entry=50000&tp=55000&sl=49000
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-gray-400 text-sm mb-1 block">Lesson learned...</label>
          <textarea
            name="lesson"
            value={form.lesson}
            onChange={handleChange}
            placeholder="Lesson learned..."
            className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white min-h-[120px]"
          />
        </div>

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
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{trade.asset}</h3>
                    <span className="text-gray-400 text-sm">
                      📅 {formatDisplayDate(trade.date)}
                    </span>
                  </div>
                </div>
                <span className={`font-bold px-3 py-1 rounded ${trade.type === "Buy" ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>
                  {trade.type}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                <div>
                  <p className="text-gray-400 text-sm">Entry</p>
                  <p className="font-semibold">{trade.entry}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Exit</p>
                  <p className="font-semibold">{trade.exit}</p>
                </div>
                {trade.stopLoss && (
                  <div>
                    <p className="text-gray-400 text-sm">Stop Loss</p>
                    <p className="font-semibold text-red-400">{trade.stopLoss}</p>
                  </div>
                )}
                {trade.takeProfit && (
                  <div>
                    <p className="text-gray-400 text-sm">Take Profit</p>
                    <p className="font-semibold text-green-400">{trade.takeProfit}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-sm">Lot Size</p>
                  <p className="font-semibold">{trade.lot}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Profit/Loss</p>
                  <p className={`font-bold ${trade.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ${trade.profit}
                  </p>
                </div>
              </div>
              
              {trade.rr > 0 && (
                <div className="mb-2">
                  <span className="bg-yellow-900 text-yellow-400 px-2 py-1 rounded text-sm">
                    R:R {trade.rr}
                  </span>
                </div>
              )}
              
              {trade.tag && (
                <div className="mb-2">
                  <span className="bg-blue-900 text-blue-400 px-2 py-1 rounded text-sm">
                    #{trade.tag}
                  </span>
                </div>
              )}
              
              {trade.lesson && (
                <div className="mt-3 p-3 bg-black rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">📝 Lesson:</p>
                  <p className="text-gray-300">{trade.lesson}</p>
                </div>
              )}
              
              {trade.screenshot && (
                <div className="mt-3">
                  <a href={trade.screenshot} target="_blank" rel="noreferrer" className="text-blue-400 underline hover:text-blue-300">
                    📸 View Chart
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}